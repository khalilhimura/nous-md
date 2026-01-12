# NousMD Performance Optimization Tests

This document contains test cases for verifying Priority 3 performance optimizations.

## Optimization Summary

1. **Input Debouncing**: 150ms delay reduces parser calls by ~99% during typing
2. **Scroll Throttling**: RAF-based throttling for smooth 60 FPS scrolling
3. **Header Parsing**: Single-pass regex optimization (6 passes → 1 pass)

---

## Test 1: Input Debouncing

### Purpose
Verify that input events are debounced with 150ms delay, reducing parser calls during rapid typing.

### Test Steps
1. Open NousMD editor
2. Type rapidly (aim for 50+ WPM)
3. Observe preview pane updates
4. Notice update timing after pausing typing

### Expected Behavior
- **During typing**: No lag or stuttering in editor
- **After pause**: Preview updates 150ms after last keystroke
- **User experience**: Smooth typing with minimal perceived delay

### Test Cases

#### Test 1.1: Rapid Typing
```markdown
The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.
```
- Type this sentence rapidly
- Preview should NOT update on every keystroke
- Preview updates 150ms after you stop typing

#### Test 1.2: Large Document
```markdown
# Large Document Test

Paragraph 1...
Paragraph 2...
... (repeat 50+ times)
```
- Load or create document with 1000+ lines
- Type anywhere in the document
- Should feel responsive even with large content

#### Test 1.3: Debounce Cancellation
- Type "Hello"
- Wait 100ms (less than 150ms)
- Type " World"
- Preview should only update once, 150ms after "World"

### Verification
- ✅ No input lag during typing
- ✅ Preview updates after 150ms pause
- ✅ Parser not called on every keystroke (check console if debugging)

---

## Test 2: Scroll Throttling

### Purpose
Verify that scroll events are throttled using requestAnimationFrame for smooth 60 FPS scrolling.

### Test Steps
1. Create long document (50+ lines)
2. Scroll rapidly with mouse wheel
3. Scroll with trackpad (generates more events)
4. Observe syntax highlighting synchronization

### Expected Behavior
- **Smooth scrolling**: No stuttering or jank
- **Synchronized highlighting**: Highlight layer follows scroll position
- **Frame-locked**: Updates at most once per frame (~16ms)

### Test Cases

#### Test 2.1: Mouse Wheel Scroll
```markdown
# Line 1
Content...

# Line 2
Content...

... (repeat 50 times)
```
- Scroll rapidly with mouse wheel
- Highlighting should follow smoothly
- No visible delay or desync

#### Test 2.2: Trackpad Scroll
- Perform rapid trackpad scroll (generates 60+ events/second)
- Should be as smooth as mouse wheel
- No stuttering or frame drops

#### Test 2.3: Horizontal Scroll
```markdown
This is a very long line that will require horizontal scrolling to view the entire content without wrapping.
```
- Scroll horizontally
- Highlighting should follow both vertical and horizontal scroll

### Verification
- ✅ Smooth scrolling with no jank
- ✅ Highlight layer synced with editor scroll
- ✅ No performance degradation on rapid scroll

---

## Test 3: Header Parsing Optimization

### Purpose
Verify that all header levels (h1-h6) parse correctly with single-pass regex optimization.

### Test Steps
1. Create document with all header levels
2. Check preview pane rendering
3. Inspect HTML output (DevTools)
4. Test edge cases

### Expected Behavior
- **All headers render**: h1 through h6 display correctly
- **Proper HTML tags**: `<h1>` through `<h6>` generated
- **Content preserved**: Header text rendered without modification

### Test Cases

#### Test 3.1: All Header Levels
```markdown
# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header
```
**Expected HTML Output:**
```html
<h1>H1 Header</h1>
<h2>H2 Header</h2>
<h3>H3 Header</h3>
<h4>H4 Header</h4>
<h5>H5 Header</h5>
<h6>H6 Header</h6>
```

#### Test 3.2: Mixed Content
```markdown
# Main Title

Paragraph text

## Section

More text

### Subsection

Even more text
```
- All headers should render correctly
- Paragraphs should not be affected

#### Test 3.3: Header with Multiple Spaces
```markdown
##  Extra  Spaces  Between  Words
```
**Expected:**
- Renders as `<h2>Extra  Spaces  Between  Words</h2>`
- Leading space after `##` should be handled
- Internal spaces preserved in content

#### Test 3.4: Header Without Space (Should NOT Parse)
```markdown
#NoSpace
##NoSpace
```
**Expected:**
- Should NOT parse as headers (missing required space after #)
- Renders as plain text

#### Test 3.5: Headers in Code Blocks (Should NOT Parse)
~~~markdown
```
# This is NOT a header
## This is also NOT a header
```
~~~
**Expected:**
- Headers inside code blocks should not be parsed
- Rendered as literal text in `<pre><code>` block

#### Test 3.6: Headers with Special Characters
```markdown
# Header with *bold* and `code`
## Header with [link](url)
```
**Expected:**
- Headers render with inline formatting preserved
- Bold, code, and links work inside headers

---

## Test 4: Edge Cases

### Test 4.1: Debounce Timer Reset
1. Type "Hello"
2. Wait 100ms
3. Type " World"
4. Preview should update 150ms after "World", not after "Hello"

### Test 4.2: Scroll During RAF
1. Start scrolling
2. While scroll is in progress, continue scrolling
3. Should queue next frame update, not skip or stutter

### Test 4.3: Header with No Content
```markdown
#
##
```
**Expected:**
- Empty headers should render as `<h1></h1>`, `<h2></h2>`

### Test 4.4: Nested Headers (Not Valid Markdown)
```markdown
# Outer # Inner
```
**Expected:**
- Parses as single h1 with content "Outer # Inner"

---

## Performance Benchmarks

### Before Optimization
- **Input events**: 1000+ parser calls per minute (typing 50 WPM)
- **Scroll events**: 60+ handler calls per second (raw, unthrottled)
- **Header parsing**: 6 regex passes per parse operation

### After Optimization
- **Input events**: ~7 parser calls per minute (150ms debounce)
- **Scroll events**: 60 handler calls per second (frame-locked)
- **Header parsing**: 1 regex pass per parse operation

### Expected Performance Gains
- **Input optimization**: ~99% reduction in parse operations during typing
- **Scroll optimization**: 0% reduction in frequency, but frame-synchronized (smoother)
- **Parser optimization**: ~31% reduction in total regex passes

---

## Manual Testing Checklist

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Input Debouncing
- [ ] Rapid typing feels responsive
- [ ] Preview updates 150ms after pause
- [ ] No noticeable lag on large documents (1000+ lines)
- [ ] Debounce timer resets correctly

### Scroll Throttling
- [ ] Smooth scrolling with mouse wheel
- [ ] Smooth scrolling with trackpad
- [ ] Highlighting stays synchronized
- [ ] No stuttering or frame drops

### Header Parsing
- [ ] All header levels (h1-h6) render correctly
- [ ] Headers with spaces parse correctly
- [ ] Headers without spaces do NOT parse
- [ ] Headers in code blocks do NOT parse
- [ ] Mixed content renders properly

### DevTools Performance Testing
1. Open DevTools → Performance tab
2. Start recording
3. Type rapidly for 10 seconds
4. Stop recording
5. Verify:
   - [ ] Parser calls are debounced (not continuous)
   - [ ] Scroll events are frame-locked
   - [ ] No long tasks or jank

### No Regressions
- [ ] All markdown features still work (bold, italic, links, images, code)
- [ ] Syntax highlighting works correctly
- [ ] File save/load works
- [ ] Toolbar actions work
- [ ] Word count updates

---

## Success Criteria

### Performance
- ✅ Input debouncing: 150ms delay, no perceived lag
- ✅ Scroll throttling: Smooth 60 FPS, synchronized highlighting
- ✅ Header parsing: All h1-h6 render correctly

### User Experience
- ✅ No noticeable delay in typing or scrolling
- ✅ Preview updates feel responsive
- ✅ Large documents remain performant

### Code Quality
- ✅ Pure vanilla JavaScript (no dependencies)
- ✅ Clean, documented code
- ✅ Minimal code additions (~100 lines)

### Regression Testing
- ✅ All existing features work correctly
- ✅ No breaking changes
- ✅ No console errors

---

## Known Limitations

1. **Debounce delay**: 150ms is a balance between performance and responsiveness. Some users may prefer shorter delay (100ms) or longer (200ms).

2. **RAF throttling**: Tied to browser refresh rate (typically 60 FPS). On high refresh rate displays (120Hz, 144Hz), events still throttled to 60 FPS.

3. **Header parsing**: Edge case where `#` followed by number (e.g., `#1`) is parsed as h1 with content "1". This is technically valid markdown but might be unexpected.

---

## Troubleshooting

### Preview Not Updating
- Check browser console for JavaScript errors
- Verify PerformanceUtils module loaded correctly
- Test without debouncing by setting delay to 0

### Scroll Not Smooth
- Check if requestAnimationFrame is supported (all modern browsers)
- Verify throttle function is being called
- Test on different browser

### Headers Not Rendering
- Verify regex pattern: `/^(#{1,6})\s+(.+)$/gm`
- Check for space after # symbols
- Inspect HTML output in DevTools

---

## Performance Testing Tools

### Browser DevTools
```javascript
// Console snippet to measure parser calls
let parseCount = 0;
const originalParse = MarkdownParser.parse;
MarkdownParser.parse = function(...args) {
    parseCount++;
    console.log(`Parse call #${parseCount}`);
    return originalParse.apply(this, args);
};
```

### FPS Monitoring
```javascript
// Monitor scroll FPS
let scrollCount = 0;
let lastTime = Date.now();
AppState.editor.addEventListener('scroll', () => {
    scrollCount++;
    const now = Date.now();
    if (now - lastTime >= 1000) {
        console.log(`Scroll FPS: ${scrollCount}`);
        scrollCount = 0;
        lastTime = now;
    }
});
```

---

**Test Date**: _________________
**Tested By**: _________________
**Browser**: _________________
**Result**: ✅ PASS / ❌ FAIL
**Notes**: _________________
