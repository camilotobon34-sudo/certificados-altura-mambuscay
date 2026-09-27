// Entrada serverless para Vercel: exporta la app de Express sin app.listen().
// En local se sigue usando src/server.js (npm run dev / npm start).
import { createApp } from '../src/app.js';

const app = createApp();

export default app;
