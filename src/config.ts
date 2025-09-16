import fs from 'node:fs';
import { resolve } from 'node:path';
import { NAME } from './constants.ts';
import type {
  PluginConfig,
  TableConfig,
  TableConfigFunction
} from './types.ts';
import { isFunction, randomId } from './utils.ts';

let configCache: PluginConfig | undefined;

export function loadConfig(options: Partial<PluginConfig>): PluginConfig {
  const {
    dynamodb,
    config,
    configFile = 'docker-compose.yml',
    projectName = `${NAME}-${randomId()}`,
    cwd = process.cwd(),
    ...dockerComposeOptions
  } = options;

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

  if (!config && !fs.existsSync(resolve(cwd, configFile))) {
    throw new TypeError(
      `Option "configFile" must be exist or "config" must be specified.`
    );
  }

  configCache = {
    dynamodb,
    config,
    configFile,
    projectName,
    cwd,
    ...dockerComposeOptions
  };

  return configCache;
}

export function getConfig(): PluginConfig {
  if (!configCache) {
    throw new TypeError(`Config not loaded`);
  }

  return configCache;
}

// Cache the tables result from the config function, so that we
// are not calling it over and over
let tablesCache: TableConfig[] | undefined;

export async function getTables(): Promise<TableConfig[]> {
  if (tablesCache) {
    return tablesCache;
  }

  const config = getConfig();

  const { dynamodb, cwd } = config;

  if (!dynamodb?.tables) {
    tablesCache = [];
    return tablesCache;
  }

  let tables: TableConfig[] | TableConfigFunction | undefined;

  if (typeof dynamodb.tables === 'string') {
    // a path to a file to load for table definitions
    const importedTables = await import(resolve(cwd, dynamodb.tables));
    tables = importedTables.default ?? importedTables;
  } else {
    tables = dynamodb.tables;
  }

  if (isFunction(tables)) {
    tablesCache = (await tables(config)) as TableConfig[];
  } else {
    tablesCache = tables ?? [];
  }

  if (!Array.isArray(tablesCache)) {
    throw new Error(
      `${NAME} requires that the tables configuration is an array`
    );
  }

  return tablesCache;
}
