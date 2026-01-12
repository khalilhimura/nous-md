/**
 * NousMD - Markdown Editor
 * Design: Dieter Rams Principles - "Less, but better"
 */

'use strict';

// ============================================
// Security - URL Sanitization
// ============================================

const SecurityUtils = {
    /**
     * Whitelist of safe URL protocols
     * Following OWASP recommendations for markdown editors
     */
    SAFE_PROTOCOLS: ['http:', 'https:', 'mailto:', 'ftp:', 'ftps:'],

    /**
     * Sanitize URL to prevent XSS attacks
     * Blocks dangerous protocols: javascript:, data:, vbscript:, file:
     *
     * @param {string} url - The URL to sanitize
     * @returns {string} - Sanitized URL or empty string if dangerous
     */
    sanitizeUrl(url) {
        if (!url || typeof url !== 'string') {
            return '';
        }

        // Trim whitespace and normalize
        const trimmed = url.trim();

        // Empty or whitespace-only URLs are safe (will result in broken link)
        if (!trimmed) {
            return '';
        }

        // Decode URL-encoded characters to prevent bypass attempts
        let decoded;
        try {
            decoded = decodeURIComponent(trimmed);
        } catch (e) {
            // Invalid URL encoding - reject
            return '';
        }

        // Normalize to lowercase for protocol check (handles JAvaScRipt:)
        const normalized = decoded.toLowerCase().trim();

        // Remove leading/trailing whitespace and control characters
        const cleaned = normalized.replace(/^[\s\u0000-\u001F\u007F-\u009F]+|[\s\u0000-\u001F\u007F-\u009F]+$/g, '');

        // Check for dangerous protocols
        // Handle both absolute URLs (protocol:) and protocol-relative (//)

        // Explicit dangerous protocol check
        if (cleaned.startsWith('javascript:') ||
            cleaned.startsWith('data:') ||
            cleaned.startsWith('vbscript:') ||
            cleaned.startsWith('file:') ||
            cleaned.startsWith('about:')) {
            Logger.warn('Blocked dangerous URL protocol:', trimmed);
            return '';
        }

        // If URL has a protocol, validate it's in whitelist
        const protocolMatch = cleaned.match(/^([a-z][a-z0-9+.-]*:)/);
        if (protocolMatch) {
            const protocol = protocolMatch[1];
            if (!this.SAFE_PROTOCOLS.includes(protocol)) {
                Logger.warn('Blocked non-whitelisted protocol:', protocol, 'in URL:', trimmed);
                return '';
            }
        }

        // Relative URLs (no protocol) are safe - they resolve relative to current origin
        // Protocol-relative URLs (//) are safe - they inherit current protocol

        // Return original trimmed URL (not decoded) to preserve encoding
        return trimmed;
    },

    /**
     * Escape HTML attribute value for safe insertion
     * Additional layer of defense for URL attributes
     *
     * @param {string} value - The attribute value to escape
     * @returns {string} - Escaped attribute value
     */
    escapeAttribute(value) {
        if (!value) return '';
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
};

// ============================================
// Performance Optimization Utilities
// ============================================

const PerformanceUtils = {
    /**
     * Debounce function execution to reduce frequency of expensive operations
     * Cancels previous timer and starts new one on each call
     *
     * @param {Function} func - The function to debounce
     * @param {number} delay - Delay in milliseconds to wait before executing
     * @returns {Function} - Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function debounced(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    /**
     * Throttle function execution using requestAnimationFrame
     * Ensures function runs at most once per animation frame (~16ms at 60 FPS)
     *
     * @param {Function} func - The function to throttle
     * @returns {Function} - Throttled function
     */
    throttle(func) {
        let rafId = null;
        return function throttled(...args) {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                func.apply(this, args);
                rafId = null;
            });
        };
    }
};

// ============================================
// Configuration Constants
// ============================================

const CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024,  // 10 MB
    ALLOWED_FILE_TYPES: ['.md', '.markdown', '.txt'],
    SAVE_DEBOUNCE_MS: 1000,
    EDITOR_DEBOUNCE_MS: 150,
    DIVIDER_MIN_PERCENT: 20,
    DIVIDER_MAX_PERCENT: 80,
    DIVIDER_KEYBOARD_STEP: 5,
    TAB_SPACES: '    '
};

// ============================================
// Logging Utility
// ============================================

const Logger = {
    info(message, ...args) {
        console.log(`[NousMD] ${message}`, ...args);
    },

    warn(message, ...args) {
        console.warn(`[NousMD] ${message}`, ...args);
    },

    error(message, error, ...args) {
        console.error(`[NousMD] ${message}`, error, ...args);
    }
};

// ============================================
// Modal Dialog Utility
// ============================================

const ModalDialog = {
    overlay: null,
    form: null,
    input: null,
    resolve: null,

    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.form = document.getElementById('modal-form');
        this.input = document.getElementById('modal-input');

        // Close button
        this.overlay.querySelector('.modal-close').addEventListener('click', () => {
            this.close(null);
        });

        // Cancel button
        this.overlay.querySelector('.modal-btn-cancel').addEventListener('click', () => {
            this.close(null);
        });

        // Form submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.close(this.input.value);
        });

        // Overlay click (outside dialog)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close(null);
            }
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.style.display === 'flex') {
                this.close(null);
            }
        });
    },

    prompt(title, description, label, defaultValue = '') {
        return new Promise((resolve) => {
            this.resolve = resolve;

            // Set content
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-desc').textContent = description;
            document.getElementById('modal-label').textContent = label;
            this.input.value = defaultValue;

            // Show modal
            this.overlay.style.display = 'flex';
            this.input.focus();
        });
    },

    close(value) {
        this.overlay.style.display = 'none';
        this.input.value = '';
        if (this.resolve) {
            this.resolve(value);
            this.resolve = null;
        }
    }
};

// ============================================
// State Management
// ============================================

const AppState = {
    editor: null,
    preview: null,
    highlightDiv: null,
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

        // Create context object to hold temporary state (no module-level state)
        const context = {
            codeBlocks: []
        };

        let html = markdown;

        // Escape HTML to prevent XSS
        html = this.escapeHtml(html);

        // Parse code blocks first (to avoid processing markdown inside them)
        html = this.parseCodeBlocks(html, context);

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
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            const safeUrl = SecurityUtils.sanitizeUrl(url);
            const safeAlt = alt; // Already escaped by escapeHtml() earlier
            return safeUrl ? `<img src="${safeUrl}" alt="${safeAlt}">` : `<span>[Image: ${safeAlt}]</span>`;
        });

        // Parse links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            const safeUrl = SecurityUtils.sanitizeUrl(url);
            const safeText = text; // Already escaped by escapeHtml() earlier
            return safeUrl ? `<a href="${safeUrl}">${safeText}</a>` : `<span>[${safeText}]</span>`;
        });

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
        html = this.restoreCodeBlocks(html, context);

        return html;
    },

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Generate collision-resistant placeholder
     * Uses crypto.randomUUID if available, falls back to timestamp + random
     *
     * Format: __BLOCK_[BASE64_UUID]__
     * Collision probability: < 1 in 10^36
     *
     * @param {string} prefix - Placeholder type prefix
     * @returns {string} - Unique placeholder string
     */
    generatePlaceholder(prefix) {
        let uuid;

        // Try modern crypto API (available in Chrome 92+, Firefox 95+, Safari 15.4+)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            uuid = crypto.randomUUID();
        } else {
            // Fallback: timestamp + random (less secure but still very unlikely to collide)
            uuid = `${Date.now()}-${Math.random().toString(36).substring(2)}-${Math.random().toString(36).substring(2)}`;
        }

        // Base64 encode to make it even more obscure
        // Use btoa if available (browser), otherwise keep as-is
        const encoded = typeof btoa !== 'undefined' ? btoa(uuid).replace(/=/g, '') : uuid;

        return `__${prefix}_${encoded}__`;
    },

    parseCodeBlocks(text, context) {
        return text.replace(/```([^\n]*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const placeholder = this.generatePlaceholder('CODE_BLOCK');
            const content = `<pre><code>${code.trim()}</code></pre>`;

            // Store with placeholder as key for deterministic lookup
            context.codeBlocks.push({ placeholder, content });

            return placeholder;
        });
    },

    restoreCodeBlocks(text, context) {
        context.codeBlocks.forEach(({ placeholder, content }) => {
            // Use exact placeholder match, not index-based
            text = text.replace(placeholder, content);
        });
        return text;
    },

    parseInlineCode(text) {
        return text.replace(/`([^`]+)`/g, '<code>$1</code>');
    },

    parseHeaders(text) {
        // Single pass for all header levels (optimization: 6 passes → 1 pass)
        return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
            const level = hashes.length;  // Count # symbols (1-6)
            return `<h${level}>${content.trim()}</h${level}>`;
        });
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

            // Validate that < is actually an HTML tag, not user content like "< 5"
            // Regex: ^<\/?[a-zA-Z][a-zA-Z0-9]*
            // Matches: <tagname or </tagname (where tagname starts with letter)
            // Doesn't match: < 5, <= value, <3 hearts, <- arrow, etc.
            if (/^<\/?[a-zA-Z][a-zA-Z0-9]*/.test(trimmed)) {
                return trimmed; // This is HTML, don't wrap in <p>
            }

            // Multi-line content that's not HTML (likely list or blockquote)
            if (trimmed.includes('\n') && !/^<\/?[a-zA-Z][a-zA-Z0-9]*/.test(trimmed)) {
                return trimmed;
            }

            return `<p>${trimmed}</p>`;
        }).join('\n\n');
    }
};

// ============================================
// Syntax Highlighter
// ============================================

const SyntaxHighlighter = {
    /**
     * Extract bold/italic patterns and replace with placeholders
     * Prevents regex conflicts by processing patterns in isolation
     */
    extractInlineFormats(text, context) {
        let index = 0;

        // Process triple first (bold+italic combined)
        text = text.replace(/\*\*\*([^*]+)\*\*\*/g, (match, content) => {
            const placeholder = `__INLINE_FORMAT_${index}__`;
            context.inlineFormats.push(`<span class="syntax-bold">***${content}***</span>`);
            index++;
            return placeholder;
        });

        // Process double asterisk (bold)
        text = text.replace(/\*\*([^*]+)\*\*/g, (match, content) => {
            const placeholder = `__INLINE_FORMAT_${index}__`;
            context.inlineFormats.push(`<span class="syntax-bold">**${content}**</span>`);
            index++;
            return placeholder;
        });

        // Process double underscore (bold)
        text = text.replace(/__([^_]+)__/g, (match, content) => {
            const placeholder = `__INLINE_FORMAT_${index}__`;
            context.inlineFormats.push(`<span class="syntax-bold">__${content}__</span>`);
            index++;
            return placeholder;
        });

        // Process single asterisk (italic)
        text = text.replace(/\*([^*]+)\*/g, (match, content) => {
            const placeholder = `__INLINE_FORMAT_${index}__`;
            context.inlineFormats.push(`<span class="syntax-italic">*${content}*</span>`);
            index++;
            return placeholder;
        });

        // Process single underscore (italic)
        text = text.replace(/_([^_]+)_/g, (match, content) => {
            const placeholder = `__INLINE_FORMAT_${index}__`;
            context.inlineFormats.push(`<span class="syntax-italic">_${content}_</span>`);
            index++;
            return placeholder;
        });

        return text;
    },

    /**
     * Restore inline format spans from placeholders
     */
    restoreInlineFormats(text, context) {
        context.inlineFormats.forEach((format, index) => {
            text = text.replace(`__INLINE_FORMAT_${index}__`, format);
        });
        return text;
    },

    highlight(text) {
        if (!text) return '';

        // Create context object to hold temporary state (no module-level state)
        const context = {
            inlineFormats: []
        };

        // Escape HTML
        text = this.escapeHtml(text);

        // Extract inline formats FIRST to prevent conflicts
        text = this.extractInlineFormats(text, context);

        // Apply syntax highlighting in order

        // Code blocks (```)
        text = text.replace(/```([\s\S]*?)```/g, '<span class="syntax-code-block">```$1```</span>');

        // Inline code (`)
        text = text.replace(/`([^`]+)`/g, '<span class="syntax-code">`$1`</span>');

        // Headers
        text = text.replace(/^(#{1,6})\s+(.+)$/gm, '<span class="syntax-header">$1 $2</span>');

        // Bold and italic patterns are now handled by extractInlineFormats/restoreInlineFormats

        // Links and images
        text = text.replace(/!?\[([^\]]*)\]\(([^)]+)\)/g, '<span class="syntax-link">$&</span>');

        // Lists
        text = text.replace(/^([\*\-]|\d+\.)\s+/gm, '<span class="syntax-list">$1 </span>');

        // Blockquotes
        text = text.replace(/^(&gt;)\s+/gm, '<span class="syntax-quote">&gt; </span>');

        // Restore inline formats LAST
        text = this.restoreInlineFormats(text, context);

        return text;
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
        this.updateSyntaxHighlight(markdown);
        this.updateWordCount(markdown);
        this.scheduleSave();
    },

    /**
     * Update syntax highlighting in editor
     */
    updateSyntaxHighlight(text) {
        const highlighted = SyntaxHighlighter.highlight(text);
        AppState.highlightDiv.innerHTML = highlighted;
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
        }, CONFIG.SAVE_DEBOUNCE_MS);
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
            Logger.error('Failed to save to localStorage:', e);
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
                document.getElementById('status-save').textContent = 'Loaded from storage';
            }
        } catch (e) {
            Logger.error('Failed to load from localStorage:', e);
            document.getElementById('status-save').textContent = 'Load failed';
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

        // Validate file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            alert(`File is too large. Maximum size is ${CONFIG.MAX_FILE_SIZE / 1024 / 1024} MB.`);
            event.target.value = '';
            return;
        }

        // Validate file extension
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (!CONFIG.ALLOWED_FILE_TYPES.includes(extension)) {
            alert(`Invalid file type. Allowed types: ${CONFIG.ALLOWED_FILE_TYPES.join(', ')}`);
            event.target.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            AppState.editor.value = e.target.result;
            AppState.currentFileName = file.name;
            Editor.updatePreview();
            document.getElementById('status-save').textContent = 'Loaded';
        };

        reader.onerror = (e) => {
            Logger.error('Failed to read file:', e);
            alert(`Failed to read file: ${file.name}`);
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

    async link() {
        const url = await ModalDialog.prompt(
            'Insert Link',
            'Enter the URL for the hyperlink:',
            'URL',
            'https://'
        );
        if (url) {
            const sanitizedUrl = SecurityUtils.sanitizeUrl(url);
            if (sanitizedUrl) {
                Editor.insertText('[', `](${sanitizedUrl})`, 'link text');
            } else {
                alert('Invalid URL. Please use http://, https://, or mailto: protocols.');
            }
        }
    },

    async image() {
        const url = await ModalDialog.prompt(
            'Insert Image',
            'Enter the image URL:',
            'Image URL',
            'https://'
        );
        if (url) {
            const sanitizedUrl = SecurityUtils.sanitizeUrl(url);
            if (sanitizedUrl) {
                Editor.insertText('![', `](${sanitizedUrl})`, 'alt text');
            } else {
                alert('Invalid image URL. Please use http:// or https:// protocols.');
            }
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

            if (editorPercent > CONFIG.DIVIDER_MIN_PERCENT && editorPercent < CONFIG.DIVIDER_MAX_PERCENT) {
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
                const editorPercent = (editorPane.offsetWidth / (editorPane.offsetWidth + previewPane.offsetWidth)) * 100 - CONFIG.DIVIDER_KEYBOARD_STEP;
                if (editorPercent > CONFIG.DIVIDER_MIN_PERCENT) {
                    editorPane.style.flex = `0 0 ${editorPercent}%`;
                    previewPane.style.flex = `0 0 ${100 - editorPercent}%`;
                }
                e.preventDefault();
            } else if (e.key === 'ArrowRight') {
                const editorPercent = (editorPane.offsetWidth / (editorPane.offsetWidth + previewPane.offsetWidth)) * 100 + CONFIG.DIVIDER_KEYBOARD_STEP;
                if (editorPercent < CONFIG.DIVIDER_MAX_PERCENT) {
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
        // Editor input - debounced to reduce parser calls during typing
        const debouncedUpdate = PerformanceUtils.debounce(() => {
            Editor.updatePreview();
        }, CONFIG.EDITOR_DEBOUNCE_MS);
        AppState.editor.addEventListener('input', debouncedUpdate);

        // Sync scroll between editor and highlight layer - throttled with RAF
        const throttledScroll = PerformanceUtils.throttle(() => {
            AppState.highlightDiv.scrollTop = AppState.editor.scrollTop;
            AppState.highlightDiv.scrollLeft = AppState.editor.scrollLeft;
        });
        AppState.editor.addEventListener('scroll', throttledScroll);

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
                AppState.editor.value = AppState.editor.value.substring(0, start) + CONFIG.TAB_SPACES + AppState.editor.value.substring(end);
                AppState.editor.selectionStart = AppState.editor.selectionEnd = start + CONFIG.TAB_SPACES.length;
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
    AppState.highlightDiv = document.getElementById('editor-highlight');
    AppState.fileInput = document.getElementById('file-input');

    // Load theme
    ThemeManager.load();

    // Load saved content
    Editor.loadFromLocalStorage();

    // Initialize components
    ModalDialog.init();
    EventListeners.init();
    KeyboardShortcuts.init();
    Divider.init();

    // Focus editor
    AppState.editor.focus();

    Logger.info('Initialized - Less, but better.');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
