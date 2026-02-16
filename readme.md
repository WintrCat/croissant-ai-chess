## 🥐 Croissant's AI Piece Chess

Chess, but every piece is controlled by a different LLM.

Uses [OpenRouter](https://openrouter.ai/) for API access to a range of LLMs, and [Gemini 2.5 Flash TTS](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts) for text-to-speech.

> [!IMPORTANT]
> This website is for local use only and has not been designed for
> publicly available production environments. Each game could cost
> several dollars in credits, and the server trusts data coming
> from the client.

### Local Deployment

#### Scripts

- `pnpm dev` - start frontend dev server with HMR and stuff
- `pnpm [-F <client/server>] build` - build for production
- `pnpm start` - start server

#### Environment Variables

Stored in `.env` in the root directory:

- `ORIGIN` - origin for production server e.g. `http://localhost:8080`.
- `DEV_ORIGIN` - origin for dev server e.g. `http://localhost:3000`.
- `THREADS` *(optional)* - number of threads to run server on. defaults to number of available cores.
- `PIECE_PICK_COUNT` *(optional)* - number of pieces that should give an opinion in a position. defaults to 1.
- `OPENROUTER_API_KEY` - API key for OpenRouter LLM aggregator.
- `TTS_API_KEY` - API key for Google Gemini TTS.