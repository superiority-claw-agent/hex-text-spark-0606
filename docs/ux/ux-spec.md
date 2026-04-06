# UX Specification -- hex-text-spark-0606

## Experience Principles

- Keep the primary job visible: enter text, see hex; enter hex, see text.
- Make byte-level trust visible through explicit validation and exact formatting controls.
- Optimize for paste-heavy usage before decorative complexity.
- Preserve parity between desktop and mobile without hiding essential controls.

## User Flows

### Flow 1: Text to Hex Conversion

```mermaid
flowchart TD
    A[Open tool] --> B[Cursor in text input]
    B --> C[User types or pastes text]
    C --> D[App encodes UTF-8 bytes locally]
    D --> E[Apply selected formatting]
    E --> F[Render hex output]
    F --> G{Next action}
    G -->|Copy| H[Clipboard confirmation]
    G -->|Swap| I[Move hex to input side]
    G -->|Clear| J[Reset both panels]
```

### Flow 2: Hex to Text Conversion With Validation

```mermaid
flowchart TD
    A[Open tool] --> B[User types or pastes hex]
    B --> C[Normalize whitespace]
    C --> D{Even-length and hex-only?}
    D -->|No| E[Show parse error]
    D -->|Yes| F[Convert pairs to bytes]
    F --> G{Valid UTF-8 bytes?}
    G -->|No| H[Show UTF-8 decode error]
    G -->|Yes| I[Render decoded text]
    I --> J[Copy or continue editing]
```

### Flow 3: Example-Led First Use

```mermaid
flowchart LR
    A[Open tool] --> B[See example chips]
    B --> C[Tap example]
    C --> D[Populate relevant input]
    D --> E[Auto-run conversion]
    E --> F[Inspect formatting]
    F --> G[Copy or modify]
```

## Key Screens

### Main Converter Screen

**Purpose:** Provide the full conversion workflow on a single screen with paired text and hex panels, formatting controls, quick actions, and examples.
**Entry points:** Root URL, bookmarked utility link, shared internal tools page.
**Key elements:**
- Text input panel with label, helper text, character count, clear button, and copy action
- Hex input/output panel with label, helper text, byte count, clear button, and copy action
- Direction controls: `Text -> Hex`, `Hex -> Text`, and `Swap`
- Formatting controls: case selector and spacing/grouping selector
- Example preset chips for ASCII, multilingual UTF-8, and invalid-input demonstration
- Inline status area for success, validation errors, and clipboard outcomes

**States:**
- **Loading:** Minimal shell only if app assets are still booting; no spinner once hydrated because the app is local and fast.
- **Empty:** Empty text and hex panels, example chips visible, helper copy explains accepted input and formatting options.
- **Error:** Inline message anchored near the affected panel; message explains invalid hex, odd length, or invalid UTF-8 bytes without clearing user input.
- **Populated:** Both panels visible with counts, active formatting controls, and quick actions ready.

**Accessibility notes:**
- All icon-only actions require visible text labels or accessible names.
- Direction and formatting controls must be reachable by keyboard in a logical tab order.
- Status messaging should use an `aria-live` region for conversion and clipboard feedback.
- Errors should be programmatically associated with the relevant input.

**Performance notes:**
- Conversion runs on each meaningful input change for typical utility-sized payloads.
- No network-bound UI states should block conversion.
- Large pasted inputs should not freeze typing; formatting should operate on normalized byte arrays efficiently.

**Wireframe:**

<div style="max-width:960px; margin:16px 0; border:2px solid #1f2937; border-radius:18px; overflow:hidden; background:#fcfbf7; font-family:Arial,sans-serif">
  <div style="background:#132238; color:#f8fafc; padding:14px 18px; display:flex; justify-content:space-between; align-items:center">
    <b>Hex Text Spark</b>
    <span>Examples | About</span>
  </div>
  <div style="padding:18px; display:grid; gap:14px">
    <div style="display:flex; gap:8px; flex-wrap:wrap">
      <div style="padding:6px 10px; border:1px solid #94a3b8; border-radius:999px">Hello</div>
      <div style="padding:6px 10px; border:1px solid #94a3b8; border-radius:999px">UTF-8 sample</div>
      <div style="padding:6px 10px; border:1px solid #94a3b8; border-radius:999px">Invalid hex</div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 80px 1fr; gap:12px; align-items:start">
      <div style="border:1px solid #cbd5e1; border-radius:12px; padding:12px; background:#ffffff">
        <div style="font-weight:bold; margin-bottom:8px">Text</div>
        <div style="height:168px; border:1px solid #dbe2ea; border-radius:8px; padding:10px; color:#475569">Type or paste UTF-8 text</div>
        <div style="margin-top:10px; display:flex; justify-content:space-between"><span>23 chars</span><span>Copy | Clear</span></div>
      </div>
      <div style="display:grid; gap:8px; align-content:start">
        <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px; text-align:center">Text -&gt; Hex</div>
        <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px; text-align:center">Hex -&gt; Text</div>
        <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px; text-align:center">Swap</div>
      </div>
      <div style="border:1px solid #cbd5e1; border-radius:12px; padding:12px; background:#ffffff">
        <div style="font-weight:bold; margin-bottom:8px">Hex</div>
        <div style="height:168px; border:1px solid #dbe2ea; border-radius:8px; padding:10px; color:#475569">48 65 6c 6c 6f</div>
        <div style="margin-top:10px; display:flex; justify-content:space-between"><span>5 bytes</span><span>Copy | Clear</span></div>
      </div>
    </div>
    <div style="display:flex; gap:12px; flex-wrap:wrap">
      <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px 12px">Case: lowercase / UPPERCASE</div>
      <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px 12px">Spacing: none / byte / group-4</div>
      <div style="border:1px solid #fecaca; color:#991b1b; border-radius:10px; padding:10px 12px">Error: invalid UTF-8 byte sequence</div>
    </div>
  </div>
</div>

Mobile wireframe (375px+):

<div style="max-width:380px; margin:16px 0; border:2px solid #1f2937; border-radius:24px; overflow:hidden; background:#fcfbf7; font-family:Arial,sans-serif">
  <div style="background:#132238; color:#f8fafc; padding:12px 14px; display:flex; justify-content:space-between; align-items:center">
    <b>Hex Text Spark</b>
    <span>Menu</span>
  </div>
  <div style="padding:14px; display:grid; gap:10px">
    <div style="display:flex; gap:6px; overflow:hidden; flex-wrap:wrap">
      <div style="padding:5px 9px; border:1px solid #94a3b8; border-radius:999px">Hello</div>
      <div style="padding:5px 9px; border:1px solid #94a3b8; border-radius:999px">UTF-8</div>
      <div style="padding:5px 9px; border:1px solid #94a3b8; border-radius:999px">Invalid</div>
    </div>
    <div style="border:1px solid #cbd5e1; border-radius:12px; padding:12px; background:#fff">
      <div style="font-weight:bold; margin-bottom:8px">Text</div>
      <div style="height:120px; border:1px solid #dbe2ea; border-radius:8px; padding:10px; color:#475569">Paste text</div>
      <div style="margin-top:8px; display:flex; justify-content:space-between"><span>23 chars</span><span>Copy</span></div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px">
      <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px; text-align:center">-&gt; Hex</div>
      <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px; text-align:center">-&gt; Text</div>
      <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px; text-align:center">Swap</div>
    </div>
    <div style="border:1px solid #cbd5e1; border-radius:12px; padding:12px; background:#fff">
      <div style="font-weight:bold; margin-bottom:8px">Hex</div>
      <div style="height:120px; border:1px solid #dbe2ea; border-radius:8px; padding:10px; color:#475569">48 65 6c 6c 6f</div>
      <div style="margin-top:8px; display:flex; justify-content:space-between"><span>5 bytes</span><span>Copy</span></div>
    </div>
    <div style="display:grid; gap:8px">
      <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px 12px">Case selector</div>
      <div style="border:1px solid #cbd5e1; border-radius:10px; padding:10px 12px">Spacing selector</div>
      <div style="border:1px solid #fecaca; color:#991b1b; border-radius:10px; padding:10px 12px">Inline validation message</div>
    </div>
  </div>
</div>

### Error-Forward State

**Purpose:** Keep malformed input visible while explaining why conversion failed and what the user can do next.
**Entry points:** Invalid hex characters, odd-length hex input, malformed UTF-8 bytes, clipboard failure.
**Key elements:**
- Error summary line near the affected panel
- Input preserved exactly as entered
- Suggested corrective action
- Retry-capable action buttons still available where safe

**States:**
- **Loading:** Not applicable; errors should render synchronously with user input.
- **Empty:** Not shown.
- **Error:** Red-accented inline box with specific cause and no destructive auto-clearing.
- **Populated:** Error box disappears as soon as input becomes valid.

**Accessibility notes:**
- Error text must not rely on color alone.
- Screen readers should receive the updated error through an `aria-live="polite"` region.
- Focus remains in the edited field after validation feedback appears.

**Performance notes:**
- Validation should trigger in the same interaction loop as conversion and avoid layout jumps.
- Error-state rendering should not reflow the entire page on mobile.

**Wireframe:**

<div style="max-width:760px; margin:16px 0; border:2px solid #1f2937; border-radius:16px; overflow:hidden; background:#fffaf9; font-family:Arial,sans-serif">
  <div style="padding:16px; display:grid; gap:12px">
    <div style="font-weight:bold">Hex input</div>
    <div style="border:1px solid #dbe2ea; border-radius:8px; padding:12px">48 65 6C 6Z</div>
    <div style="border:1px solid #fca5a5; background:#fef2f2; color:#991b1b; border-radius:10px; padding:12px">
      Invalid hex character detected at position 8. Allowed input: 0-9, A-F, a-f, spaces, and line breaks.
    </div>
    <div style="display:flex; justify-content:space-between">
      <span>Fix input and retry</span>
      <span>Clear</span>
    </div>
  </div>
</div>

Mobile wireframe (375px+):

<div style="max-width:380px; margin:16px 0; border:2px solid #1f2937; border-radius:24px; overflow:hidden; background:#fffaf9; font-family:Arial,sans-serif">
  <div style="padding:14px; display:grid; gap:10px">
    <div style="font-weight:bold">Hex input</div>
    <div style="border:1px solid #dbe2ea; border-radius:8px; padding:10px">48 65 6C 6Z</div>
    <div style="border:1px solid #fca5a5; background:#fef2f2; color:#991b1b; border-radius:10px; padding:10px">
      Invalid hex character at byte 4.
    </div>
    <div style="display:flex; justify-content:space-between">
      <span>Edit</span>
      <span>Clear</span>
    </div>
  </div>
</div>

## Interaction Details

- Conversion mode can be implicit from the last active panel or explicit via direction buttons; direction buttons are preferred because they remove ambiguity.
- `Swap` is enabled only when the currently rendered output is valid and can become the next input.
- Formatting controls apply to the hex panel regardless of whether hex is source input or rendered output.
- Example presets should include:
  - `Hello` for simple ASCII
  - `こんにちは` or `你好` for visible UTF-8 multi-byte behavior
  - An invalid hex example to demonstrate validation rules
- Copy success should show lightweight confirmation without modal interruption.
- Clipboard failure should provide manual fallback guidance such as "Select and copy manually."

## Content Notes

- Use plain labels: `Text`, `Hex`, `Copy`, `Clear`, `Swap`, `Uppercase`, `Byte spacing`.
- Helper copy should say that spaces and line breaks are allowed in hex input.
- Error messages should avoid vague phrasing like "conversion failed"; they should name the failure class.
