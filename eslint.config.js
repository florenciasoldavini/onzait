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
    files: ["shared/ui/primitives/**/*"],
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
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/components/**",
                "@/contexts/**",
                "@/hooks/**",
                "@/lib/**",
                "@/repositories/**",
                "@/schemas/**",
                "@/screens/**",
                "@/services/**",
                "@/theme/**",
                "@/types/**"
              ],
              message:
                "Import from the owning feature, shared, or infrastructure boundary instead of a retired top-level layer."
            }
          ]
        }
      ],
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
    files: ["features/*/screens/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/repositories/**", "@/infrastructure/**"],
              message:
                "Screens must use feature hooks or services instead of repositories or infrastructure directly."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["features/*/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/repositories/**", "@/infrastructure/**"],
              message:
                "Feature components must use feature hooks or services instead of repositories or infrastructure directly."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/**"],
              message: "Shared code cannot depend on a product feature."
            }
          ]
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
