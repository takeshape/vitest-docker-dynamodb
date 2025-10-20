import { join } from 'node:path';
import type { Vite, VitestPluginContext } from 'vitest/node';
import { loadConfig } from './config.ts';
import type { PluginOptions } from './types.ts';

const __dirname = new URL('.', import.meta.url).pathname;

export default function plugin(
  options: Partial<PluginOptions> = {}
): Vite.Plugin {
  // TODO Prefer augmenting the Vitest module and providing in the project context
  loadConfig(options);

  return {
    name: 'vitest:docker-dynamodb',
    configureVitest(context: VitestPluginContext) {
      const globalSetup = join(__dirname, `global-setup.js`);
      const location = options.setupLocation ?? 'vitest';
      context[location].config.globalSetup =
        typeof context.vitest.config.globalSetup === 'string'
          ? [context.vitest.config.globalSetup, globalSetup]
          : [...context.vitest.config.globalSetup, globalSetup];
    }
  };
}
