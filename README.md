# NousMD

A minimalist markdown editor following Dieter Rams' "Less, but better" design principles.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![No Dependencies](https://img.shields.io/badge/dependencies-none-green.svg)
![Offline](https://img.shields.io/badge/offline-capable-orange.svg)

## Philosophy

NousMD embodies Dieter Rams' 10 principles of good design:

1. **Innovative** - First-class offline markdown editor requiring zero setup
2. **Useful** - Every element serves a clear purpose; no decorative features
3. **Aesthetic** - Clean typography, restrained color palette, generous whitespace
4. **Understandable** - Self-explanatory interface; product structure mirrors user intent
5. **Unobtrusive** - Design recedes to let content take center stage
6. **Honest** - No false promises; transparent about capabilities and limitations
7. **Long-lasting** - Timeless design avoiding trends; will age gracefully
8. **Thorough** - Attention to detail in spacing, alignment, typography, interactions
9. **Environmentally friendly** - Minimal resource usage; efficient code; no waste
10. **As little design as possible** - Pure, simple, essential—nothing more

## Features

### Core Functionality
- **Split-pane interface** - Side-by-side editor and live preview
- **Real-time preview** - See your markdown rendered instantly
- **File operations** - Open and save `.md` files locally
- **Auto-save** - Content automatically saved to browser localStorage
- **Dark mode** - Toggle between light and dark themes
- **Keyboard shortcuts** - Fast, keyboard-first workflow

### Markdown Support
- Headers (H1-H6)
- Bold and italic text
- Links and images
- Ordered and unordered lists
- Code blocks (inline and fenced)
- Blockquotes
- Horizontal rules
- Strikethrough
- Tables (rendered in preview)

### Design
- **Restrained color palette** - Neutrals + single accent color
- **System fonts** - Native feel on every platform
- **8px spacing grid** - Mathematical precision
- **No decorative elements** - Pure functionality
- **Accessible** - WCAG 2.1 AA compliant, full keyboard navigation

## Getting Started

### Installation

No installation required! NousMD runs completely offline in your browser.

1. **Download** or clone this repository
2. **Open** `index.html` in any modern web browser
3. **Start writing** - that's it!

```bash
# Clone repository
git clone https://github.com/yourusername/nous-md.git

# Navigate to directory
cd nous-md

# Open in browser
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### Usage

#### Writing

Simply start typing in the left pane. The preview updates in real-time on the right.

#### Toolbar

Click toolbar buttons to insert markdown formatting:

- **B** - Bold text
- **I** - Italic text
- **H1/H2/H3** - Headers
- **Link icon** - Insert link
- **Image icon** - Insert image
- **List icons** - Ordered/unordered lists
- **Code icon** - Code block
- **Quote icon** - Blockquote

#### File Operations

- **Open** (folder icon) - Load a markdown file from your computer
- **Save** (disk icon) - Download current content as `.md` file
- **Clear** (trash icon) - Clear all content (with confirmation)

#### Dark Mode

Click the moon icon in the toolbar or press `Ctrl/Cmd + D`.

## Keyboard Shortcuts

### Formatting
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + K` - Insert link
- `Ctrl/Cmd + 1/2/3` - Headers (H1/H2/H3)
- `Ctrl/Cmd + U` - Unordered list
- `Ctrl/Cmd + Shift + O` - Ordered list
- `Ctrl/Cmd + Shift + C` - Code block
- `Ctrl/Cmd + Shift + Q` - Blockquote
- `Ctrl/Cmd + Shift + I` - Insert image

### File Operations
- `Ctrl/Cmd + S` - Save file
- `Ctrl/Cmd + O` - Open file
- `Ctrl/Cmd + Shift + N` - Clear editor

### Interface
- `Ctrl/Cmd + D` - Toggle dark mode
- `Tab` - Insert 4 spaces in editor

### Divider
- **Click and drag** the divider to resize panes
- Focus divider and use **Arrow Left/Right** to resize

## Technical Details

### Stack
- **HTML5** - Semantic markup
- **CSS3** - Grid/Flexbox layout, CSS variables
- **Vanilla JavaScript** - ES6+, no frameworks or libraries

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires ES6+ support and localStorage API.

### File Structure
```
nous-md/
├── index.html          # Main application file
├── styles.css          # Styling and design system
├── script.js           # Application logic
├── README.md           # This file
└── PRD.md             # Product requirements document
```

### Performance
- **Load time**: < 1 second
- **Preview update**: < 100ms
- **Total size**: < 100KB
- **No external requests** - Works completely offline

## Design System

### Colors (Light Mode)
- Background: `#FAFAFA`
- Text: `#1A1A1A`
- Secondary: `#4A4A4A`
- Border: `#E0E0E0`
- Accent: `#0066CC`

### Spacing Scale
Based on 8px unit: `4px, 8px, 16px, 24px, 32px, 48px, 64px`

### Typography
- **Font**: System fonts (-apple-system, Segoe UI, Roboto)
- **Monospace**: System monospace (SF Mono, Consolas)
- **Base size**: 16px
- **Line height**: 1.6 (body), 1.4 (headings)

## Privacy & Security

- **No tracking** - Zero analytics or telemetry
- **No external requests** - All processing happens locally
- **No server** - Runs entirely in your browser
- **localStorage only** - Content saved locally on your device
- **No data collection** - Your content never leaves your machine

## Contributing

NousMD follows strict design principles. When contributing:

1. Ensure changes align with Dieter Rams' principles
2. No new dependencies (keep it vanilla)
3. Maintain accessibility (WCAG 2.1 AA)
4. Follow existing code style
5. Test offline functionality
6. Keep total file size under 100KB

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Inspired by Dieter Rams' timeless design philosophy
- Built for writers who value simplicity and focus
- No frameworks harmed in the making of this editor

## FAQ

**Q: Does this work offline?**
A: Yes! Open `index.html` directly in your browser. No server needed.

**Q: Where is my content saved?**
A: Auto-saved to browser localStorage. Use Save button to download `.md` files.

**Q: Can I use this on mobile?**
A: Optimized for desktop/tablet. Mobile works but experience is limited.

**Q: Why no syntax highlighting in the editor?**
A: Following Rams' principle of "as little design as possible." The focus is on writing, not colorful text.

**Q: Will you add [feature X]?**
A: Only if it serves a clear user need without adding complexity. Feature requests welcome but will be evaluated against design principles.

**Q: Why build another markdown editor?**
A: Most editors prioritize features over experience. NousMD prioritizes clarity, focus, and timeless design.

---

**Less, but better.**
