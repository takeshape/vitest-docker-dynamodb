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
      const cx = context[location];
      cx.config.globalSetup =
        typeof cx.config.globalSetup === 'string'
          ? [cx.config.globalSetup, globalSetup]
          : [...cx.config.globalSetup, globalSetup];
    }
  };
}
