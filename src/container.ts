import { down, type IDockerComposeOptions, upAll } from 'docker-compose';
import { getConfig } from './config.ts';
import * as dynamodb from './dynamodb.ts';

let launchedConfig: IDockerComposeOptions | null = null;

export async function start(): Promise<void> {
  if (!launchedConfig) {
    const {
      dynamodb: dynamodbConfig,
      configFile,
      config,
      projectName
    } = getConfig();

    launchedConfig = {
      cwd: process.cwd(),
      config: configFile,
      configAsString: JSON.stringify(config),
      composeOptions: ['--project-name', projectName]
    };

    await upAll(launchedConfig);

    process.on('exit', () => {
      if (launchedConfig) {
        void down(launchedConfig);
        launchedConfig = null;
      }
    });

    if (dynamodbConfig) {
      await dynamodb.waitForConnection(dynamodbConfig.basePort);
    }
  }
}

export async function stop(): Promise<void> {
  const { dynamodb: dynamodbConfig } = getConfig();

  if (dynamodbConfig) {
    dynamodb.killConnection();
  }

  if (launchedConfig) {
    await down(launchedConfig);
    launchedConfig = null;
  }
}
