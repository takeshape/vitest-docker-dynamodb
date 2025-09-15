import { getConfig, getTables } from './config.ts';
import * as dynamodb from './dynamodb.ts';
import type { DynamoDBConfig } from './types.ts';

export async function start(): Promise<void> {
  const { dynamodb: dynamodbConfig } = getConfig();

  if (dynamodbConfig) {
    if (!dynamodb.dbConnection(dynamodbConfig.basePort)) {
      await dynamodb.waitForConnection(dynamodbConfig.basePort);
    }

    await createTables(dynamodbConfig);
  }
}

export async function stop(): Promise<void> {
  const { dynamodb: dynamodbConfig } = getConfig();

  if (dynamodbConfig) {
    dynamodb.killConnection();
  }
}

export async function createTables(config: DynamoDBConfig): Promise<void> {
  const tables = await getTables();
  const tableList = await dynamodb.listTables(config.basePort);

  if (tableList.length > 0) {
    await dynamodb.deleteTables(tableList, config.basePort);
  }

  await dynamodb.createTables(tables, config.basePort);
}
