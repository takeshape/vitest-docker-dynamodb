import * as container from './container.ts';
import * as db from './db.ts';
import { setEnvironmentVariables } from './set-environment-variables.ts';

setEnvironmentVariables();

export async function setup() {
  await container.start();
  await db.start();
}

export async function teardown() {
  await db.stop();
  await container.stop();
}
