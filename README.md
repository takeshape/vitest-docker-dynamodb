# vitest-docker-dynamodb

Provides an easy way to start and stop `docker-compose` projects with [vitest](https://vitest.dev)
tests. Additional functionality to easily set up dynamodb table fixtures.

## Installation

```
npm i @takeshape/vitest-docker-dynamodb -D
# or
yarn add @takeshape/vitest-docker-dynamodb -D
# or
pnpm add @takeshape/vitest-docker-dynamodb -D
```

## Usage

### 1. Import and configure the plugin in `vitest.config.ts`

All config is optional, if you provide no config the plugin will attempt to load
`docker-compose.yml` in your working directory.

```js
import dockerDynamodbPlugin from '@takeshape/vitest-docker-dynamodb';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    dockerDynamodbPlugin({
      dynamodb: {
        basePort: 8000
      },
      projectName: 'my-test-project',
      configFile: 'docker-compose.yml'
    })
  ]
});
```

### 2. [Optional] Update your source code

```javascript
const client = new DynamoDBClient({
  ...yourConfig,
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    region: 'local'
  })
});
```

## Configuration

If you have a `docker-compose.yml` file living beside your `vitest.config.ts` file
you can simple run `vitest` and it should be run on setup, and stopped on teardown.

If you want to configure `dynamodb`, or do anything custom read along...

#### Example using inline config and DynamoDB

```js
// vitest.config.mts
dockerDynamodbPlugin({
  dynamodb: {
    basePort: 8099
  },
  projectName: 'my-test-project',
  config: {
    services: {
      dynamodb: {
        image: 'amazon/dynamodb-local',
        environment: {
          _JAVA_OPTIONS: '-Xms512m -Xmx512m'
        },
        ports: ["8099:8000"]
      }
    }
  }
})
```

#### Example using table definitions

```js
// vitest.config.mts
dockerDynamodbPlugin({
  dynamodb: {
    basePort: 8099,
    tables: [
      {
        TableName: 'table',
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1
        }
      }
    ]
  }
})
```

#### Example using an external file for table definitions

```js
// vitest.config.mts
dockerDynamodbPlugin({
  dynamodb: {
    basePort: 8099,
    tables: './my-tables.mjs'
  }
})

// my-tables.mjs
export default () => {
  return [
    {
      TableName: 'table',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }
  ]
};
```

## Specs

### Config

Check out the types [here](./src/types.ts).

### Environment Variables

Check out the code [here](./src/set-environment-variables.ts).

## Credit

This project is deeply indebted to [vitest-dynamodb-local](https://github.com/dgadelha/vitest-dynamodb-local/tree/main/packages/vitest-dynamodb-local#readme). You'll see a lot of similarity in the code and
process, but swapping in `docker-compose` for `dynamo-db-local`.

## Test

This is a test
