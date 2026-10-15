import js from "@eslint/js";
import noComments from "eslint-plugin-no-comments";
import globals from "globals";
import tseslint from "typescript-eslint";

const WORKAROUND_TERMS = [
  "todo",
  "fixme",
  "xxx",
  "hack",
  "workaround",
  "work around",
  "for now",
  "temporary",
  "temporarily",
  "not ideal",
  "should be",
  "ideally",
  "revisit",
  "later",
];

export default tseslint.config(
  {
    ignores: ["coverage/**", "dist/**", "node_modules/**"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    plugins: { "no-comments": noComments },
    rules: {
      "no-comments/disallowComments": ["error", { allow: ["eslint", "global", "upstream:"] }],
      "no-inline-comments": "error",
      "no-warning-comments": ["error", { terms: WORKAROUND_TERMS, location: "anywhere" }],
    },
  },
);
