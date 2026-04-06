import test from "node:test";
import assert from "node:assert/strict";

import {
  countCharacters,
  convertHexToText,
  convertTextToHex,
  formatHex,
  normalizeHexInput,
  parseHexToBytes,
} from "../src/lib/hex.js";

test("converts UTF-8 text to hex bytes", () => {
  const result = convertTextToHex("Hi € 你好 🙂");

  assert.equal(result.ok, true);
  assert.equal(result.hex, "48 69 20 e2 82 ac 20 e4 bd a0 e5 a5 bd 20 f0 9f 99 82");
  assert.equal(result.bytes.length, 18);
});

test("returns empty output for empty text input", () => {
  const result = convertTextToHex("");

  assert.equal(result.ok, true);
  assert.equal(result.hex, "");
  assert.equal(result.bytes.length, 0);
});

test("accepts spaces, tabs, and line breaks in hex input", () => {
  const result = convertHexToText("48 65\t6c\n6c 6f");

  assert.equal(result.ok, true);
  assert.equal(result.text, "Hello");
  assert.equal(result.formattedHex, "48 65 6c 6c 6f");
});

test("treats whitespace-only hex input as an empty decode", () => {
  const result = convertHexToText(" \n\t ");

  assert.equal(result.ok, true);
  assert.equal(result.text, "");
  assert.equal(result.bytes.length, 0);
});

test("rejects odd-length hex with a specific parse error", () => {
  const result = convertHexToText("abc");

  assert.equal(result.ok, false);
  assert.equal(result.error.type, "parse");
  assert.equal(result.error.code, "odd_length");
});

test("rejects non-hex characters before decoding", () => {
  const normalized = normalizeHexInput("48 6Z");

  assert.equal(normalized.ok, false);
  assert.equal(normalized.error.type, "parse");
  assert.equal(normalized.error.code, "invalid_hex_character");
});

test("reports invalid UTF-8 bytes separately from parse errors", () => {
  const result = convertHexToText("c3 28");

  assert.equal(result.ok, false);
  assert.equal(result.error.type, "decode");
  assert.equal(result.error.code, "invalid_utf8");
  assert.equal(result.formattedHex, "c3 28");
  assert.equal(result.bytes.length, 2);
});

test("formats hex in uppercase, byte-spaced output", () => {
  const parsed = parseHexToBytes("48656c6c6f");

  assert.equal(parsed.ok, true);
  assert.equal(
    formatHex(parsed.value, { caseMode: "uppercase", spacingMode: "byte", groupSize: 4 }),
    "48 65 6C 6C 6F"
  );
});

test("formats hex without spacing when requested", () => {
  const parsed = parseHexToBytes("48 65 6c 6c 6f");

  assert.equal(parsed.ok, true);
  assert.equal(
    formatHex(parsed.value, { caseMode: "lowercase", spacingMode: "none", groupSize: 4 }),
    "48656c6c6f"
  );
});

test("formats grouped output without changing byte content", () => {
  const parsed = parseHexToBytes("48656c6c6f20776f726c64");

  assert.equal(parsed.ok, true);
  assert.equal(
    formatHex(parsed.value, { caseMode: "lowercase", spacingMode: "group", groupSize: 4 }),
    "48656c6c 6f20776f 726c64"
  );

  const normalized = normalizeHexInput("48656c6c 6f20776f 726c64");
  assert.equal(normalized.ok, true);
  assert.equal(normalized.value, "48656c6c6f20776f726c64");
});

test("counts visible Unicode characters by code point", () => {
  assert.equal(countCharacters("A🙂你"), 3);
});
