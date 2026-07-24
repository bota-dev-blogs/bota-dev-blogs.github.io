# Visual grammar

Choose a layout from the relationship the page must communicate.

## Article set selection

- Generate 2-3 Pipeline 2 candidate GIFs for a normal article, then embed only the approved subset.
- Rank candidate visuals by explanatory value and keep only the strongest complementary set.
- Give each GIF a distinct job, such as synthesis, architecture, trade-off, lifecycle, comparison, or operating model.
- Do not turn every heading into a GIF. Use more than three pages only for a renderer canary, layout development, or an explicit user request.
- Use one GIF only when the source genuinely has a single visual argument worth publishing.

## Single-canvas synthesis

- Keep node captions near 6–10 English words or 12–24 Chinese characters, with 12 English words as a hard ceiling.
- Resolve one shared caption size for the entire page: test the narrowest node, choose the largest size that fits all captions, and send the page back to summarization if that size falls below the comfortable threshold.
- Keep group labels compact, ideally under 20 characters. Expand the group boundary to contain the measured label before reducing its font.
- Treat the whole article as one argument, not a list of sections.
- Preserve the thesis, main transformation, decisive constraint, and final outcome; collapse supporting tools and examples into short captions.
- Use one dominant reading path and at most one secondary branch or detour.
- Prefer 4–6 compound nodes. A compound node may summarize two adjacent implementation stages when their distinction is not part of the article's main claim.
- Keep node captions shorter than in series mode; use the stricter single-canvas budget above.
- Use groups to name parallel tracks or outcomes, not to reproduce section headings.
- Choose a wide semantic map when the article has a strong left-to-right pipeline with one parallel track or research detour; keep square format for radial, cyclic, or balanced arguments.

| Layout | Use for | Required structure | Avoid when |
|---|---|---|---|
| `linear-flow` | ordered steps or transformations | one directed path | order is not meaningful |
| `staged-flow` | 3–6 substantial sequential steps that need two rows | one serpentine directed path with clear row turn | two or three compact nodes already fit comfortably in one row |
| `branching` | alternatives, categories, or decisions | one source and two or more branches | branches are actually sequential |
| `before-after` | contrasts, interventions, or state changes | two opposing states; optional bridge | more than two states matter equally |
| `cycle` | feedback, recurrence, or continuous improvement | closed directed loop | the process has a final endpoint |
| `hub-spoke` | one concept affecting several peers | central node and outward/inward spokes | peers depend on one another in sequence |
| `cause-effect` | several causes producing effects | directed cause-to-effect edges | chronology is the central message |
| `timeline` | evolution, history, or future stages | chronological nodes | events are causal but not temporal |
| `semantic-map` | parallel lanes, split/merge, shared supervision, or converging evidence | explicit node positions, typed edges, optional groups | a standard layout already expresses the logic |
| `converging` | several inputs feeding one result | one terminal synthesis node | inputs remain independent outcomes |
| `diverging` | one source producing several outcomes | one source and distinct destinations | destinations are sequential |
| `parallel-lanes` | two simultaneous tracks | two horizontal lanes | tracks frequently cross |
| `swimlanes` | roles or systems progressing in parallel | paired lane positions | a simple comparison is enough |
| `matrix` | balanced categories or criteria | two-by-two or three-by-two structure | direction is the central message |
| `funnel` | filtering or progressive narrowing | broad inputs and a narrow outcome | stages expand instead of narrow |
| `layered-stack` | hierarchy, stack, or maturity levels | vertically ordered layers | chronology needs horizontal reading |
| `bridge` | transition across intermediate supports | clear start and destination | there is no meaningful crossing |
| `decision-tree` | choices and downstream outcomes | root, branches, and leaves | branches reconnect immediately |
| `constellation` | peer concepts around a shared topic | balanced radial relationships | strict order matters |
| `relay-board` | one input using several transports before one policy gate | source, 1-3 route nodes, gate, result | routes are independent outcomes |
| `trust-stack` | credentials, validation, and policy boundaries | vertically ordered trust stages | physical transport is the main idea |
| `signal-path` | a signal becoming successive artifacts | one alternating path across 3-6 stages | stages are simultaneous peers |
| `control-loop` | sensing, decision, action, and feedback | one closed operational loop | the workflow terminates after one pass |
| `schema-rail` | contracts or schemas guiding a processing pipeline | 1-2 rule nodes followed by vertical process stages | rules are not reused across stages |
| `retrieval-loop` | a main request path enriched by memory or retrieval | three top-path nodes plus lower context nodes | context does not return to the main path |
| `scatter-gather` | one source processed in parallel and merged | source, 1-4 workers, one result | workers must run in sequence |
| `hourglass` | broad inputs compressed through one bottleneck | input set, one neck, narrowed outputs | there is no meaningful bottleneck |
| `spiral` | iterative refinement toward a stable inner state | ordered outer-to-inner stages | strict left-to-right reading is required |

## Page design

- Use a concrete input/process/result path for transformations.
- Do not compress four or more substantial process nodes into one horizontal strip. Prefer `staged-flow`, alternating rows, or a semantic map so the relay path has room and the composition occupies the canvas.
- Use edge labels for verbs such as “filters,” “causes,” “validates,” or “feeds back.”
- Use node captions for evidence, conditions, or examples; do not repeat the edge verb.
- Use finished reader-facing wording in all visible text. Avoid article-utility or internal editorial labels such as "takeaway", "TL;DR", "references", "appendix", "table of contents", "conclusion", "summary", "overview", "this article", "blog post", "section", "chapter", "figure", or "table". Prefer the actual concept label.
- Keep the reading direction visually obvious. Minimize crossing edges.
- Prefer three or four strong nodes over six weak fragments.
- Vary node count across pages when the source varies in complexity. Do not normalize every composition to three cards.
- Reuse the article-specific metaphor across pages through labels and captions, not fixed decorative prose.
- Use `semantic-map` rather than a fake timeline when networks run in parallel, several factors converge, or two channels merge downstream.
- For `semantic-map`, use positions to express relative structure. The renderer will fit the map into the available content frame; avoid compensating with artificial outer margins.
- Use groups only to label meaningful lanes or subsystems.
- Classify edges as `flow`, `supervision`, `evidence`, `contrast`, or `constraint`.
- Assign one `edgeGroup` to a continuous logical path. All edges in that group share color, dash rhythm, and weight; use node color or iconography to show a failure inside the path.
- Use `pathStyle: "curve"` and a signed `bend` for turns, branches, feedback, and long jumps. Mix straight and curved paths according to structure rather than decoration.
- Treat edge labels as a limited annotation layer between content planning and rendering. Mark only indispensable transition text as `essential`; keep inferred or repeated verbs `optional`.
- Before rendering, measure node bounds, group headings, every edge segment, and already accepted labels. Try alternate segments, positions, and sides; omit the label if none is collision-free.
- Draw accepted edge labels after nodes only after collision checks. Never preserve a label by letting it cover a line or sit underneath a content box.

## Semantic visual selection

- Use `person` only for an actual human role.
- Use `chat-bubbles` for a query, conversation, prompt, or exchange.
- Use `model` for an AI model, classifier, encoder/decoder, transformer, or inference system.
- Use `agent` only for an agentic system, planner, tool-using assistant, or explicit autonomous actor.
- Use `document` for an article, response, report, or generated artifact.
- Use `dataset` for a corpus, benchmark, annotations, labels, or training/evaluation data.
- Use `embedding` for vector representations, latent spaces, feature spaces, or semantic spaces.
- Use `database` for stored memory or a durable data source.
- Use `search` for retrieval, discovery, or extraction.
- Use `merge` for deduplication or reconciliation.
- Use `schema` for constraints, ontology, or structured fields.
- Use `graph` for entities and typed relationships.
- Use `link` for connections or integration.
- Use `clock` for temporal validity, delay, or history.
- Use `latency` for real-time response budgets, streaming delay, or low-latency constraints.
- Use `alert` for risk, invalid state, or failure.
- Use `idea` for an abstract claim only when no concrete object fits.
- Use `gear` for execution, automation, or transformation.
- Use `asr` for speech-to-text, transcription, and automatic speech recognition.
- Use `tts` for text-to-speech, speech synthesis, or generated voice.
- Use `waveform`, `microphone`, or `headphones` for acoustic signals, capture, and listening.
- Use `phone`, `edge-device`, `chip`, `gpu`, `server`, `router`, `sensor`, `cloud`, or `network` for mobile capture, on-device inference, silicon, accelerators, backend compute, connectivity, telemetry, cloud streams, and integrations.
- Use `room`, `speaker`, `subtitle`, `sliders`, `bot`, `lock`, `ear`, `video`, `target`, `branch`, or `filter` for physical meetings, speaker identity, captions/transcripts, tuning controls, meeting bots, consent/permission, always-on listening, media output, success criteria, alternatives, and thresholds.
- Use `music` for song emotion or musical affect.
- Use `globe` for cross-language or cross-dataset transfer.
- Use `shield` for privacy, uncertainty boundaries, or responsible product use.
- Use `layers` for frame-level versus utterance-level representations.
- Use `mask` for masked prediction or hidden input regions.
- Use `person`, `bot`, `agent`, `schema`, `graph`, `chat-bubbles`, and `idea`
  only when the source directly names that actor or abstraction. They should
  not be used as default filler icons.

Prefer concrete domain visuals before abstract ones. Reserve `idea`, `schema`,
`graph`, `chat-bubbles`, and `agent` for pages where that abstraction is the
actual subject, not as generic decoration.

Use `illustration` for a visually distinctive actor or object, `pill` for compact process steps, and `card` for evidence that needs explanatory text. Do not render every peer with the same container by default.

## Animation

- Keep all essential nodes and edges visible in the first frame.
- Animate attention along existing paths with a seamless dashed-line offset and two small relay pulses. Use compact endpoint markers; small triangle arrowheads are valid for flow, while evidence, supervision, contrast, and constraints should prefer relation-specific shapes.
- Animate the meaning inside each visual: write document lines, move search lenses, converge merge points, highlight schema rows, rotate clock hands and gears, pulse graph nodes, and alternate chat dots.
- Keep text and containers stable. Micro-animation belongs to the semantic object, not to arbitrary card wobble.
- Use periodic animation functions and sample frames without duplicating the first frame at the end. Ensure the implied next frame after the final frame advances smoothly into frame one.

## Layout-specific rhythm

- `semantic-map`: use a faint coordinate field and node halos to make parallel
  boundaries legible without adding more edges.
- `parallel-lanes` and `swimlanes`: use lane bands and one moving scan per lane;
  do not add duplicate labels to every connection.
- `funnel`: use narrowing stage gates and one moving aperture to show filtering.
- `timeline`: use a baseline, event ticks, and one traveling marker.
- `cycle`, `constellation`, and `hub-spoke`: use one orbit ring and a rotating
  marker; do not turn peer nodes into a dense web.
- `matrix`: use one row or column scan. Keep the cells static and readable.
- `relay-board`: use route bands plus one shared bus pulse so alternative
  transports still resolve into one policy result.
- `trust-stack`: use horizontal trust boundaries and stable vertical order.
- `signal-path`: use one waveform rail and alternating stage placement.
- `control-loop`: use one orbit marker and keep the feedback edge explicit.
- `schema-rail`: separate rules from execution with two framed zones and one vertical process spine.
- `retrieval-loop`: keep the request path horizontal and animate one lower feedback route into its center.
- `scatter-gather`: show parallel worker bands between one source and one merged result.
- `hourglass`: show a moving aperture across a stable bottleneck outline.
- `spiral`: move one marker from the broad outer state toward the refined inner state.

## Color layers

- Keep container color and semantic illustration color independent.
- Use the container background to group related content.
- Use familiar semantic colors inside the container: red for prohibition or failure, green for successful merging or validation, blue for documents and search, pink for time, and multiple coordinated colors for graphs or AI systems.
- Allow a red warning or prohibition symbol inside a green process container when that contrast communicates the meaning.
- Do not recolor every internal illustration from the container index.
- Fit semantic illustrations into invisible rectangular viewports. Scale the complete drawing before placement; do not crop an oversized drawing through a visible circular mask.
- Keep icon scale proportional to nearby text and reserve circular frames only when the circle itself carries meaning.
