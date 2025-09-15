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

### 1. Set `globalSetup` in `vitest.config.ts`

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['@takeshape/vitest-docker-dynamodb']
  }
});
```

### 2. [Optional] Config file

If you have a `docker-compose.yml` file living beside your `vitest.config.ts` file
you can simple run `vitest` and it should be run on setup, and stopped on teardown.

If you want to configure `dynamodb`, or do anything custom read along...

In your project root, create a config file, e.g., `vitest-docker-dynamodb.json`
with the `docker-compose.yml` file location, or a configuration directly inline.

Optionally, add configuration for dynamodb.

#### Example JSON config, using inline config and DynamoDB

```json
{
  "dynamodb": {
    "basePort": 8099
  },
  "projectName": "my-vitest-container",
  "config": {
    "services": {
      "dynamodb": {
        "image": "amazon/dynamodb-local",
        "environment": {
          "_JAVA_OPTIONS": "-Xms512m -Xmx512m"
        },
        "ports": ["8099:8000"]
      }
    }
  }
}
```

#### Example config, using js with table definitions

```js
// vitest-docker-dynamodb.mjs
export default () => {
  return {
    dynamodb: {
      basePort: 8000,
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
  };
};
```

### 3. [Optional] Update your source code

```javascript
const client = new DynamoDBClient({
  ...yourConfig,
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    region: 'local'
  })
});
```

## Specs

### Config

Check out the types [here](./src/types.ts).

### Environment Variables

Check out the code [here](./src/set-environment-variables.ts).

## Credit

This project is deeply indebted to [vitest-dynamodb-local](https://github.com/dgadelha/vitest-dynamodb-local/tree/main/packages/vitest-dynamodb-local#readme). You'll see a lot of similarity in the code and
process, but swapping in `docker-compose` for `dynamo-db-local`.
