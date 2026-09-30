import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createApp } from './app.mjs';

const apiKey = process.env.GEMINI_API_KEY;
const model = apiKey ? new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-flash-latest' }) : null;
const cloudOrigin = process.env.CODESPACE_NAME
  ? `https://${process.env.CODESPACE_NAME}-8787.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev'}` : undefined;
const server = createApp({
  generate: model ? async prompt => (await model.generateContent(prompt, { timeout: 60_000 })).response.text() : undefined,
  publicOrigin: cloudOrigin,
  visionPort: process.env.VISION_PORT ? Number(process.env.VISION_PORT) : undefined,
  dailyAiLimit: cloudOrigin ? 20 : 200,
});
const port = Number(process.env.PORT || 8787);
server.listen(port, cloudOrigin ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`AI Learning System: ${cloudOrigin || `http://127.0.0.1:${port}`}`);
  console.log(apiKey ? 'AI provider configured.' : 'Set GEMINI_API_KEY in .env to enable AI.');
});
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
server.on('error', error => { console.error(`Server failed (${error.code || 'unknown'}).`); process.exitCode = 1; });
