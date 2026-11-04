import tjsrEslintConfig from '@tjsr/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  files: ["**/*.ts"],
  ignores: ["dist/**"],
  extends: [
    ...tjsrEslintConfig,
  ],
});
