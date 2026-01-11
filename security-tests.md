# XSS Security Tests for NousMD

This file contains comprehensive security tests to verify XSS vulnerability fixes.

## Test 1: JavaScript Protocol in Links
[Click me - SHOULD BE BLOCKED](javascript:alert('XSS'))

**Expected Result:** Plain text `[Click me - SHOULD BE BLOCKED]`, no clickable link

---

## Test 2: JavaScript Protocol in Images
![XSS Image - SHOULD BE BLOCKED](javascript:alert('XSS'))

**Expected Result:** Plain text `[Image: XSS Image - SHOULD BE BLOCKED]`, no image displayed

---

## Test 3: Data URI Script in Links
[Data XSS - SHOULD BE BLOCKED](data:text/html,<script>alert('XSS')</script>)

**Expected Result:** Plain text, no link

---

## Test 4: VBScript Protocol
[VBS - SHOULD BE BLOCKED](vbscript:msgbox("XSS"))

**Expected Result:** Plain text, no link

---

## Test 5: Case Variation Bypass Attempt
[Case Bypass - SHOULD BE BLOCKED](JaVaScRiPt:alert('XSS'))

**Expected Result:** Plain text, no link

---

## Test 6: URL Encoded Bypass Attempt
[Encoded - SHOULD BE BLOCKED](javascript%3Aalert('XSS'))

**Expected Result:** Plain text, no link (URL decoding + normalization should catch this)

---

## Test 7: Whitespace Bypass Attempt
[Spaces - SHOULD BE BLOCKED](  javascript:alert('XSS'))

**Expected Result:** Plain text, no link

---

## Test 8: File Protocol (should block)
[File - SHOULD BE BLOCKED](file:///etc/passwd)

**Expected Result:** Plain text, no link

---

## Test 9: About Protocol (should block)
[About - SHOULD BE BLOCKED](about:blank)

**Expected Result:** Plain text, no link

---

## Test 10: Legitimate HTTPS Link (SHOULD WORK)
[Safe HTTPS Link](https://example.com)

**Expected Result:** Working clickable link to https://example.com

---

## Test 11: Legitimate HTTP Link (SHOULD WORK)
[Safe HTTP Link](http://example.com)

**Expected Result:** Working clickable link to http://example.com

---

## Test 12: Legitimate Relative Link (SHOULD WORK)
[Relative Link](./test.md)

**Expected Result:** Working clickable link to ./test.md

---

## Test 13: Legitimate Mailto Link (SHOULD WORK)
[Email Link](mailto:test@example.com)

**Expected Result:** Working mailto link

---

## Test 14: Legitimate FTP Link (SHOULD WORK)
[FTP Link](ftp://ftp.example.com/file.txt)

**Expected Result:** Working FTP link

---

## Test 15: Protocol-Relative URL (SHOULD WORK)
[Protocol-Relative](//example.com/image.png)

**Expected Result:** Working link that inherits current protocol

---

## Test 16: Legitimate Data URI Image (SHOULD WORK)
![Legitimate Base64 Image](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==)

**Expected Result:** Displays a tiny 1x1 red pixel image (legitimate base64 encoded PNG)

---

## Test 17: Mixed Attack Patterns
Here's a paragraph with multiple attack attempts:

[Normal Link](https://example.com) then [XSS Attack](javascript:alert('XSS')) followed by ![Image Attack](javascript:alert('XSS2')) and finally [Another Safe Link](mailto:test@test.com).

**Expected Result:**
- First link works normally
- Second link is plain text (blocked)
- Third image is plain text (blocked)
- Fourth link works normally

---

## Test 18: Nested Markdown (edge case)
[Link with **bold** text](https://example.com)

**Expected Result:** Working link with bold text inside

---

## Test 19: Empty URL
[Empty URL Link]()

**Expected Result:** Plain text or empty link (graceful degradation)

---

## Test 20: Long URL (DoS Prevention)
This tests if excessively long URLs are handled gracefully.

[Very Long URL - if this is a clickable link, the URL length validation may not be working](https://example.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa)

**Expected Result:** Should be handled gracefully (either rendered with length limit or blocked with warning)

---

## Verification Checklist

After loading this file in NousMD:

- [ ] Tests 1-9: All attack patterns blocked (rendered as plain text)
- [ ] Tests 10-16: All legitimate URLs work correctly
- [ ] Test 17: Mixed patterns handled correctly
- [ ] Tests 18-19: Edge cases handled gracefully
- [ ] Test 20: Long URLs handled without crashes
- [ ] Browser console shows warnings for blocked URLs
- [ ] No JavaScript execution occurs anywhere
- [ ] DevTools → Security shows CSP is active
- [ ] No console errors for normal usage

## How to Test

1. Open `index.html` in a modern browser
2. Click the "Open" button and load this `security-tests.md` file
3. Visually inspect each test case in the preview pane
4. Open browser DevTools (F12)
5. Check the Console tab for security warnings
6. Check the Security tab to verify CSP is active
7. Try clicking on blocked links (should not execute)
8. Try interacting with legitimate links (should work)

## Expected Console Output

You should see console warnings like:
```
Blocked dangerous URL protocol: javascript:alert('XSS')
Blocked non-whitelisted protocol: vbscript: in URL: vbscript:msgbox("XSS")
```

## Success Criteria

✅ All XSS attacks blocked
✅ All legitimate URLs functional
✅ No JavaScript execution from markdown
✅ CSP policy active
✅ Graceful degradation (blocked URLs show as plain text, not broken UI)
