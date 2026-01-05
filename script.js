/**
 * NousMD - Markdown Editor
 * Design: Dieter Rams Principles - "Less, but better"
 */

'use strict';

// ============================================
// State Management
// ============================================

const AppState = {
    editor: null,
    preview: null,
    fileInput: null,
    currentFileName: 'untitled.md',
    saveTimeout: null,
    isDarkMode: false,
    isResizing: false,
};

// ============================================
// Markdown Parser (Simple, Vanilla Implementation)
// ============================================

const MarkdownParser = {
    /**
     * Convert markdown text to HTML
     */
    parse(markdown) {
        if (!markdown) return '';

        let html = markdown;

        // Escape HTML to prevent XSS
        html = this.escapeHtml(html);

        // Parse code blocks first (to avoid processing markdown inside them)
        html = this.parseCodeBlocks(html);

        // Parse inline code
        html = this.parseInlineCode(html);

        // Parse headers
        html = this.parseHeaders(html);

        // Parse horizontal rules
        html = html.replace(/^---+$/gm, '<hr>');

        // Parse blockquotes
        html = this.parseBlockquotes(html);

        // Parse lists
        html = this.parseLists(html);

        // Parse images (before links)
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

        // Parse links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Parse bold and italic
        html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Parse strikethrough
        html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

        // Parse paragraphs
        html = this.parseParagraphs(html);

        // Restore code blocks
        html = this.restoreCodeBlocks(html);

        return html;
    },

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    codeBlocks: [],

    parseCodeBlocks(text) {
        this.codeBlocks = [];
        let index = 0;

        return text.replace(/```([^\n]*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const placeholder = `__CODE_BLOCK_${index}__`;
            this.codeBlocks.push(`<pre><code>${code.trim()}</code></pre>`);
            index++;
            return placeholder;
        });
    },

    restoreCodeBlocks(text) {
        this.codeBlocks.forEach((block, index) => {
            text = text.replace(`__CODE_BLOCK_${index}__`, block);
        });
        return text;
    },

    parseInlineCode(text) {
        return text.replace(/`([^`]+)`/g, '<code>$1</code>');
    },

    parseHeaders(text) {
        return text.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
            .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
            .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
            .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
            .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
            .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    },

    parseBlockquotes(text) {
        const lines = text.split('\n');
        const result = [];
        let inBlockquote = false;
        let blockquoteContent = [];

        lines.forEach(line => {
            if (line.startsWith('> ')) {
                if (!inBlockquote) {
                    inBlockquote = true;
                    blockquoteContent = [];
                }
                blockquoteContent.push(line.substring(2));
            } else {
                if (inBlockquote) {
                    result.push(`<blockquote>${blockquoteContent.join('\n')}</blockquote>`);
                    inBlockquote = false;
                    blockquoteContent = [];
                }
                result.push(line);
            }
        });

        if (inBlockquote) {
            result.push(`<blockquote>${blockquoteContent.join('\n')}</blockquote>`);
        }

        return result.join('\n');
    },

    parseLists(text) {
        const lines = text.split('\n');
        const result = [];
        let inUl = false;
        let inOl = false;

        lines.forEach(line => {
            const ulMatch = line.match(/^[\*\-]\s+(.+)$/);
            const olMatch = line.match(/^\d+\.\s+(.+)$/);

            if (ulMatch) {
                if (!inUl) {
                    if (inOl) {
                        result.push('</ol>');
                        inOl = false;
                    }
                    result.push('<ul>');
                    inUl = true;
                }
                result.push(`<li>${ulMatch[1]}</li>`);
            } else if (olMatch) {
                if (!inOl) {
                    if (inUl) {
                        result.push('</ul>');
                        inUl = false;
                    }
                    result.push('<ol>');
                    inOl = true;
                }
                result.push(`<li>${olMatch[1]}</li>`);
            } else {
                if (inUl) {
                    result.push('</ul>');
                    inUl = false;
                }
                if (inOl) {
                    result.push('</ol>');
                    inOl = false;
                }
                result.push(line);
            }
        });

        if (inUl) result.push('</ul>');
        if (inOl) result.push('</ol>');

        return result.join('\n');
    },

    parseParagraphs(text) {
        const blocks = text.split('\n\n');
        return blocks.map(block => {
            const trimmed = block.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('<')) return trimmed;
            if (trimmed.includes('\n') && !trimmed.startsWith('<')) {
                return trimmed;
            }
            return `<p>${trimmed}</p>`;
        }).join('\n\n');
    }
};

// ============================================
// Editor Functions
// ============================================

const Editor = {
    /**
     * Update preview with parsed markdown
     */
    updatePreview() {
        const markdown = AppState.editor.value;
        const html = MarkdownParser.parse(markdown);
        AppState.preview.innerHTML = html;
        this.updateWordCount(markdown);
        this.scheduleSave();
    },

    /**
     * Update word count in status bar
     */
    updateWordCount(text) {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        document.getElementById('status-words').textContent = `${words} word${words !== 1 ? 's' : ''}`;
    },

    /**
     * Schedule auto-save to localStorage
     */
    scheduleSave() {
        clearTimeout(AppState.saveTimeout);
        document.getElementById('status-save').textContent = 'Unsaved';

        AppState.saveTimeout = setTimeout(() => {
            this.saveToLocalStorage();
        }, 1000);
    },

    /**
     * Save content to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('nousmd-content', AppState.editor.value);
            localStorage.setItem('nousmd-timestamp', new Date().toISOString());
            document.getElementById('status-save').textContent = 'Saved';
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            document.getElementById('status-save').textContent = 'Save failed';
        }
    },

    /**
     * Load content from localStorage
     */
    loadFromLocalStorage() {
        try {
            const content = localStorage.getItem('nousmd-content');
            if (content) {
                AppState.editor.value = content;
                this.updatePreview();
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    },

    /**
     * Insert text at cursor position
     */
    insertText(before, after = '', placeholder = '') {
        const start = AppState.editor.selectionStart;
        const end = AppState.editor.selectionEnd;
        const selectedText = AppState.editor.value.substring(start, end);
        const text = selectedText || placeholder;

        const newText = before + text + after;
        const fullText = AppState.editor.value.substring(0, start) + newText + AppState.editor.value.substring(end);

        AppState.editor.value = fullText;

        // Set cursor position
        const newCursorPos = start + before.length + text.length;
        AppState.editor.selectionStart = newCursorPos;
        AppState.editor.selectionEnd = newCursorPos;

        AppState.editor.focus();
        this.updatePreview();
    },

    /**
     * Insert line prefix (for lists, quotes, etc.)
     */
    insertLinePrefix(prefix) {
        const start = AppState.editor.selectionStart;
        const text = AppState.editor.value;
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;

        const before = text.substring(0, lineStart);
        const after = text.substring(lineStart);

        AppState.editor.value = before + prefix + after;
        AppState.editor.selectionStart = lineStart + prefix.length;
        AppState.editor.selectionEnd = lineStart + prefix.length;

        AppState.editor.focus();
        this.updatePreview();
    }
};

// ============================================
// File Operations
// ============================================

const FileOperations = {
    /**
     * Open file dialog
     */
    openFile() {
        AppState.fileInput.click();
    },

    /**
     * Handle file selection
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            AppState.editor.value = e.target.result;
            AppState.currentFileName = file.name;
            Editor.updatePreview();
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    },

    /**
     * Save file
     */
    saveFile() {
        const content = AppState.editor.value;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = AppState.currentFileName;
        a.click();

        URL.revokeObjectURL(url);
    },

    /**
     * Clear editor
     */
    clearEditor() {
        if (AppState.editor.value.trim() === '') return;

        if (confirm('Clear all content? This cannot be undone.')) {
            AppState.editor.value = '';
            Editor.updatePreview();
            localStorage.removeItem('nousmd-content');
        }
    }
};

// ============================================
// Toolbar Actions
// ============================================

const ToolbarActions = {
    bold() {
        Editor.insertText('**', '**', 'bold text');
    },

    italic() {
        Editor.insertText('*', '*', 'italic text');
    },

    h1() {
        Editor.insertLinePrefix('# ');
    },

    h2() {
        Editor.insertLinePrefix('## ');
    },

    h3() {
        Editor.insertLinePrefix('### ');
    },

    link() {
        const url = prompt('Enter URL:');
        if (url) {
            Editor.insertText('[', `](${url})`, 'link text');
        }
    },

    image() {
        const url = prompt('Enter image URL:');
        if (url) {
            Editor.insertText('![', `](${url})`, 'alt text');
        }
    },

    ul() {
        Editor.insertLinePrefix('- ');
    },

    ol() {
        Editor.insertLinePrefix('1. ');
    },

    code() {
        Editor.insertText('```\n', '\n```', 'code here');
    },

    quote() {
        Editor.insertLinePrefix('> ');
    },

    open() {
        FileOperations.openFile();
    },

    save() {
        FileOperations.saveFile();
    },

    clear() {
        FileOperations.clearEditor();
    },

    'dark-mode': function() {
        ThemeManager.toggle();
    }
};

// ============================================
// Theme Manager
// ============================================

const ThemeManager = {
    toggle() {
        AppState.isDarkMode = !AppState.isDarkMode;
        document.body.classList.toggle('dark-mode', AppState.isDarkMode);
        localStorage.setItem('nousmd-dark-mode', AppState.isDarkMode);
    },

    load() {
        const savedTheme = localStorage.getItem('nousmd-dark-mode');
        if (savedTheme === 'true') {
            AppState.isDarkMode = true;
            document.body.classList.add('dark-mode');
        }
    }
};

// ============================================
// Resizable Divider
// ============================================

const Divider = {
    init() {
        const divider = document.querySelector('.divider');
        const editorPane = document.querySelector('.editor-pane');
        const previewPane = document.querySelector('.preview-pane');

        let startX = 0;
        let startEditorWidth = 0;

        const onMouseDown = (e) => {
            AppState.isResizing = true;
            startX = e.clientX;
            startEditorWidth = editorPane.offsetWidth;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!AppState.isResizing) return;

            const delta = e.clientX - startX;
            const newEditorWidth = startEditorWidth + delta;
            const totalWidth = editorPane.offsetWidth + previewPane.offsetWidth;
            const editorPercent = (newEditorWidth / totalWidth) * 100;

            if (editorPercent > 20 && editorPercent < 80) {
                editorPane.style.flex = `0 0 ${editorPercent}%`;
                previewPane.style.flex = `0 0 ${100 - editorPercent}%`;
            }
        };

        const onMouseUp = () => {
            AppState.isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        divider.addEventListener('mousedown', onMouseDown);

        // Keyboard support for divider
        divider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                const editorPercent = (editorPane.offsetWidth / (editorPane.offsetWidth + previewPane.offsetWidth)) * 100 - 5;
                if (editorPercent > 20) {
                    editorPane.style.flex = `0 0 ${editorPercent}%`;
                    previewPane.style.flex = `0 0 ${100 - editorPercent}%`;
                }
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                const editorPercent = (editorPane.offsetWidth / (editorPane.offsetWidth + previewPane.offsetWidth)) * 100 + 5;
                if (editorPercent < 80) {
                    editorPane.style.flex = `0 0 ${editorPercent}%`;
                    previewPane.style.flex = `0 0 ${100 - editorPercent}%`;
                }
                e.preventDefault();
            }
        });
    }
};

// ============================================
// Keyboard Shortcuts
// ============================================

const KeyboardShortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Check for Ctrl/Cmd key
            const isMod = e.ctrlKey || e.metaKey;

            if (!isMod) return;

            const shortcuts = {
                'b': () => ToolbarActions.bold(),
                'i': () => ToolbarActions.italic(),
                'k': () => ToolbarActions.link(),
                'u': () => ToolbarActions.ul(),
                's': () => { e.preventDefault(); ToolbarActions.save(); },
                'o': () => { e.preventDefault(); ToolbarActions.open(); },
                'd': () => { e.preventDefault(); ToolbarActions['dark-mode'](); },
                '1': () => ToolbarActions.h1(),
                '2': () => ToolbarActions.h2(),
                '3': () => ToolbarActions.h3(),
            };

            // Shift + Ctrl/Cmd shortcuts
            if (e.shiftKey) {
                const shiftShortcuts = {
                    'i': () => ToolbarActions.image(),
                    'o': () => ToolbarActions.ol(),
                    'c': () => ToolbarActions.code(),
                    'q': () => ToolbarActions.quote(),
                    'n': () => ToolbarActions.clear(),
                };

                if (shiftShortcuts[e.key.toLowerCase()]) {
                    e.preventDefault();
                    shiftShortcuts[e.key.toLowerCase()]();
                }
            } else if (shortcuts[e.key.toLowerCase()]) {
                e.preventDefault();
                shortcuts[e.key.toLowerCase()]();
            }
        });
    }
};

// ============================================
// Event Listeners
// ============================================

const EventListeners = {
    init() {
        // Editor input
        AppState.editor.addEventListener('input', () => {
            Editor.updatePreview();
        });

        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            const action = btn.getAttribute('data-action');
            btn.addEventListener('click', () => {
                if (ToolbarActions[action]) {
                    ToolbarActions[action]();
                }
            });
        });

        // File input
        AppState.fileInput.addEventListener('change', FileOperations.handleFileSelect);

        // Tab key in editor
        AppState.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = AppState.editor.selectionStart;
                const end = AppState.editor.selectionEnd;
                AppState.editor.value = AppState.editor.value.substring(0, start) + '    ' + AppState.editor.value.substring(end);
                AppState.editor.selectionStart = AppState.editor.selectionEnd = start + 4;
            }
        });
    }
};

// ============================================
// Initialization
// ============================================

function init() {
    // Get DOM elements
    AppState.editor = document.getElementById('editor');
    AppState.preview = document.getElementById('preview');
    AppState.fileInput = document.getElementById('file-input');

    // Load theme
    ThemeManager.load();

    // Load saved content
    Editor.loadFromLocalStorage();

    // Initialize components
    EventListeners.init();
    KeyboardShortcuts.init();
    Divider.init();

    // Focus editor
    AppState.editor.focus();

    console.log('NousMD initialized - Less, but better.');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
