import createApp from '../app';
import { auth_test } from './test-endpoints.js';

// build an app from src and attach endpoints used only for testing
export default async function createTestApp() {
  const app = await createApp();

  // add auth_test endpoint
  app.get('/auth_test', auth_test);

  return app;
}
