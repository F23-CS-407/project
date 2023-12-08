import { storeContent } from './endpoints.js';

export default function useReporting(app) {
  app.post('/report', storeContent);

  return app;
}
