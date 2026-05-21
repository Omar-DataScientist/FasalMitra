# PITAMBAR Frontend Integration Guide

This guide is aligned with the current branch and the actual backend API behavior.

## 1. Backend capabilities

### 1.1 Core query workflow

The backend supports:
- Natural language farmer queries via `POST /query`
- Audio voice queries via `POST /query/voice`
- Intent classification into `market`, `policy`, `tech`, `crop`, or `multi`
- Entity extraction from user text
- Specialist agent execution for market, policy, tech, and crop advice
- Multi-agent synthesis when a query spans multiple domains
- In-memory session history and evolving user profiles
- RAG context from `data/documents/`

### 1.2 Main integration points

Use these backend modules as the source of truth:
- `app/routes/query_route.py` — public API endpoints
- `app/controllers/query_controller.py` — result sanitization and audio integration
- `core/orchestrator.py` — pipeline orchestration
- `core/router.py` — intent classification
- `core/synthesizer.py` — final answer composition
- `llm/groq_client.py` — all LLM calls
- `tools/apis/*` — weather/market/scheme live data
- `tools/rag/*` — semantic search and document context
- `memory/*` — session and profile persistence
- `multimodal/*` — transcription and TTS

## 2. API surface for frontend

### 2.1 `POST /query`

Request JSON:
```json
{
  "message": "What is the current price of onion in Pune?",
  "session_id": "farmer-123"
}
```

Response JSON:
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

Important:
- The field is `message`, not `query`.
- The backend returns only sanitized output, not raw agent internals.

### 2.2 `POST /query/voice`

Form fields:
- `audio` — file upload
- `session_id` — string
- `language` — BCP-47 hint like `hi`, `en`, `mr`

Example curl:
```bash
curl -X POST http://localhost:8000/query/voice \
  -F "audio=@query.wav" \
  -F "session_id=farmer-123" \
  -F "language=hi"
```

Response includes:
- `final_response`
- `agents_used`
- `sources`
- `audio_base64` — MP3 bytes encoded as base64

### 2.3 Health check

```bash
curl http://localhost:8000/health
```

Response:
```json
{"status":"ok","service":"PITAMBAR","version":"1.0.0"}
```

## 3. Frontend features to build

### 3.1 Query UI

- Text input for farmer questions
- Submit action to call `/query`
- Optional session ID field (default is fine)
- Visual loading state while waiting
- Display `final_response` prominently
- Display `intent` and `agents_used` for debugging or tag UX
- Display source URLs under the answer

### 3.2 Voice UI

- File upload or microphone capture for audio
- `session_id` and `language` controls
- Playback support for `audio_base64`
- Error handling for transcription or pipeline failures

### 3.3 Session experience

- Keep `session_id` persistent locally so the backend can maintain history
- Show a query history list or recent responses
- Optionally offer a “new session” button

### 3.4 Optional advice cards

Frontend can surface response structure with these lanes:
- Market & price advice
- Government scheme guidance
- Technology/equipment recommendations
- Crop management and disease advice

Since the backend only returns a single `final_response`, use the `intent` and `agents_used` fields to label the answer.

## 4. What the frontend should not assume

- There is no public `/weather`, `/market-prices`, or `/schemes` endpoint today.
- The backend does not return low-level `agent_results` or `rag_context` in the response.
- Transcript text is not returned from the voice endpoint.
- `audio_base64` is only returned on voice requests.

## 5. Backend data and state available

The service also maintains these internal capabilities, which can inform frontend decisions:

- Session memory: last 6 user/assistant messages
- User profile hints: inferred location, crops, language, land size, and name
- RAG document search via `data/documents/`
- Live weather, market, and scheme search helpers used by agents
- Multi-agent synthesis when a query spans multiple categories

## 6. Frontend UX priorities

- Keep language farmer-friendly and regional.
- Show a clear response headline and supporting sources.
- Indicate if the answer is based on “current public data” vs. “general advisory”.
- Provide fallback guidance when prediction confidence is low or the response is generic.
- For voice, show a success/failure state and play back synthesized audio.

## 7. Frontend checklist

- [ ] Use `POST /query` for text input
- [ ] Use `POST /query/voice` for audio input
- [ ] Persist `session_id` across user interactions
- [ ] Display `final_response` and `intent`
- [ ] Show `sources` as clickable links
- [ ] Support language hint selection
- [ ] Show loading and error states
- [ ] Support playback of `audio_base64`
- [ ] Consider a simple history list

## 8. Useful files to inspect

- `app/routes/query_route.py` — API contract
- `app/controllers/query_controller.py` — response sanitization
- `core/orchestrator.py` — complete pipeline behavior
- `core/router.py` — intent classification logic
- `core/synthesizer.py` — final response handling
- `agents/*.py` — domain-specific agent behavior
- `tools/apis/*` — live data sources used by agents
- `tools/rag/*` — semantic context retrieval
- `memory/*` — session and profile persistence
- `multimodal/*` — speech transcription + synthesis
- `config/settings.py` — environment defaults

---

Use this guide while building the frontend and wiring it to the current backend API.
