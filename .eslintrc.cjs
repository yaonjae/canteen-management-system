/** @type {import("eslint").Linter.Config} */
const config = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "rules": {
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/only-throw-error": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-unsafe-return":"off",
    "@typescript-eslint/no-unsafe-call":"off",
    "@typescript-eslint/no-unsafe-member-access":"off",
    "@typescript-eslint/no-unsafe-assignment":"off",
    "@typescript-eslint/no-explicit-any":"off",
    "@typescript-eslint/prefer-nullish-coalescing":"off",
    "@typescript-eslint/no-empty-interface":"off",
    "@typescript-eslint/no-misused-promises":"off",
    "@typescript-eslint/no-empty-function":"off",
    "@typescript-eslint/no-unsafe-argument":"off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        "prefer": "type-imports",
        "fixStyle": "inline-type-imports"
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/require-await": "off",
  }
}
module.exports = config;