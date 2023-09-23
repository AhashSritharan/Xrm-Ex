module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["import", "@typescript-eslint", "simple-import-sort"],
  extends: [
    "eslint:recommended",
    "plugin:eslint-comments/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  settings: {
    "import/resolver": {
      typescript: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
  },
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/no-mutable-exports": "error",
    "import/no-unused-modules": "error",
    "no-undef": "off",
    "no-prototype-builtins": "off",
    "no-dupe-class-members": "off",
    "@typescript-eslint/no-floating-promises": "error",
    "no-unused-vars": "warn"
  }
};
