# PITAMBAR — Farmer Advisory Backend

A production-ready AI backend for Indian agricultural advisory. This branch contains the working FastAPI service, multi-agent orchestration, RAG retrieval, search helpers, speech support, and in-memory session/profile storage.

## What this repo contains

- `app/` — FastAPI entrypoint, route definitions, and request controller.
- `core/` — the LangGraph pipeline, router, synthesizer, and shared state schema.
- `agents/` — specialist agents for `market`, `policy`, `tech`, and `crop` advisory.
- `llm/` — Groq client wrapper and prompt files for intent classification, agent behavior, and synthesis.
- `tools/apis/` — weather, market, and government scheme fetchers.
- `tools/rag/` — Qdrant-based semantic indexing and context retrieval.
- `tools/scraping/` — RSS news scraping for agriculture headlines.
- `memory/` — session conversation store and user profile extraction.
- `multimodal/` — Whisper transcription and gTTS synthesis.
- `config/settings.py` — environment-driven settings and logger setup.
- `data/documents/` — local knowledge docs for RAG indexing.
- `requirements.txt` — actual Python dependencies.

## Key runtime flow

1. `app/main.py` starts FastAPI and loads RAG documents at startup.
2. `app/routes/query_route.py` exposes:
   - `POST /query` for text queries
   - `POST /query/voice` for audio queries
3. `app/controllers/query_controller.py` sanitizes pipeline results and converts audio bytes into base64.
4. `core/orchestrator.py` builds a LangGraph pipeline that:
   - enriches session/profile state
   - retrieves RAG context
   - classifies intent and chooses agents
   - executes one or more specialist agents
   - synthesizes the final response
   - saves conversation memory
5. `core/synthesizer.py` returns single-agent results directly, and uses the synthesis prompt only for multi-agent merges.

## Component details

### `app/main.py`
- Configures CORS for browser clients.
- Uses a FastAPI lifespan context for startup/shutdown.
- Initializes the Qdrant collection and indexes `data/documents/` before serving.
- Includes `GET /health` for readiness checks.

### `app/routes/query_route.py`
- `POST /query` accepts JSON with `message` and optional `session_id`.
- `POST /query/voice` accepts `multipart/form-data` with `audio`, `session_id`, and `language`.
- Returns `500` for pipeline failure and `422` for transcription failure.

### `app/controllers/query_controller.py`
- Converts raw `bytes` to base64 for JSON safety.
- Drops non-essential `None` values.
- Bridges text and voice requests into `core.orchestrator.process()`.
- Voice route adds `audio_base64` to the response.

### `core/state.py`
Defines the shared `PitambarState` TypedDict, including:
- `query`, `session_id`, `user_profile`
- `intent`, `entities`, `agents_needed`
- `rag_context`, `agent_results`, `conversation_history`
- `final_response`, `audio_output`, `error`

### `core/router.py`
- Uses `llm/prompts/router_prompt.txt` to classify intent and extract entities.
- Parses LLM JSON output with fallback rules.
- Supports intents: `market`, `policy`, `tech`, `crop`, `multi`.

### `core/orchestrator.py`
- Uses a compiled `langgraph` state graph.
- Runs `enrich_state`, `rag`, `router`, `single_agent`/`parallel_agents`, `synthesizer`, and `save_memory`.
- Maps agent names to their actual `run()` functions.
- Returns a normalized response with `query`, `intent`, `final_response`, `agents_used`, `sources`, and `session_id`.

### `core/synthesizer.py`
- If one agent produced output, returns it directly.
- If multiple agents produced output, synthesizes them with the LLM.
- Falls back to concatenated answers when synthesis fails.

### `agents/base_agent.py`
- Central agent execution helper.
- Loads prompt files and calls `llm/groq_client.call_llm()`.
- Builds a prompt with query, entities, and extra context.
- Returns a standardized result object.

### `agents/market_agent.py`
- Uses DuckDuckGo search via `tools/apis/market_api.py`.
- Builds agent context from live mandi price snippets.

### `agents/policy_agent.py`
- Uses `tools/apis/govt_scheme_api.py` and RAG context.
- Merges search snippets and related document context.

### `agents/tech_agent.py`
- Uses market search for equipment pricing plus RAG context.
- Aims at irrigation, machinery, sensors, and farm tools.

### `agents/crop_agent.py`
- Adds weather context, mandi snippets, and RAG to the crop query.
- Focuses on crop management, pests, fertilizer, and disease advice.

### `llm/groq_client.py`
- Contains the only direct Groq SDK integration.
- Uses a singleton `AsyncGroq` client.
- Caps output at `1024` tokens.
- Exposes `call_llm(system_prompt, user_message, model, temperature)`.

### `llm/prompts/`
- `router_prompt.txt` — routing intent + entities.
- `market_prompt.txt` — market advisor.
- `policy_prompt.txt` — scheme advisor.
- `tech_prompt.txt` — technology advisor.
- `crop_prompt.txt` — agronomy advisor.
- `synthesis_prompt.txt` — final response merger.

### `tools/apis/weather_api.py`
- Uses Open-Meteo geocoding + forecast.
- Returns 5-day weather data for a given location.
- No API key required.

### `tools/apis/market_api.py`
- Uses `ddgs` DuckDuckGo text search.
- Searches for mandi price data and returns titles/snippets/URLs.

### `tools/apis/govt_scheme_api.py`
- Uses `ddgs` to search for Indian government agricultural schemes.
- Enriches queries with scheme-related keywords.

### `tools/rag/vector_store.py`
- In-memory Qdrant collection with SentenceTransformer embeddings.
- Supports indexing documents and semantic search.

### `tools/rag/retriever.py`
- Loads `.txt` and optional `.pdf` files from `data/documents/`.
- Builds a prompt-ready context block from top RAG hits.

### `tools/scraping/rss_parser.py`
- Fetches agricultural news from registered RSS feeds.
- Returns deduped headlines and summaries.

### `memory/session_memory.py`
- In-memory session store for conversation history.
- Stores user/assistant messages and supports expiry.

### `memory/user_profile.py`
- Detects and stores profile hints from queries.
- Extracts location, crops, language, land size, and name.

### `multimodal/speech_to_text.py`
- Uses OpenAI Whisper locally.
- Requires `ffmpeg` installed.
- Accepts any ffmpeg-compatible audio format.

### `multimodal/text_to_speech.py`
- Uses gTTS to synthesize MP3 bytes.
- Supports Hindi, English, Marathi, Punjabi, Gujarati, Bengali, Telugu, Tamil, Kannada, Malayalam.

## Environment & setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Create `.env`
Minimum required:
```env
GROQ_API_KEY=your_groq_api_key
```

Optional overrides:
```env
GROQ_MODEL=llama-3.3-70b-versatile
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1/forecast
WHISPER_MODEL=base
QDRANT_COLLECTION=pitambar_docs
RAG_TOP_K=5
DATA_DOCUMENTS_DIR=data/documents
SESSION_TTL_SECONDS=1800
LOG_LEVEL=INFO
```

### 3. Run the service
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Health check
```bash
curl http://localhost:8000/health
```

## API usage

### Text query
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the current price of onion in Pune?", "session_id": "farmer-123"}'
```

### Voice query
```bash
curl -X POST http://localhost:8000/query/voice \
  -F "audio=@query.wav" \
  -F "session_id=farmer-123" \
  -F "language=hi"
```

### Example response for `/query`
```json
{
  "query": "What is the current price of onion in Pune?",
  "intent": "market",
  "final_response": "Current onion mandi prices in Pune are...",
  "agents_used": ["market"],
  "sources": ["https://..."],
  "session_id": "farmer-123"
}
```

### Example response for `/query/voice`
```json
{
  "query": "मुझे प्याज की मंडी कीमत क्या है?",
  "intent": "market",
  "final_response": "पुणे की मंडी में प्याज की कीमत ...",
  "agents_used": ["market"],
  "sources": ["https://..."],
  "session_id": "farmer-123",
  "audio_base64": "..."
}
```

## Frontend integration notes

- The frontend should call `/query` from browser clients.
- The service already allows CORS from all origins.
- For voice queries, upload `audio` with `multipart/form-data`.
- `message` is the request field name for text queries.
- Current API does not expose raw `agent_results` or `rag_context`; use `final_response`, `intent`, `agents_used`, and `sources`.
- `audio_base64` is returned only for voice queries.

## Notes

- `data/documents/` is the local RAG knowledge base. Add `.txt` or `.pdf` files to improve context.
- If `ffmpeg` is missing, speech transcription will fail.
- The backend is designed for Indian agriculture and includes regional language support.
- Each Python module includes a self-test block useful for debugging.

## Good to know

- `core/orchestrator.py` uses `langgraph` to run the pipeline.
- `memory/user_profile.py` extracts farmer profile hints from the conversation.
- `agents/*_agent.py` enrich queries with external live data before calling the LLM.
- `core/synthesizer.py` avoids an LLM call if only one agent is required.
- `tools/apis/` are helper data sources, not public frontend endpoints.

---
