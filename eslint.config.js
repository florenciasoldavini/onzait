const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ["dist/*"]
  },
  {
    files: ["components/ui/**/*"],
    rules: {
      "prettier/prettier": "off"
    }
  },
  {
    files: ["app/**/*"],
    rules: {
      "prettier/prettier": ["error", { tabWidth: 2 }]
    }
  },
  {
    rules: {
      "react/no-unescaped-entities": "off"
    }
  },
  {
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json"
        }
      }
    }
  }
]);
