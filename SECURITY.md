# Security policy

## Supported scope

This repository is a local research prototype, not a hosted multi-user service. Security fixes are applied to the current `main` branch.

## Reporting

Please do not publish API keys, user data, screenshots containing personal information, or exploit details in a public issue. Contact the repository owner through the GitHub profile and provide reproduction steps without real credentials or personal files.

## Local safety

- Keep `GEMINI_API_KEY` in an untracked `.env` file; never use a `VITE_`-prefixed secret.
- Use only documents and camera footage you are allowed to process.
- The local server binds to loopback by default. Public deployment requires authentication, HTTPS, rate limits and a production data store.
- Rotate any credential that may previously have been committed or exposed in a screenshot.
