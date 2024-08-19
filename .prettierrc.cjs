/** @type {import("prettier").Options} */
const config = {
  trailingComma: "all",
  useTabs: true,
  semi: false,
  singleQuote: true,
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "^@core/(.*)$",
    "",
    "^@server/(.*)$",
    "",
    "^@ui/(.*)$",
    "",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderTypeScriptVersion: "5.0.0",
};

module.exports = config;
