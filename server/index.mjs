import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createApp } from './app.mjs';

const apiKey = process.env.GEMINI_API_KEY;
const model = apiKey ? new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-flash-latest' }) : null;
const server = createApp({
  generate: model ? async prompt => (await model.generateContent(prompt, { timeout: 60_000 })).response.text() : undefined,
});
server.listen(8787, '127.0.0.1', () => {
  console.log('AI Learning System: http://127.0.0.1:8787');
  console.log(apiKey ? 'AI provider configured.' : 'Set GEMINI_API_KEY in .env to enable AI.');
});
server.on('error', error => { console.error(`Server failed (${error.code || 'unknown'}).`); process.exitCode = 1; });
