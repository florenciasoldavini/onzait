const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    // Deno owns typecheck, lint, and tests for Supabase Edge Functions.
    ignores: ["dist/*", "supabase/functions/**"]
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
    files: ["screens/auth/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/auth",
              message:
                "Auth screens must use feature hooks instead of auth transport helpers."
            },
            {
              name: "@/lib/supabase",
              message:
                "Auth screens must use feature hooks instead of the Supabase client."
            },
            {
              name: "@supabase/supabase-js",
              message:
                "Auth screens must use feature hooks instead of the Supabase client."
            }
          ]
        }
      ]
    }
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          vars: "all",
          varsIgnorePattern: "^_"
        }
      ]
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
