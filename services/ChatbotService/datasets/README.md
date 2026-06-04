# Chatbot Datasets

This folder holds the static datasets that feed the site's AI assistant (a RAG-based chatbot). The four JSON files act, respectively, as the **knowledge base**, the **FAQ**, the **behavior policies**, and the **system prompt**.

## Loading Flow

These files are not read directly at request time. A cron job loads them into Redis, and the runtime reads them back from Redis.

- Loader: [`../../CronService/jobs/loadAllChatbotDatasetsToRedis.ts`](../../CronService/jobs/loadAllChatbotDatasetsToRedis.ts)
- Consumer: [`../ChatbotRAGService.ts`](../ChatbotRAGService.ts)

| File | Extracted field | Redis key |
| --- | --- | --- |
| `rag-dataset.json` | `documents` | `rag:dataset` |
| `faq-dataset.json` | `items` | `faq:dataset` |
| `policy-dataset.json` | `policies` | `policy:dataset` |
| `system-prompt.json` | (whole object) | `system:prompt` |

> If a file is corrupt or missing, `tryRequireJson` returns a safe fallback (`{ documents: [] }`, `{ items: [] }`, etc.) so the chatbot does not crash. For type definitions see `@/types/features/ChatbotTypes` (`DatasetDocument`, `FaqItem`, `PolicyItem`, `SystemPromptData`).

---

## 1. `rag-dataset.json` — Knowledge Base (RAG)

The assistant's actual source of truth. Documents are chunked for embedding/similarity search and supplied to answers as grounding context.

### Root structure

```jsonc
{
  "dataset_version": "1.1.0",
  "dataset_name": "kuray-dev-rag",
  "owner": {
    "name": "Kuray Karaaslan",
    "preferred_name": "Kuray",
    "website": "https://kuray.dev",
    "timezone": "Europe/Istanbul",
    "language_primary": "tr",
    "language_secondary": "en"
  },
  "policy":    { /* grounding, no_hallucination, privacy, tone, answer_format */ },
  "retrieval": { /* chunking_guidance, ranking_hints */ },
  "documents": [ /* the actual content — see below */ ]
}
```

> **Important:** the loader writes only the `documents` array to Redis. The top-level `policy` / `retrieval` / `owner` blocks are documentary/guidance only — they are not passed to the runtime directly.

### `documents[]` item template

```jsonc
{
  "id": "kuray.profile.identity.001",   // unique, dotted-namespace convention
  "type": "profile",                     // profile | preference | ... (content category)
  "title": "Identity and Preferred Name",
  "tags": ["identity", "name", "bio"],  // search/ranking hints (matched by ranking_hints)
  "text": "Kuray Karaaslan is a full-stack developer ...", // the actual text to be chunked
  "metadata": {
    "source": "internal_user_memory",
    "language": "en",                    // en | tr
    "created_at": "2026-03-05",          // YYYY-MM-DD
    "confidence": 0.95                   // confidence score, 0–1
  }
}
```

When adding new knowledge: put a single atomic fact in `text`, give meaningful `tags`, and write `id` in the `area.subarea.topic.NNN` pattern.

### Example

```json
{
  "id": "kuray.profile.identity.001",
  "type": "profile",
  "title": "Identity and Preferred Name",
  "tags": ["identity", "name", "bio", "kuray"],
  "text": "Kuray Karaaslan is a full-stack software developer based in Turkey. He prefers to be called 'Kuray' rather than 'Ben'. He uses his full name as 'Kuray Karaaslan' publicly.",
  "metadata": {
    "source": "internal_user_memory",
    "language": "en",
    "created_at": "2026-03-05",
    "confidence": 0.95
  }
}
```

---

## 2. `faq-dataset.json` — Frequently Asked Questions

Pre-written question/answer pairs, used for fast, deterministic responses.

### Root structure

```jsonc
{
  "faq_dataset_version": "1.0",
  "owner": "Kuray Karaaslan",
  "items": [ /* FAQ items — only this array is written to Redis */ ]
}
```

### `items[]` item template

```jsonc
{
  "id": "faq_001",                       // faq_NNN, unique
  "question": "Who is Kuray Karaaslan?", // a question the user might ask
  "answer": "Kuray Karaaslan is a ...",  // canned answer text
  "tags": ["bio", "identity"]            // grouping/matching tags
}
```

### Example

```json
{
  "id": "faq_003",
  "question": "What technologies does Kuray use?",
  "answer": "Kuray primarily works with React, Next.js, Node.js, Express.js, PostgreSQL, Redis, React Native, WebSockets, and MQTT.",
  "tags": ["tech", "stack"]
}
```

---

## 3. `policy-dataset.json` — Behavior Policies

Rules that define what the assistant may and may not do. Injected as an extra safety/privacy layer on top of the system prompt.

### Root structure

```jsonc
{
  "policy_dataset_version": "1.0",
  "owner": "Kuray Karaaslan",
  "policies": [ /* rules — only this array is written to Redis */ ]
}
```

### `policies[]` item template

```jsonc
{
  "id": "policy_no_fake_personal_info",  // policy_<topic>, unique and descriptive
  "title": "No Fabricated Personal Information",
  "rule": "Do not invent personal details such as phone, email, address ...",
  "severity": "critical"                 // low | medium | high | critical
}
```

`severity` indicates the rule's importance; `critical` rules must never be relaxed.

### Example

```json
{
  "id": "policy_no_fake_personal_info",
  "title": "No Fabricated Personal Information",
  "rule": "Do not invent personal details such as phone number, email address, home address, exact location, family details, or private life information.",
  "severity": "critical"
}
```

---

## 4. `system-prompt.json` — System Prompt

Defines the assistant's identity and its immutable behavior rules. Unlike the other three files, the **entire object** is written to Redis (`intro` + `rules`).

### Root structure

```jsonc
{
  "system_prompt_version": "1.0",
  "owner": "Kuray Karaaslan",
  "intro": "You are a strictly scoped AI assistant embedded in ...", // the prompt's intro text
  "rules": [ /* rule items */ ]
}
```

### `rules[]` item template

```jsonc
{
  "id": 1,                  // numeric, sequential
  "name": "SCOPE",          // short UPPER_CASE label
  "rule": "You may ONLY discuss topics that exist in the provided blog context ..."
}
```

At runtime, `intro` and all `rules` are combined under a `=== MANDATORY RULES (NEVER VIOLATE) ===` header to form the system message (see `ChatbotRAGService.ts`).

### Example

```json
{
  "id": 2,
  "name": "IDENTITY",
  "rule": "You are \"AI Assistant\" for this specific website. You are NOT ChatGPT, GPT-4, Claude, or any general-purpose AI. Never claim to be or act as one."
}
```

---

## Editing Notes

- The JSON files can be edited by hand; make sure they stay valid JSON (no trailing commas).
- Changes take effect only when `loadAllChatbotDatasetsToRedis()` runs again (via cron or a manual trigger).
- `id` fields must be unique within each file.
- When adding a new RAG document, keep the text short and atomic (`retrieval.chunking_guidance.target_tokens` ≈ 250).
