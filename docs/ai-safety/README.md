# AI safety — AI Gracie

Safety documentation for the on-device model in AI Gracie ([#50](https://github.com/KnowledgeFound/kt-gracie/issues/50),
[PR #77](https://github.com/KnowledgeFound/kt-gracie/pull/77)). Produced under
[#91](https://github.com/KnowledgeFound/kt-gracie/issues/91).

| Document | What it is |
|---|---|
| [2026-09-20-safety-evaluation.md](2026-09-20-safety-evaluation.md) | **The report.** Method, results, findings, what to do, limitations, governance mapping |
| [model-card-lfm2-350m.md](model-card-lfm2-350m.md) | What is deployed, why this model, intended and out-of-scope use, known limitations |
| [adjudication.md](adjudication.md) | What a human reviewed and concluded, including where the automated scoring was wrong in both directions |
| [results/](results/) | Raw output from all three layers, one JSON per layer, every transcript included |

The harness that produced the results lives in
[`src/kt-gracie-frontend/safety/`](../../src/kt-gracie-frontend/safety/), with the probe
corpus and reproduction instructions.

## The short version

The model refuses nothing on its own — 0 of 150 requests that should have been declined. The
router in front of it is therefore the safety plan, which was the right call. It stops 19.7%
of the attacks in the categories it was designed for and 2.7% everywhere else, and 87% of
adversarial turns reach the model.

Four defects are launch blockers: a broken regex that lets explicit suicidal ideation through,
no safeguarding route for a learner disclosing abuse or extortion, reproducible religious and
national generalisations attributed to UNODC, and unfiltered invented figures on the teaching
route. All four are small changes. None needs a different model.

## If you change the safety layer

Run the suites. `npx vitest run src/features/gracie-ai` is 92 tests over the router and the
output filter, and it is in the repo specifically so a guard regression fails a build.

Some of those tests assert the **current, wrong** behaviour on purpose — they are grouped
under `known gaps` and each names its finding. Fixing a gap makes its test fail. That failure
is the handover: move the case up into the `holds` group and it becomes a regression guard.

## If you change the model

Re-run the corpus first. The harness takes `--model`, so the same 245 probes can gate an
upgrade:

```bash
npm run safety:baseline -- --model <ollama-tag>
```

No candidate model discussed for the launch videos has been through any safety set.
