import fs from 'node:fs';
import { resolve } from 'node:path';
import { NAME } from './constants.ts';
import type { Config, TableConfig } from './types.ts';
import { isFunction, randomId } from './utils.ts';

const CONFIG_FILE_NAME = `${NAME}.js`;
const CONFIG_FILE_NAME_CJS = `${NAME}.cjs`;
const CONFIG_FILE_NAME_MJS = `${NAME}.mjs`;
const CONFIG_FILE_NAME_JSON = `${NAME}.json`;
const CONFIG_FILE_NAMES = [
  CONFIG_FILE_NAME,
  CONFIG_FILE_NAME_CJS,
  CONFIG_FILE_NAME_MJS,
  CONFIG_FILE_NAME_JSON
] as const;

type ConfigFileName = (typeof CONFIG_FILE_NAMES)[number];

export class NotFoundError extends Error {
  constructor(dir: string) {
    super(
      `Could not find '${CONFIG_FILE_NAME}', '${CONFIG_FILE_NAME_CJS}', '${CONFIG_FILE_NAME_MJS}' or '${CONFIG_FILE_NAME_JSON}' in dir ${dir}`
    );
  }
}

function findConfigOrError(directory: string): ConfigFileName {
  const foundFile = CONFIG_FILE_NAMES.find((config) => {
    const file = resolve(directory, config);
    return fs.existsSync(file);
  });

  if (!foundFile) {
    throw new NotFoundError(resolve(directory));
  }

  return foundFile;
}

function readConfig(): Partial<Config> {
  const rootDir = process.cwd();
  let configFile: string;

  try {
    configFile = findConfigOrError(rootDir);
  } catch (e) {
    if (e instanceof NotFoundError) {
      // This is fine, we can continue with defaults
      return {};
    }

    throw e;
  }

  const file = resolve(rootDir, configFile);

  try {
    // As-of node v22 can require() ESM
    const importedConfig = require(file);
    if ('default' in importedConfig) {
      return importedConfig.default;
    }
    return importedConfig;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(
        `Something went wrong reading your ${configFile}: ${e.message}, ${e.stack}`
      );
    }
    throw new Error(`Something went wrong reading your ${configFile}: ${e}`);
  }
}

let configCache: Config | undefined;

export function getConfig(): Config {
  if (configCache) {
    return configCache;
  }

  const {
    dynamodb,
    config,
    configFile = 'docker-compose.yml',
    projectName = `${NAME}-${randomId()}`
  } = readConfig();

  if (dynamodb) {
    if (dynamodb.basePort === undefined) {
      dynamodb.basePort = 8000;
    } else if (
      !Number.isInteger(dynamodb.basePort) ||
      dynamodb.basePort <= 0 ||
      dynamodb.basePort > 65535
    ) {
      throw new TypeError(
        `Option "dynamodb.basePort" must be an number between 1 and 65535.`
      );
    }
  }

  if (!config && !fs.existsSync(resolve(process.cwd(), configFile))) {
    throw new TypeError(
      `Option "configFile" must be exist or "config" must be specified.`
    );
  }

  configCache = {
    dynamodb,
    config,
    configFile,
    projectName
  };

  return configCache;
}

// Cache the tables result from the config function, so that we
// are not calling it over and over
let tablesCache: TableConfig[] | undefined;

export async function getTables(): Promise<TableConfig[]> {
  if (tablesCache) {
    return tablesCache;
  }

  const { dynamodb } = getConfig();

  if (!dynamodb) {
    tablesCache = [];
    return tablesCache;
  }

  if (isFunction(dynamodb.tables)) {
    tablesCache = await dynamodb.tables();
  } else {
    tablesCache = dynamodb.tables ?? [];
  }

  if (!Array.isArray(tablesCache)) {
    throw new Error(
      `${NAME} requires that the tables configuration is an array`
    );
  }

  return tablesCache;
}
