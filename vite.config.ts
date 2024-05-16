import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

// import svgrPlugin from 'vite-plugin-svgr';
// import viteTsconfigPaths from 'vite-tsconfig-paths';

const searchUpwardsForEnvFile = (): string => {
  let currentPath = __dirname;
  while (currentPath !== '/') {
    const envFilePath = path.join(currentPath, '.env.test');
    if (fs.existsSync(envFilePath)) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return '';
};

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    env: {
      DOTENV_FLOW_PATH: searchUpwardsForEnvFile(),
      DOTENV_FLOW_PATTERN: '.env.test',
    },
  },
});
