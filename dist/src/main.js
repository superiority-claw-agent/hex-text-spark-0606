import { EXAMPLES } from "./lib/examples.js";
import {
  DEFAULT_FORMAT_OPTIONS,
  convertHexToText,
  convertTextToHex,
  countCharacters,
} from "./lib/hex.js";

const elements = {
  exampleList: document.querySelector("#example-list"),
  textPanel: document.querySelector("#text-panel"),
  hexPanel: document.querySelector("#hex-panel"),
  textInput: document.querySelector("#text-input"),
  hexInput: document.querySelector("#hex-input"),
  textCount: document.querySelector("#text-count"),
  byteCount: document.querySelector("#byte-count"),
  textModePill: document.querySelector("#text-mode-pill"),
  hexModePill: document.querySelector("#hex-mode-pill"),
  statusCard: document.querySelector("#status-card"),
  statusTitle: document.querySelector("#status-title"),
  statusMessage: document.querySelector("#status-message"),
  statusRecovery: document.querySelector("#status-recovery"),
  caseMode: document.querySelector("#case-mode"),
  spacingMode: document.querySelector("#spacing-mode"),
  groupSize: document.querySelector("#group-size"),
  textToHex: document.querySelector("#text-to-hex"),
  hexToText: document.querySelector("#hex-to-text"),
  swapValues: document.querySelector("#swap-values"),
  clearAll: document.querySelector("#clear-all"),
  copyText: document.querySelector("#copy-text"),
  clearText: document.querySelector("#clear-text"),
  copyHex: document.querySelector("#copy-hex"),
  clearHex: document.querySelector("#clear-hex"),
  hexPreview: document.querySelector("#hex-preview"),
  hexPreviewValue: document.querySelector("#hex-preview-value"),
  hexFeedback: document.querySelector("#hex-feedback"),
};

const state = {
  sourceMode: "text",
  textInput: "",
  hexInput: "",
  formatOptions: { ...DEFAULT_FORMAT_OPTIONS },
  conversion: convertTextToHex("", DEFAULT_FORMAT_OPTIONS),
  notice: null,
};

function buildStatus(tone, title, message, recovery = "") {
  return { tone, title, message, recovery };
}

function getConversion() {
  if (state.sourceMode === "hex") {
    return convertHexToText(state.hexInput, state.formatOptions);
  }

  return convertTextToHex(state.textInput, state.formatOptions);
}

function runConversion() {
  state.conversion = getConversion();
  state.notice = null;
  render();
}

function currentTextValue() {
  if (state.sourceMode === "text") {
    return state.textInput;
  }

  return state.conversion.ok ? state.conversion.text : "";
}

function currentHexValue() {
  if (state.sourceMode === "hex") {
    return state.hexInput;
  }

  return state.conversion.ok ? state.conversion.hex : "";
}

function formattedHexPreview() {
  if (state.sourceMode === "hex" && state.conversion.ok) {
    return state.conversion.formattedHex;
  }

  return state.conversion.formattedHex ?? state.conversion.hex ?? "";
}

function currentByteCount() {
  return state.conversion.bytes?.length ?? 0;
}

function currentStatus() {
  if (state.notice) {
    return state.notice;
  }

  if (state.sourceMode === "text" && state.textInput.length === 0) {
    return buildStatus(
      "neutral",
      "Ready",
      "Enter text to inspect UTF-8 bytes, or switch to hex input to decode bytes back into text."
    );
  }

  if (state.sourceMode === "hex" && state.hexInput.trim().length === 0) {
    return buildStatus(
      "neutral",
      "Ready",
      "Paste hex bytes with optional spaces or line breaks to decode them locally."
    );
  }

  if (!state.conversion.ok) {
    return buildStatus(
      "error",
      state.conversion.error.type === "parse" ? "Hex parse error" : "UTF-8 decode error",
      state.conversion.error.message,
      state.conversion.error.recovery
    );
  }

  if (state.sourceMode === "text") {
    const byteCount = state.conversion.bytes.length;
    return buildStatus(
      "success",
      "Text encoded",
      `Encoded ${countCharacters(state.conversion.text)} characters into ${byteCount} UTF-8 byte${byteCount === 1 ? "" : "s"}.`
    );
  }

  return buildStatus(
    "success",
    "Hex decoded",
    `Decoded ${state.conversion.bytes.length} byte${state.conversion.bytes.length === 1 ? "" : "s"} into ${countCharacters(state.conversion.text)} characters.`
  );
}

function currentHexFeedback() {
  if (state.sourceMode !== "hex" || state.hexInput.trim().length === 0) {
    return null;
  }

  if (!state.conversion.ok) {
    return {
      tone: "error",
      title: state.conversion.error.type === "parse" ? "Hex parse error" : "UTF-8 decode error",
      message: state.conversion.error.message,
    };
  }

  return {
    tone: "neutral",
    title: "Input preserved",
    message: "Raw hex stays editable above. Formatting controls apply to the preview below only.",
  };
}

function syncValue(element, value) {
  if (element.value !== value) {
    element.value = value;
  }
}

function setPressed(button, isPressed) {
  button.setAttribute("aria-pressed", String(isPressed));
}

function setStatusCard(status) {
  elements.statusCard.className = `status-card status-${status.tone}`;
  elements.statusTitle.textContent = status.title;
  elements.statusMessage.textContent = status.message;
  elements.statusRecovery.textContent = status.recovery;
  elements.statusRecovery.hidden = status.recovery.length === 0;
}

function setHexFeedback(feedback) {
  if (!feedback) {
    elements.hexFeedback.hidden = true;
    elements.hexFeedback.textContent = "";
    elements.hexFeedback.className = "panel-feedback panel-feedback-neutral";
    return;
  }

  elements.hexFeedback.hidden = false;
  elements.hexFeedback.className = `panel-feedback panel-feedback-${feedback.tone}`;
  elements.hexFeedback.textContent = `${feedback.title}: ${feedback.message}`;
}

function renderExamples() {
  elements.exampleList.textContent = "";

  EXAMPLES.forEach((example) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "example-chip";
    button.dataset.exampleId = example.id;

    const label = document.createElement("span");
    label.className = "example-label";
    label.textContent = example.label;

    const note = document.createElement("span");
    note.className = "example-note";
    note.textContent = example.note;

    button.append(label, note);
    button.addEventListener("click", () => {
      if (example.type === "hex") {
        state.sourceMode = "hex";
        state.hexInput = example.value;
        state.textInput = "";
      } else {
        state.sourceMode = "text";
        state.textInput = example.value;
        state.hexInput = "";
      }

      state.conversion = getConversion();
      state.notice = buildStatus(
        state.conversion.ok ? "success" : "error",
        `Loaded ${example.label}`,
        example.note,
        state.conversion.ok ? "" : state.conversion.error.recovery
      );
      render();
    });
    elements.exampleList.append(button);
  });
}

async function copyToClipboard(value, successTitle) {
  if (!value) {
    state.notice = buildStatus(
      "neutral",
      "Nothing to copy",
      "Generate output or enter input before copying."
    );
    render();
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    state.notice = buildStatus("success", successTitle, "Copied to the clipboard.");
  } catch {
    state.notice = buildStatus(
      "error",
      "Clipboard unavailable",
      "The browser blocked clipboard access for this page.",
      "Use your browser's copy shortcut or grant clipboard permission, then try again."
    );
  }

  render();
}

function resetState(mode = state.sourceMode) {
  state.sourceMode = mode;
  state.textInput = "";
  state.hexInput = "";
  state.conversion = getConversion();
  state.notice = buildStatus("neutral", "Cleared", "Inputs, output, and status were reset.");
  render();
}

function render() {
  const textValue = currentTextValue();
  const hexValue = currentHexValue();
  const status = currentStatus();
  const preview = formattedHexPreview();
  const byteCount = currentByteCount();
  const characterCount = countCharacters(textValue);
  const hexFeedback = currentHexFeedback();

  if (document.activeElement !== elements.textInput) {
    syncValue(elements.textInput, textValue);
  }

  if (document.activeElement !== elements.hexInput) {
    syncValue(elements.hexInput, hexValue);
  }

  elements.textCount.textContent = `${characterCount} character${characterCount === 1 ? "" : "s"}`;
  elements.byteCount.textContent = `${byteCount} byte${byteCount === 1 ? "" : "s"}`;
  elements.textModePill.textContent = state.sourceMode === "text" ? "Source" : "Output";
  elements.hexModePill.textContent = state.sourceMode === "hex" ? "Source" : "Output";
  elements.textPanel.classList.toggle("panel-active", state.sourceMode === "text");
  elements.hexPanel.classList.toggle("panel-active", state.sourceMode === "hex");
  setPressed(elements.textToHex, state.sourceMode === "text");
  setPressed(elements.hexToText, state.sourceMode === "hex");
  elements.caseMode.value = state.formatOptions.caseMode;
  elements.spacingMode.value = state.formatOptions.spacingMode;
  elements.groupSize.value = String(state.formatOptions.groupSize);
  elements.swapValues.disabled =
    !state.conversion.ok ||
    (state.sourceMode === "text" && state.conversion.hex.length === 0) ||
    (state.sourceMode === "hex" && state.conversion.text.length === 0);
  elements.groupSize.disabled = state.formatOptions.spacingMode !== "group";
  elements.textInput.setAttribute("aria-invalid", "false");
  elements.hexInput.setAttribute(
    "aria-invalid",
    state.sourceMode === "hex" && !state.conversion.ok ? "true" : "false"
  );

  if (state.sourceMode === "hex" && preview && state.hexInput.length > 0) {
    elements.hexPreview.hidden = false;
    elements.hexPreviewValue.textContent = preview;
  } else {
    elements.hexPreview.hidden = true;
    elements.hexPreviewValue.textContent = "";
  }

  setHexFeedback(hexFeedback);
  setStatusCard(status);
}

elements.textInput.addEventListener("input", (event) => {
  state.sourceMode = "text";
  state.textInput = event.target.value;
  runConversion();
});

elements.hexInput.addEventListener("input", (event) => {
  state.sourceMode = "hex";
  state.hexInput = event.target.value;
  runConversion();
});

elements.caseMode.addEventListener("change", (event) => {
  state.formatOptions.caseMode = event.target.value;
  runConversion();
});

elements.spacingMode.addEventListener("change", (event) => {
  state.formatOptions.spacingMode = event.target.value;
  runConversion();
});

elements.groupSize.addEventListener("change", (event) => {
  state.formatOptions.groupSize = Number.parseInt(event.target.value, 10);
  runConversion();
});

elements.textToHex.addEventListener("click", () => {
  state.sourceMode = "text";
  state.conversion = getConversion();
  state.notice = buildStatus("neutral", "Text mode", "The text panel is now the active source.");
  render();
  elements.textInput.focus();
});

elements.hexToText.addEventListener("click", () => {
  state.sourceMode = "hex";
  state.conversion = getConversion();
  state.notice = buildStatus("neutral", "Hex mode", "The hex panel is now the active source.");
  render();
  elements.hexInput.focus();
});

elements.swapValues.addEventListener("click", () => {
  if (!state.conversion.ok) {
    return;
  }

  if (state.sourceMode === "text") {
    state.hexInput = state.conversion.formattedHex ?? state.conversion.hex;
    state.sourceMode = "hex";
  } else {
    state.textInput = state.conversion.text;
    state.sourceMode = "text";
  }

  state.conversion = getConversion();
  state.notice = buildStatus(
    "success",
    "Swapped",
    "Moved the valid output into the opposite input panel."
  );
  render();
});

elements.clearAll.addEventListener("click", () => {
  resetState("text");
});

elements.clearText.addEventListener("click", () => {
  resetState("text");
  elements.textInput.focus();
});

elements.clearHex.addEventListener("click", () => {
  resetState("hex");
  elements.hexInput.focus();
});

elements.copyText.addEventListener("click", () => {
  copyToClipboard(currentTextValue(), "Text copied");
});

elements.copyHex.addEventListener("click", () => {
  const value = state.conversion.ok ? formattedHexPreview() : state.hexInput;
  copyToClipboard(value, "Hex copied");
});

renderExamples();
render();
