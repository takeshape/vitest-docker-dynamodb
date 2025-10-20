import type { CreateTableInput } from '@aws-sdk/client-dynamodb';
import type { IDockerComposeOptions } from 'docker-compose';

export type TableConfig = CreateTableInput & {
  data?: Record<string, unknown>[];
  TableName: string;
};

export type TableConfigFunction = (
  config: PluginConfig
) => TableConfig[] | Promise<TableConfig[]>;

export type DynamoDBConfig = {
  basePort: number;
  tables?: string | TableConfig[] | TableConfigFunction;
};

export type PluginConfig = {
  config?: Record<string, unknown>;
  configFile: string;
  projectName: string;
  dynamodb?: DynamoDBConfig;
  cwd: string;
} & Pick<
  IDockerComposeOptions,
  'executable' | 'log' | 'composeOptions' | 'commandOptions' | 'env'
>;

export type PluginOptions = PluginConfig & {
  /**
   * Inject global setup into which context?
   */
  setupLocation: 'vitest' | 'project';
};
