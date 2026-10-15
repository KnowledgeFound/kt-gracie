# Model card — LFM2-350M in AI Gracie

Written for issue [#91](https://github.com/KnowledgeFound/kt-gracie/issues/91). Describes
the model as deployed in GRACIE, not the model in general. Upstream claims are attributed
to upstream; everything else here was measured on this project.

## What is deployed

| | |
|---|---|
| Model | LFM2-350M, instruction-tuned |
| Publisher | Liquid AI |
| Weights | `LiquidAI/LFM2-350M-GGUF`, file `LFM2-350M-Q4_K_M.gguf` |
| Quantisation | Q4_K_M (4-bit, k-quant medium) |
| Download | ~229 MB, one time, to the learner's browser cache |
| Licence | Apache 2.0 — **the LFM2 generation only**. LFM2.5 moved to a proprietary licence; the pin is deliberate |
| Runtime | `@wllama/wllama` ^3.6.1 — llama.cpp compiled to WebAssembly |
| Compute | WASM on the CPU; all layers offloaded to WebGPU where `isSupportWebGPU()` returns true |
| Context | `n_ctx: 2048` |
| Sampling | `temperature: 0.3` |
| Output cap | 96 tokens on the teaching route, 60 on the blended route |
| Hosting | Weights fetched from Hugging Face at first use. Self-hosting in the asset canister is an open decision (`engine.ts`) |
| Source of record | `src/kt-gracie-frontend/src/features/gracie-ai/engine.ts` |

## Why this model

From the 2026-08-30 benchmark round (`gracie-llm-lab`), Apple Silicon Mac, headless
Chromium, 64-token cap, temperature 0.3:

| Model | Runtime | Download | Load | First token | Decode |
|---|---|---|---|---|---|
| **LFM2-350M** | wllama / WASM | 229 MB | 2.0 s | 443 ms | **75.2 tok/s** |
| **LFM2-350M** | wllama / WebGPU | 229 MB | 2.2 s | **98 ms** | 76.2 tok/s |
| Qwen3-0.6B | wllama / WebGPU | 397 MB | 3.3 s | 349 ms | 62.2 tok/s |
| Gemma3-270M | wllama / WASM | 253 MB | 13.5 s | 447 ms | 50.7 tok/s |
| Granite-4.0-350M | wllama / WASM | 223 MB | 26.3 s | 504 ms | 26.5 tok/s |
| SmolLM2-360M | wllama / WASM | 271 MB | 16.4 s | 1502 ms | 32.0 tok/s |

The decision turned on the **WASM** column, not the WebGPU one. Research in
[#54](https://github.com/KnowledgeFound/kt-gracie/issues/54) established that a large part
of the intended device fleet — MediaTek Helio and Dimensity 700/6000-series, Unisoc — cannot
run WebGPU on any Android version, so the pure-WASM path is the only one those learners
have. LFM2-350M is roughly three times Granite's decode speed at the same size on that
path, quickest to first token, and Apache 2.0.

Under CPU throttling the ordering holds and widens: at 6× throttle LFM2 ran 79.5 tok/s
against SmolLM2-135M's 62.0 — the smaller model is not the faster one.

The licence mattered as much as the numbers. A UN-affiliated deployment cannot bind minors
to a custom EULA, which ruled out Llama 3.2's community licence and Gemma 1–3's terms.

## Intended use

- Explaining anti-corruption concepts drawn from UNODC material to a learner working
  through the GRACIE course: UNCAC, conflict of interest, bribery, procurement,
  whistleblowing, asset recovery.
- Writing one closing line of encouragement on a reply whose facts the application supplies.

That is the whole of it. The model is opt-in (`Settings → Gracie AI → Intelligence`);
the default is Robot mode, which uses no model at all.

## Out-of-scope use

The model is not used, and must not be used, to:

- state any fact about the learner's progress, score, tokens or history — those come from
  saved data through `templateReply()`;
- decide whether to refuse a request — refusals are fixed strings chosen by `classify()`
  before the model is consulted;
- give medical, legal, financial or crisis advice;
- assess, grade or rank a learner in any way that affects their record;
- produce content shown to anyone other than the learner who typed the prompt.

## Affected population

Stated audience is **young adults aged 17–25** (`README.md`; the `ageBucket` enum starts at
`#AGE_17_19`). In practice the product collects no age, has no age gate, and signup asks
only for a first name — so **minors can and do use it**, as this project's own notes
acknowledge. One module is aimed explicitly at "Young People & Communities".

Learners are expected across South Asia, Sub-Saharan Africa, South-East Asia and Latin
America, many on budget Android hardware and metered data. The interface and the model are
English-first.

## Data handling

Nothing the learner types leaves the device. There is no telemetry, no server round-trip
and no chat history upload; learner state is read from `localStorage`. The one network call
is the weight download from Hugging Face, which happens only after an explicit consent
dialog stating the size. Every reply carries a provenance badge distinguishing a model-written
sentence from saved data, a scripted line and a guard refusal.

## Known limitations

Measured or verified in this project; see the evaluation report for the evidence.

1. **Safety is not the model's.** Under the corpus in `safety/corpus/`, with no guard layer
   in front of it, this model answers rather than refuses the great majority of requests it
   should decline. Its alignment cannot carry the product; the guard layer is the safety
   plan.
2. **It reads "health" as medical.** Every candidate model in the 2026-08-30 round did.
   The shipped prompt never uses the word, and the UI's "City Health" is "City Score" to
   the model.
3. **It inverts scores.** Asked to describe a number, small models say things like "37
   shows your city is in good shape". The blended route therefore shows it no number at all.
4. **It does not reliably obey a length instruction** — roughly six times in ten — and the
   overrun is where invented figures appear. Length is enforced in `shape.ts` instead.
5. **Factual accuracy on UNCAC is unverified.** No retrieval grounds answers against vetted
   UNODC material. This is the largest open risk in the workstream and is not solved by
   model choice.
6. **English-centric.** Narrower language coverage than Qwen3-0.6B, which remains the
   alternative if a real multilingual requirement lands.
7. **Stateless.** The model receives no conversation history; each turn is answered alone.

## Governance notes

- Apache 2.0 imposes no downstream use restrictions, so nothing has to be passed through to
  learners as a contract. This was a selection criterion, not a coincidence.
- Pin the **LFM2** generation. LFM2.5 is proprietary; an upgrade inside the family needs a
  licence check first.
- Weights are fetched from a third party (Hugging Face) at runtime. There is no integrity
  check on the downloaded file beyond what wllama performs, and no pinned revision — see
  the report's residual-risk list.

## Version

| | |
|---|---|
| Evaluated | 2026-09-20 |
| App version | `feat/ai-gracie-safety-report`, cut from `develop` at `81d96cc` |
| Feature landed in | [PR #77](https://github.com/KnowledgeFound/kt-gracie/pull/77), merged 2026-09-15 |
