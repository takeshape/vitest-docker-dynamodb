import { join } from 'node:path';
import type { Plugin } from 'vite';
import type { ViteUserConfig } from 'vitest/config.js';

const __dirname = new URL('.', import.meta.url).pathname;

export default function dockerDynamodbPlugin(): Plugin {
  return {
    name: 'docker-dynamodb:vitest',
    config(): ViteUserConfig {
      const config: ViteUserConfig = {
        test: {
          globalSetup: [join(__dirname, `global-setup.js`)]
        }
      };
      return config;
    }
  };
}
