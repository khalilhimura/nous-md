# Product Requirements Document (PRD)
## Markdown Editor - "NousMD"

### 1. Overview
A lightweight, offline-capable markdown editor built with vanilla HTML5, CSS, and JavaScript. The application provides a clean, distraction-free writing environment with live preview and basic markdown formatting tools.

**Design Philosophy**: Following Dieter Rams' "Less, but better" approach, this editor prioritizes functionality, clarity, and timeless design over trendy aesthetics or unnecessary features.

### 2. Goals & Objectives
- Create a simple, intuitive markdown editor that works completely offline
- No server dependencies or build process required
- Embrace Dieter Rams' design principles for a timeless, functional interface
- Fast and responsive user experience
- Easy to use for both beginners and experienced markdown users
- Design that remains relevant and usable for years to come

### 2.1 Dieter Rams' 10 Principles Applied

1. **Innovative**: First-class offline markdown editor requiring zero setup
2. **Useful**: Every element serves a clear purpose; no decorative features
3. **Aesthetic**: Clean typography, restrained color palette, generous whitespace
4. **Understandable**: Self-explanatory interface; product structure mirrors user intent
5. **Unobtrusive**: Design recedes to let content take center stage
6. **Honest**: No false promises; transparent about capabilities and limitations
7. **Long-lasting**: Timeless design avoiding trends; will age gracefully
8. **Thorough**: Attention to detail in spacing, alignment, typography, interactions
9. **Environmentally friendly**: Minimal resource usage; efficient code; no waste
10. **As little design as possible**: Pure, simple, essential—nothing more

### 3. Target Users
- Writers and content creators
- Developers writing documentation
- Students taking notes
- Anyone who prefers markdown for writing

### 4. Core Features

#### 4.1 Editor Functionality
- **Split-pane interface**: Side-by-side editor and live preview
- **Syntax highlighting** in the editor (basic)
- **Real-time preview** as user types
- **Responsive design** that works on desktop and tablet

#### 4.2 Markdown Support
Basic markdown formatting:
- Headers (H1-H6)
- Bold and Italic text
- Lists (ordered and unordered)
- Links
- Images
- Code blocks (inline and fenced)
- Blockquotes
- Horizontal rules
- Tables (basic support)
- Strikethrough

#### 4.3 Toolbar
Quick-access buttons for common formatting:
- Bold
- Italic
- Heading (H1, H2, H3)
- Link
- Image
- Unordered List
- Ordered List
- Code Block
- Quote
- Horizontal Rule

#### 4.4 File Operations
- **Save to file**: Download markdown content as .md file
- **Open file**: Load markdown from local .md files
- **LocalStorage**: Auto-save content to prevent data loss
- **Clear**: Clear editor content

#### 4.5 UI/UX Features (Rams-Inspired Design)

**Visual Design Principles:**
- **Restrained color palette**: Neutral grays, blacks, whites; single accent color for interactive elements
- **Typography-first**: Excellent readable fonts; clear hierarchy; generous line spacing
- **Whitespace**: Ample breathing room; never cluttered
- **Grid-based layout**: Precise alignment; mathematical proportions
- **Minimal visual noise**: No gradients, shadows only where functionally necessary
- **Honest materials**: Flat design; no skeuomorphism or fake textures

**Interaction Design:**
- **Immediate feedback**: Clear, subtle responses to all interactions
- **No unnecessary animations**: Motion only when it aids understanding
- **Keyboard-first**: All actions accessible via keyboard
- **Progressive disclosure**: Advanced features hidden until needed
- **Consistent patterns**: Same actions work the same way throughout

**Features:**
- Minimal toolbar with essential functions only
- Optional dark mode (light mode as default)
- Distraction-free mode (hide all chrome)
- Adjustable split-pane with subtle divider
- Keyboard shortcuts for all toolbar actions
- Auto-save indicator (subtle, unobtrusive)

### 5. Visual Design Specifications

#### 5.1 Color Palette
**Light Mode (Default):**
- Background: Off-white (#FAFAFA)
- Text: Near-black (#1A1A1A)
- Secondary text: Dark gray (#4A4A4A)
- Borders: Light gray (#E0E0E0)
- Accent: Muted blue (#0066CC) - for interactive elements only

**Dark Mode:**
- Background: Near-black (#1A1A1A)
- Text: Off-white (#FAFAFA)
- Secondary text: Light gray (#B0B0B0)
- Borders: Dark gray (#333333)
- Accent: Same muted blue (#0066CC)

#### 5.2 Typography
- **Primary font**: System fonts (SF Pro, Segoe UI, Roboto) for native feel
- **Monospace**: System monospace for code and editor
- **Base size**: 16px minimum for readability
- **Line height**: 1.6 for body text; 1.4 for headings
- **Scale**: Modular scale (1.25 ratio) for heading sizes

#### 5.3 Spacing System
- Base unit: 8px
- Scale: 4px, 8px, 16px, 24px, 32px, 48px, 64px
- Consistent margins and padding using this scale
- Generous whitespace: minimum 24px between major sections

#### 5.4 Layout Grid
- 8px base grid for all elements
- Maximum content width: 1200px
- Split pane: 50/50 default, adjustable from 30/70 to 70/30
- Toolbar: Fixed height (48px), subtle separation from content

#### 5.5 Interactive Elements
- **Buttons**: Minimal styling; clear affordance without heavy decoration
- **Focus states**: Subtle outline; never remove for accessibility
- **Hover states**: Subtle background change; no dramatic effects
- **Transitions**: 150ms ease-out; only for opacity and background
- **Icons**: Simple, geometric, 20px × 20px; aligned to pixel grid

### 6. Technical Requirements

#### 6.1 Technology Stack
- HTML5
- CSS3 (with CSS Grid/Flexbox for layout)
- Vanilla JavaScript (ES6+)
- No external dependencies or frameworks

#### 6.2 Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required
- LocalStorage API support

#### 6.3 Performance
- Instant load time (no build process)
- Real-time preview with minimal lag
- Efficient memory usage

#### 6.4 Offline Capability
- Must run as a single HTML file or simple file structure
- No web server required
- Can be opened directly in browser (file://)

### 7. Non-Functional Requirements

#### 7.1 Usability
- Intuitive interface requiring no tutorial
- Clear visual feedback for all actions
- Responsive and accessible design

#### 7.2 Maintainability
- Clean, well-documented code
- Modular structure for easy updates
- Clear separation of concerns (HTML/CSS/JS)

#### 7.3 Security
- No external scripts or resources
- All processing happens client-side
- No data sent to external servers

#### 7.4 Accessibility
- WCAG 2.1 AA compliance
- Full keyboard navigation support
- Semantic HTML for screen readers
- Sufficient color contrast (minimum 4.5:1)
- Focus indicators always visible

### 8. Out of Scope (V1)
- Collaborative editing
- Cloud storage integration
- Advanced markdown extensions (math equations, diagrams)
- Mobile app versions
- Export to PDF/Word
- Version control/history
- Spell checking
- Advanced syntax highlighting with syntax highlighter libraries
- Animated transitions or decorative effects
- Multiple theme options (only light/dark)
- Social features or analytics

### 9. Success Metrics

**Performance:**
- Application loads in under 1 second
- Preview updates in real-time (< 100ms lag)
- Works offline without any errors
- Total file size under 100KB

**Design Quality (Rams Principles):**
- User can start writing without reading instructions (Understandable)
- Interface elements align to 8px grid (Thorough)
- No visual elements without functional purpose (As little design as possible)
- Design feels timeless, not trendy (Long-lasting)
- Every interaction provides clear feedback (Useful)

**User Validation:**
- 90% of test users can perform basic tasks without help
- Zero decorative elements identified in design review
- Passes accessibility audit with no critical issues

### 10. File Structure
```
nous-md/
├── index.html          # Main application file
├── styles.css          # Styling
├── script.js           # Application logic
├── README.md           # Documentation
└── PRD.md             # This document
```

### 11. Implementation Priority

**Foundation (Must Have):**
1. HTML structure with semantic markup
2. CSS design system (colors, typography, spacing scale)
3. Split-pane layout with resizable divider
4. Basic editor textarea with monospace font
5. Live preview rendering (using marked.js or similar lightweight parser)

**Core Functionality:**
6. Toolbar with essential formatting buttons (minimal, icon-based)
7. File operations (open/save .md files)
8. LocalStorage auto-save with indicator
9. Keyboard shortcuts for all toolbar actions

**Polish:**
10. Dark mode toggle
11. Distraction-free mode
12. Responsive behavior for smaller screens
13. Focus states and accessibility audit
14. Final design review against Rams principles

### 12. Future Enhancements (V2+)

**Only if they serve clear user needs:**
- Export rendered HTML to file
- Word count and reading time (useful, not decorative)
- Find and replace functionality
- Print stylesheet (optimized for paper)
- Keyboard shortcut customization
- Export settings backup

**Explicitly NOT planned:**
- Multiple color themes (violates "as little design as possible")
- Animations or transitions beyond essential feedback
- Social features or sharing
- Analytics or tracking
- Customizable UI layouts
- Feature bloat of any kind
