import type { CreateTableInput } from '@aws-sdk/client-dynamodb';

export type TableConfig = CreateTableInput & {
  data?: Record<string, unknown>[];
  TableName: string;
};

export type DynamoDBConfig = {
  basePort: number;
  tables?: TableConfig[] | (() => TableConfig[] | Promise<TableConfig[]>);
};

export type Config = {
  config?: Record<string, unknown>;
  configFile: string;
  projectName: string;
  dynamodb?: DynamoDBConfig;
};
