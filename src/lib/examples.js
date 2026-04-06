export const EXAMPLES = [
  {
    id: "hello",
    label: "Hello",
    type: "text",
    value: "Hello, hex world!",
    note: "Simple ASCII text",
  },
  {
    id: "utf8",
    label: "UTF-8 sample",
    type: "text",
    value: "Hi € 你好 🙂",
    note: "Multi-byte UTF-8 characters",
  },
  {
    id: "spaced-hex",
    label: "Spaced hex",
    type: "hex",
    value: "48 65 6c 6c 6f 20 e2 82 ac",
    note: "Valid hex with spaces",
  },
  {
    id: "invalid-hex",
    label: "Malformed hex",
    type: "hex",
    value: "48 65 6C 6Z",
    note: "Shows non-hex validation before decode",
  },
  {
    id: "invalid-utf8",
    label: "Invalid UTF-8",
    type: "hex",
    value: "c3 28",
    note: "Shows fatal UTF-8 decoding",
  },
];
