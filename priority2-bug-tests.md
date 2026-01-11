# Priority 2 Bug Fix Verification Tests

This file contains comprehensive tests to verify all three Priority 2 bug fixes in NousMD.

---

## Bug 1: Syntax Highlighter Regex Conflicts

These tests verify that bold and italic highlighting no longer conflict:

### Test 1.1 - Mixed Bold and Italic
**bold*italic**

**Expected**: Entire string highlighted as bold (no nested italic span)
**Why**: Bold should consume inner asterisk without creating nested spans

### Test 1.2 - Triple Asterisks
***triple***

**Expected**: Highlighted as combined bold+italic
**Why**: Triple asterisk is a single format unit

### Test 1.3 - Adjacent Patterns
**one** *two*

**Expected**: Each pattern highlighted independently
**Why**: Separate patterns should not interfere with each other

### Test 1.4 - Underscore Variants
__bold__ _italic_

**Expected**: Each pattern highlighted independently
**Why**: Underscore syntax should work identically to asterisk syntax

### Test 1.5 - Incomplete Pattern
**incomplete bold*

**Expected**: No highlighting (unmatched delimiter)
**Why**: Unmatched patterns should be displayed as plain text

### Test 1.6 - Complex Line
**one** and **two** and *three*

**Expected**: All three patterns highlighted independently
**Why**: Multiple patterns on same line should not conflict

---

## Bug 2: Code Block Placeholder Collision

These tests verify that user content with placeholder-like text is preserved:

### Test 2.1 - User Text with Old Placeholder Format
The system uses __CODE_BLOCK_0__ internally as a placeholder.

**Expected**: Literal text "__CODE_BLOCK_0__" displayed in preview
**Why**: User content should not be replaced by code block HTML

### Test 2.2 - Code Block After Placeholder Text
Now here's actual code:

```javascript
console.log('test');
```

**Expected**:
- Above text still shows "__CODE_BLOCK_0__"
- Code block renders correctly
**Why**: UUID-based placeholders prevent collision

### Test 2.3 - Code Containing Placeholder Format
```
Old format: __CODE_BLOCK_0__
Old format: __CODE_BLOCK_1__
New format: __INLINE_FORMAT_0__
```

**Expected**: Code block displays literal placeholder strings
**Why**: Content inside code blocks should never be processed

### Test 2.4 - Multiple Code Blocks
First block:
```js
const a = 1;
```

Second block:
```js
const b = 2;
```

Third block:
```js
const c = 3;
```

**Expected**: All three code blocks render correctly with unique placeholders
**Why**: Each block gets a unique UUID-based placeholder

---

## Bug 3: Paragraph Detection

These tests verify that comparison operators are properly wrapped in paragraphs:

### Test 3.1 - Less Than Operator
We have < 5 apples in stock.

**Expected**: Wrapped in `<p>` tags (inspect with DevTools)
**Why**: Comparison operator should be treated as text, not HTML

### Test 3.2 - Heart Symbol
I <3 markdown!

**Expected**: Wrapped in `<p>` tags
**Why**: `<3` is user content, not an HTML tag

### Test 3.3 - Less Than or Equal
The value is <= 10.

**Expected**: Wrapped in `<p>` tags
**Why**: Compound comparison operator should be treated as text

### Test 3.4 - Arrow Notation
Navigate <- back to home.

**Expected**: Wrapped in `<p>` tags
**Why**: ASCII arrow should be treated as text

### Test 3.5 - Multiple Operators
The count is < 5 and > 2.

**Expected**: Wrapped in `<p>` tags
**Why**: Both operators should be escaped and wrapped

### Test 3.6 - Actual HTML Block (Should NOT Wrap)
<div>This is custom HTML</div>

**Expected**: NOT wrapped in `<p>` tags (passes through as HTML)
**Why**: Real HTML tags should be recognized and passed through

### Test 3.7 - Blockquote HTML
<blockquote>This is a quote</blockquote>

**Expected**: NOT wrapped in `<p>` tags
**Why**: Block-level HTML elements should pass through

### Test 3.8 - Mixed Content
Text before < 5

<div>HTML block</div>

Text after > 2

**Expected**:
- "Text before < 5" wrapped in `<p>`
- `<div>` passes through unwrapped
- "Text after > 2" wrapped in `<p>`
**Why**: Proper differentiation between HTML and text

---

## Verification Checklist

After loading this file in NousMD, verify:

### Visual Inspection
- [ ] Bug 1: Syntax highlighting in left pane shows correct highlighting (no double-wrapping)
- [ ] Bug 2: Text "__CODE_BLOCK_0__" displays literally in preview (not replaced)
- [ ] Bug 2: All code blocks render correctly
- [ ] Bug 3: Comparison operators display correctly in preview

### DevTools Inspection (F12)
- [ ] Bug 3: Inspect paragraphs with `<` - should be `<p>We have &lt; 5...</p>`
- [ ] Bug 3: Inspect HTML blocks - should NOT be wrapped in `<p>`
- [ ] Bug 1: Inspect syntax highlighting - no nested spans within bold/italic

### Console Check
- [ ] No JavaScript errors
- [ ] No unexpected warnings

### Browser Compatibility
Test in:
- [ ] Chrome/Edge (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)

---

## Expected Results Summary

**Bug 1 - Syntax Highlighter:**
✅ All bold/italic patterns highlighted correctly
✅ No nested or conflicting spans
✅ Mixed patterns work independently

**Bug 2 - Placeholder Collision:**
✅ User text "__CODE_BLOCK_0__" preserved literally
✅ All code blocks render with unique placeholders
✅ No data loss or unexpected replacements

**Bug 3 - Paragraph Detection:**
✅ Comparison operators properly wrapped in `<p>` tags
✅ HTML tags properly recognized and passed through
✅ No false positives treating `<` as HTML

---

## Performance Check

For large documents (optional but recommended):

1. Create a document with 100+ bold/italic patterns
2. Create a document with 50+ code blocks
3. Create a document with 100+ paragraphs with `<` operators

Expected:
- Render time < 200ms
- No lag in editor
- No memory spikes

---

## Notes for Manual Testing

1. **Syntax Highlighting**: Look at the LEFT pane (editor) for highlighting colors
2. **Preview Rendering**: Look at the RIGHT pane (preview) for final output
3. **HTML Inspection**: Use browser DevTools to inspect actual HTML structure
4. **Placeholder Check**: Try typing "__CODE_BLOCK_0__" manually to confirm it stays literal

All tests should pass with the Priority 2 bug fixes implemented! 🎉
