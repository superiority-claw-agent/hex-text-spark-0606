const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

export const DEFAULT_FORMAT_OPTIONS = {
  caseMode: "lowercase",
  spacingMode: "byte",
  groupSize: 4,
};

function sanitizeFormatOptions(formatOptions = DEFAULT_FORMAT_OPTIONS) {
  const merged = { ...DEFAULT_FORMAT_OPTIONS, ...formatOptions };

  return {
    caseMode: merged.caseMode === "uppercase" ? "uppercase" : "lowercase",
    spacingMode: ["none", "byte", "group"].includes(merged.spacingMode)
      ? merged.spacingMode
      : DEFAULT_FORMAT_OPTIONS.spacingMode,
    groupSize:
      Number.isInteger(merged.groupSize) && merged.groupSize > 0
        ? merged.groupSize
        : DEFAULT_FORMAT_OPTIONS.groupSize,
  };
}

function createError(type, code, message, recovery) {
  return { type, code, message, recovery };
}

export function normalizeHexInput(rawHex) {
  let normalized = "";

  for (let index = 0; index < rawHex.length; index += 1) {
    const character = rawHex[index];

    if (/[0-9a-f]/i.test(character)) {
      normalized += character;
      continue;
    }

    if (character === " " || character === "\n" || character === "\r" || character === "\t") {
      continue;
    }

    return {
      ok: false,
      error: createError(
        "parse",
        "invalid_hex_character",
        `Invalid hex character "${character}" at position ${index + 1}. Allowed input is 0-9, A-F, spaces, tabs, and line breaks.`,
        "Remove the non-hex character, then retry the decode."
      ),
    };
  }

  if (normalized.length % 2 !== 0) {
    return {
      ok: false,
      error: createError(
        "parse",
        "odd_length",
        `Hex input has ${normalized.length} non-whitespace characters. Hex decoding requires an even number of characters.`,
        "Add the missing nibble or delete the trailing half-byte, then try again."
      ),
    };
  }

  return { ok: true, value: normalized };
}

export function bytesToHexPairs(bytes, caseMode = DEFAULT_FORMAT_OPTIONS.caseMode) {
  return Array.from(bytes, (value) =>
    value.toString(16).padStart(2, "0")[caseMode === "uppercase" ? "toUpperCase" : "toLowerCase"]()
  );
}

export function formatHex(bytes, formatOptions = DEFAULT_FORMAT_OPTIONS) {
  const { caseMode, spacingMode, groupSize } = sanitizeFormatOptions(formatOptions);

  const pairs = bytesToHexPairs(bytes, caseMode);

  if (spacingMode === "none") {
    return pairs.join("");
  }

  if (spacingMode === "group") {
    const chunks = [];

    for (let index = 0; index < pairs.length; index += groupSize) {
      chunks.push(pairs.slice(index, index + groupSize).join(""));
    }

    return chunks.join(" ");
  }

  return pairs.join(" ");
}

export function parseHexToBytes(rawHex) {
  const normalized = normalizeHexInput(rawHex);

  if (!normalized.ok) {
    return normalized;
  }

  const { value } = normalized;
  const bytes = new Uint8Array(value.length / 2);

  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16);
  }

  return {
    ok: true,
    value: bytes,
    normalizedHex: value,
  };
}

export function encodeText(text) {
  return encoder.encode(text);
}

export function decodeUtf8(bytes) {
  try {
    return {
      ok: true,
      value: decoder.decode(bytes),
    };
  } catch {
    return {
      ok: false,
      error: createError(
        "decode",
        "invalid_utf8",
        "The bytes are valid hex, but they do not form a valid UTF-8 sequence.",
        "Edit the bytes until they form valid UTF-8, or switch back to text input and re-encode."
      ),
    };
  }
}

export function convertTextToHex(text, formatOptions = DEFAULT_FORMAT_OPTIONS) {
  const bytes = encodeText(text);
  const formattedHex = formatHex(bytes, formatOptions);

  return {
    ok: true,
    mode: "text",
    bytes,
    text,
    hex: formattedHex,
    formattedHex,
  };
}

export function convertHexToText(rawHex, formatOptions = DEFAULT_FORMAT_OPTIONS) {
  const parsed = parseHexToBytes(rawHex);

  if (!parsed.ok) {
    return {
      ok: false,
      mode: "hex",
      rawHex,
      error: parsed.error,
    };
  }

  const decoded = decodeUtf8(parsed.value);

  if (!decoded.ok) {
    return {
      ok: false,
      mode: "hex",
      rawHex,
      bytes: parsed.value,
      normalizedHex: parsed.normalizedHex,
      formattedHex: formatHex(parsed.value, formatOptions),
      error: decoded.error,
    };
  }

  return {
    ok: true,
    mode: "hex",
    rawHex,
    bytes: parsed.value,
    normalizedHex: parsed.normalizedHex,
    formattedHex: formatHex(parsed.value, formatOptions),
    text: decoded.value,
  };
}

export function countCharacters(text) {
  return Array.from(text).length;
}
