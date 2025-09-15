import type { CreateTableInput } from '@aws-sdk/client-dynamodb';

export type TableConfig = CreateTableInput & {
  data?: Record<string, unknown>[];
  TableName: string;
};

export type TableConfigFunction = () => TableConfig[] | Promise<TableConfig[]>;

export type DynamoDBConfig = {
  basePort: number;
  tables?: string | TableConfig[] | TableConfigFunction;
};

export type PluginConfig = {
  config?: Record<string, unknown>;
  configFile: string;
  projectName: string;
  dynamodb?: DynamoDBConfig;
};
