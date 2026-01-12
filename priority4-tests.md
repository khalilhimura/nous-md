# NousMD Priority 4 Fixes - Test Suite

This document contains comprehensive test cases for verifying all Priority 4 fixes: accessibility improvements, UX enhancements, input validation, error handling, and code quality improvements.

---

## Test Summary

**Total Fixes**: 14 implemented (16 planned, 2 low-priority state refactorings deferred)
- ✅ **Phase 1**: Accessibility (3 fixes)
- ✅ **Phase 2**: UX Modal System (2 fixes)
- ✅ **Phase 3**: Validation & Error Handling (4 fixes)
- ✅ **Phase 4**: Code Quality (5 fixes)
- ⏭️ **Deferred**: State refactoring (2 items - low priority, working correctly)

---

## PART 1: ACCESSIBILITY TESTS

### Test A1: Skip Navigation Link

**Purpose**: Verify skip link allows keyboard users to bypass toolbar

**Test Steps**:
1. Open NousMD in browser
2. Press `Tab` key once
3. Observe skip link appears at top-left
4. Press `Enter` key
5. Verify focus moves to editor textarea

**Expected Results**:
- ✅ Skip link appears on focus (blue background, white text)
- ✅ Skip link says "Skip to editor"
- ✅ Pressing Enter moves focus to editor
- ✅ Skip link disappears when focus leaves

**Accessibility Check**:
- Test with screen reader (NVDA/JAWS/VoiceOver)
- Skip link should be announced
- Should work in all browsers

---

### Test A2: Dark Mode Color Contrast

**Purpose**: Verify all syntax colors meet WCAG AA standards (4.5:1 minimum)

**Test Steps**:
1. Open NousMD
2. Create document with varied syntax:
```markdown
# Header 1
## Header 2

`inline code`

```
code block
```

- List item
- Another item

> Blockquote text

<!-- Comment -->
```

3. Toggle dark mode (Ctrl+D or dark mode button)
4. Visually inspect all syntax colors
5. Use contrast checker tool (e.g., WebAIM)

**Expected Results - Light Mode**:
- ✅ Headers: `#0052A3` (dark blue) - Good contrast
- ✅ Code blocks: `#008080` (teal) - Good contrast
- ✅ Comments/quotes: `#4A4A4A` (gray) - Good contrast
- ✅ All meet WCAG AA 4.5:1 minimum

**Expected Results - Dark Mode**:
- ✅ Headers: `#66B3FF` (light blue) - 7:1 contrast
- ✅ Code blocks: `#66D9D9` (light teal) - 7:1 contrast
- ✅ Comments/quotes: `#D0D0D0` (light gray) - 8:1 contrast
- ✅ Opacity increased from 0.6 to 0.8 for comments
- ✅ All colors highly readable

**Test with Contrast Checker**:
- Background: `#1A1A1A` (dark)
- Test each syntax color
- Verify ratios >= 4.5:1 (AA) or 7:1 (AAA preferred)

---

### Test A3: ARIA Live Regions

**Purpose**: Verify status messages announced to screen readers

**Prerequisites**: Enable screen reader (NVDA, JAWS, or VoiceOver)

**Test Steps**:
1. Enable screen reader
2. Open NousMD
3. Type "Hello World" in editor
4. Wait 1 second for auto-save
5. Listen for announcement

**Expected Results**:
- ✅ Screen reader announces "Unsaved" when typing stops
- ✅ Screen reader announces "Saved" 1 second later
- ✅ Word count changes announced ("2 words")
- ✅ File load status announced ("Loaded from storage")

**ARIA Attributes Verified**:
- `role="status"` on #status-save and #status-words
- `aria-live="polite"` (announces after current speech)
- `aria-atomic="true"` (reads entire content on update)

---

## PART 2: UX IMPROVEMENTS

### Test U1: Modal Dialog for Links

**Purpose**: Verify modal replaces prompt(), validates URLs

**Test Steps**:
1. Open NousMD
2. Click "Insert Link" button (or Ctrl+K)
3. Observe modal dialog appears

**Expected Results - Modal Appearance**:
- ✅ Modal overlay (dark background)
- ✅ Dialog centered on screen
- ✅ Title: "Insert Link"
- ✅ Description: "Enter the URL for the hyperlink:"
- ✅ Label: "URL"
- ✅ Input pre-filled with "https://"
- ✅ Cancel and OK buttons visible

**Test Cases**:

**Case 1: Valid HTTP URL**
- Input: `https://example.com`
- Click OK
- ✅ Link inserted: `[link text](https://example.com)`

**Case 2: Valid HTTPS URL**
- Input: `http://example.com`
- Click OK
- ✅ Link inserted correctly

**Case 3: Valid mailto URL**
- Input: `mailto:test@example.com`
- Click OK
- ✅ Link inserted correctly

**Case 4: Invalid javascript: URL**
- Input: `javascript:alert('XSS')`
- Click OK
- ✅ Error alert: "Invalid URL. Please use http://, https://, or mailto: protocols."
- ✅ Link NOT inserted

**Case 5: Invalid data: URL**
- Input: `data:text/html,<script>alert('XSS')</script>`
- Click OK
- ✅ Error alert shown
- ✅ Link NOT inserted

**Case 6: Empty URL**
- Click OK without entering URL
- ✅ Nothing inserted (no error)

**Case 7: Cancel button**
- Enter URL
- Click Cancel
- ✅ Modal closes
- ✅ Nothing inserted

**Case 8: ESC key**
- Enter URL
- Press ESC key
- ✅ Modal closes
- ✅ Nothing inserted

**Case 9: Click outside**
- Enter URL
- Click on overlay (outside dialog)
- ✅ Modal closes
- ✅ Nothing inserted

---

### Test U2: Modal Dialog for Images

**Purpose**: Verify modal works for images, validates URLs

**Test Steps**:
1. Click "Insert Image" button (or Ctrl+Shift+I)
2. Observe modal appears

**Expected Results - Modal Appearance**:
- ✅ Title: "Insert Image"
- ✅ Description: "Enter the image URL:"
- ✅ Label: "Image URL"
- ✅ Input pre-filled with "https://"

**Test Cases**:

**Case 1: Valid image URL**
- Input: `https://example.com/image.png`
- Click OK
- ✅ Image inserted: `![alt text](https://example.com/image.png)`

**Case 2: Invalid javascript: URL**
- Input: `javascript:alert('XSS')`
- Click OK
- ✅ Error alert: "Invalid image URL. Please use http:// or https:// protocols."
- ✅ Image NOT inserted

**Case 3: Modal interactions**
- ✅ Cancel button works
- ✅ ESC key closes modal
- ✅ Click outside closes modal

---

## PART 3: INPUT VALIDATION & ERROR HANDLING

### Test V1: File Size Validation

**Purpose**: Verify files over 10MB are rejected

**Test Steps**:
1. Click "Open File" button
2. Select file larger than 10MB

**Expected Results**:
- ✅ Alert appears: "File is too large. Maximum size is 10 MB."
- ✅ File NOT loaded
- ✅ Editor content unchanged
- ✅ File input reset (can try again)

**Test Files**:
- Create test files: 5MB (should work), 15MB (should fail)
- Or use existing large files

---

### Test V2: File Type Validation

**Purpose**: Verify only .md, .markdown, .txt files accepted

**Test Steps**:
1. Click "Open File" button
2. Try to open various file types

**Test Cases**:

**Case 1: Valid .md file**
- Select `test.md`
- ✅ File loads successfully
- ✅ Status: "Loaded"

**Case 2: Valid .markdown file**
- Select `test.markdown`
- ✅ File loads successfully

**Case 3: Valid .txt file**
- Select `test.txt`
- ✅ File loads successfully

**Case 4: Invalid .docx file**
- Select `document.docx`
- ✅ Alert: "Invalid file type. Allowed types: .md, .markdown, .txt"
- ✅ File NOT loaded
- ✅ Editor unchanged

**Case 5: Invalid .pdf file**
- Select `document.pdf`
- ✅ Alert shown
- ✅ File NOT loaded

**Case 6: Invalid .html file**
- Select `page.html`
- ✅ Alert shown
- ✅ File NOT loaded

---

### Test V3: FileReader Error Handling

**Purpose**: Verify graceful error handling for file read failures

**Test Steps** (difficult to trigger naturally):
1. This tests the `reader.onerror` handler
2. In DevTools console, can simulate:
```javascript
// Manually trigger error event
const event = new Event('error');
fileReader.onerror(event);
```

**Expected Results**:
- ✅ Console error: `[NousMD] Failed to read file:` + error
- ✅ Alert: "Failed to read file: {filename}"
- ✅ Editor content preserved (not corrupted)

---

### Test V4: localStorage Error Handling

**Purpose**: Verify consistent error messages for storage failures

**Test Steps**:
1. Open NousMD
2. Type content
3. In DevTools, disable localStorage:
```javascript
// Simulate localStorage failure
localStorage.setItem = function() { throw new Error('Quota exceeded'); }
```
4. Trigger save

**Expected Results - Save Error**:
- ✅ Console: `[NousMD] Failed to save to localStorage:` + error
- ✅ Status bar: "Save failed"
- ✅ Editor content preserved

**Test Steps - Load Error**:
1. Refresh page
2. Check status bar

**Expected Results - Load Error**:
- ✅ Console: `[NousMD] Failed to load from localStorage:` + error
- ✅ Status bar: "Load failed"
- ✅ No crash or data loss

---

## PART 4: CODE QUALITY

### Test Q1: CONFIG Constants Verification

**Purpose**: Verify no hardcoded magic numbers in code

**Test Steps**:
1. Search codebase for hardcoded numeric literals
2. Verify all replaced with CONFIG constants

**Expected CONFIG Values**:
```javascript
CONFIG.MAX_FILE_SIZE = 10485760  // 10 MB
CONFIG.ALLOWED_FILE_TYPES = ['.md', '.markdown', '.txt']
CONFIG.SAVE_DEBOUNCE_MS = 1000
CONFIG.EDITOR_DEBOUNCE_MS = 150
CONFIG.DIVIDER_MIN_PERCENT = 20
CONFIG.DIVIDER_MAX_PERCENT = 80
CONFIG.DIVIDER_KEYBOARD_STEP = 5
CONFIG.TAB_SPACES = '    '  // 4 spaces
```

**Verification**:
- ✅ No `1000` in code (except in CONFIG)
- ✅ No `150` in code (except in CONFIG)
- ✅ No `20` or `80` in divider code
- ✅ No `5` in keyboard adjustment
- ✅ No `'    '` hardcoded string

**Test CONFIG Usage**:
- Debounce delay: Type and verify 150ms delay
- Save delay: Type and wait for "Saved" at 1s
- Divider min/max: Drag divider, verify 20-80% limits
- Keyboard adjust: Press arrow keys on divider, verify 5% steps
- Tab insertion: Press Tab in editor, verify 4 spaces inserted

---

### Test Q2: Logger Utility Verification

**Purpose**: Verify consistent logging format throughout app

**Test Steps**:
1. Open DevTools Console
2. Trigger various app events
3. Observe console messages

**Expected Log Format**:
- All messages prefixed with `[NousMD]`
- Info: `[NousMD] Initialized - Less, but better.`
- Warnings: `[NousMD] Blocked dangerous URL protocol: ...`
- Errors: `[NousMD] Failed to save to localStorage: ...`

**Test Cases**:

**Case 1: Initialization**
- Refresh page
- ✅ Console: `[NousMD] Initialized - Less, but better.`

**Case 2: Security Warning**
- Insert link with `javascript:alert('test')`
- ✅ Console: `[NousMD] Blocked dangerous URL protocol: javascript:alert('test')`

**Case 3: Storage Error**
- Simulate localStorage failure
- ✅ Console: `[NousMD] Failed to save to localStorage:` + error

**Case 4: File Read Error**
- Trigger file read error
- ✅ Console: `[NousMD] Failed to read file:` + error

**Verification**:
- ✅ NO plain `console.log()` calls (except in CONFIG definition)
- ✅ NO plain `console.warn()` calls
- ✅ NO plain `console.error()` calls
- ✅ All use `Logger.info()`, `Logger.warn()`, `Logger.error()`

---

## PART 5: REGRESSION TESTING

### Test R1: All Markdown Features Still Work

**Purpose**: Verify no regressions in markdown parsing

**Test Document**:
```markdown
# H1 Header
## H2 Header
### H3 Header

**Bold text**
*Italic text*
***Bold and italic***

`inline code`

```
code block
multiple lines
```

- Unordered list
- Item 2

1. Ordered list
2. Item 2

> Blockquote
> Multiple lines

[Link text](https://example.com)
![Alt text](https://example.com/image.png)

---

~~Strikethrough~~
```

**Expected Results**:
- ✅ All headers render correctly (h1-h6)
- ✅ Bold, italic, combined work
- ✅ Inline code works
- ✅ Code blocks preserved
- ✅ Lists (ordered and unordered) work
- ✅ Blockquotes work
- ✅ Links work
- ✅ Images work
- ✅ Horizontal rules work
- ✅ Strikethrough works

---

### Test R2: Toolbar Actions Work

**Purpose**: Verify all toolbar buttons function correctly

**Test Each Button**:
1. ✅ Bold (Ctrl+B) - Inserts `**text**`
2. ✅ Italic (Ctrl+I) - Inserts `*text*`
3. ✅ H1 (Ctrl+1) - Inserts `# `
4. ✅ H2 (Ctrl+2) - Inserts `## `
5. ✅ H3 (Ctrl+3) - Inserts `### `
6. ✅ Link (Ctrl+K) - Opens modal
7. ✅ Image (Ctrl+Shift+I) - Opens modal
8. ✅ UL (Ctrl+U) - Inserts `- `
9. ✅ OL (Ctrl+Shift+O) - Inserts `1. `
10. ✅ Code (Ctrl+Shift+C) - Inserts ``` blocks
11. ✅ Quote (Ctrl+Shift+Q) - Inserts `> `
12. ✅ Open (Ctrl+O) - Opens file dialog
13. ✅ Save (Ctrl+S) - Downloads file
14. ✅ Clear (Ctrl+Shift+N) - Clears editor
15. ✅ Dark Mode (Ctrl+D) - Toggles theme

---

### Test R3: File Operations Work

**Purpose**: Verify save/load functionality intact

**Test Steps**:
1. Type content in editor
2. Click Save button
3. Choose filename and location
4. Close browser
5. Reopen NousMD
6. Verify content restored from localStorage
7. Click Open button
8. Select saved file
9. Verify content loads

**Expected Results**:
- ✅ Auto-save to localStorage works
- ✅ Manual save downloads file
- ✅ Content restored on reload
- ✅ File open loads content
- ✅ Validation doesn't break file operations

---

### Test R4: Syntax Highlighting Works

**Purpose**: Verify syntax highlighting intact

**Test Steps**:
1. Type markdown syntax
2. Observe syntax highlighting in editor (left pane)
3. Toggle dark mode
4. Verify highlighting updates with new colors

**Expected Results**:
- ✅ Headers highlighted
- ✅ Bold/italic highlighted
- ✅ Code highlighted
- ✅ Links highlighted
- ✅ Lists highlighted
- ✅ Quotes highlighted
- ✅ Colors change correctly in dark mode

---

### Test R5: Performance Not Degraded

**Purpose**: Verify optimizations don't hurt performance

**Test Steps**:
1. Create large document (1000+ lines)
2. Type rapidly
3. Observe responsiveness

**Expected Results**:
- ✅ Typing feels responsive (150ms debounce imperceptible)
- ✅ Preview updates smoothly
- ✅ Scroll is smooth
- ✅ No lag or stuttering

**Measure with DevTools**:
- Open Performance tab
- Record typing session
- Check for long tasks (>50ms)
- Verify debouncing working (see reduced parse calls)

---

## PART 6: BROWSER COMPATIBILITY

### Test B1: Cross-Browser Testing

**Test in Multiple Browsers**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Verify**:
- ✅ Skip link works
- ✅ Modal dialog displays correctly
- ✅ ARIA live regions work with screen readers
- ✅ Dark mode colors correct
- ✅ File validation works
- ✅ All markdown features work
- ✅ No console errors

---

## MANUAL TESTING CHECKLIST

Use this checklist to verify all fixes:

### Accessibility
- [ ] Skip link appears on Tab, works correctly
- [ ] Dark mode colors meet WCAG AA (use contrast checker)
- [ ] ARIA live regions announce status changes
- [ ] Keyboard navigation fully functional

### UX
- [ ] Modal for links: validates, shows errors, ESC closes
- [ ] Modal for images: validates, shows errors, ESC closes
- [ ] Modal styling matches app theme (light/dark)

### Validation
- [ ] File >10MB rejected with clear message
- [ ] Invalid file types rejected (.docx, .pdf, .html, etc.)
- [ ] Valid file types accepted (.md, .markdown, .txt)
- [ ] FileReader errors handled gracefully

### Error Handling
- [ ] localStorage save errors show in status bar
- [ ] localStorage load errors show in status bar
- [ ] Console uses Logger format: `[NousMD] message`

### Code Quality
- [ ] All CONFIG constants used (no magic numbers)
- [ ] Debounce delay configurable (150ms)
- [ ] Divider limits configurable (20-80%)
- [ ] Tab spaces configurable (4 spaces)

### Regression
- [ ] All markdown features work
- [ ] All toolbar buttons work
- [ ] File save/load works
- [ ] Syntax highlighting works
- [ ] Dark mode toggle works
- [ ] Performance acceptable

### Cross-Browser
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work

---

## SUCCESS CRITERIA

**Priority 4 Complete When**:
- ✅ All accessibility fixes verified (skip link, contrast, ARIA)
- ✅ Modal dialog system working (replaces prompt)
- ✅ File validation prevents invalid uploads
- ✅ Error handling consistent across app
- ✅ No magic numbers in code (all use CONFIG)
- ✅ Logging consistent (all use Logger)
- ✅ No regressions in existing features
- ✅ Works in all major browsers
- ✅ Performance acceptable (no degradation)

---

**Test Date**: _________________
**Tested By**: _________________
**Browser/OS**: _________________
**Result**: ✅ PASS / ❌ FAIL
**Notes**: _________________
