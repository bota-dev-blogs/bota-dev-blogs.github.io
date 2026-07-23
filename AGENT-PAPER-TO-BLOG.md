# Agent: Paper To Blog

Use this workflow when the input is a scientific paper and the output should be an SEO-focused blog post with publishable media.

The goal is not to republish papers. The goal is to build an original AI research explanation platform: clear educational articles, visual explanations, practical interpretation, and prominent attribution to the original authors.

This is an operational content guideline, not legal advice. If the site becomes commercial, high-traffic, or uses third-party assets beyond links and short references, get a formal copyright review.

## Strong Guiding Principle

The generated article must read like an original educational blog post inspired by a research paper, not like a rewritten or republished version of the paper itself.

Every section should prioritize explanation, interpretation, visualization, and practical insight over paraphrasing the original text. The blog should add substantial original value while giving clear and prominent attribution to the original authors and their work.

The published article should not explicitly mention the site brand in the article voice. Avoid phrases such as "[brand]-style infrastructure", "at [brand]", "we at [brand]", or "[brand]'s view". Write in a neutral editorial voice that focuses on the paper, the technical idea, and the reader's use case.

## Inputs

Start with one or more of:

```text
arXiv URL
official paper page
paper PDF under .tmp/papers/
official code URL
official project page
dataset URL
notes from the author
```

Prefer official links over rehosted files. Do not publish the paper PDF in this repo unless the user explicitly asks for it and has the right to do so.

## Positioning

Position each paper article as:

```text
paper explanation
paper review
research digest
technical interpretation
visual walkthrough
```

If the source is a technical report, survey notes, or several Markdown files rather than one formal paper, position the output as a research digest or survey-style article. Use `contentType: "research-digest"` unless the post is centered on one specific paper with a complete `paper:` attribution block.

Do not position the site as:

```text
paper archive
paper repository
paper mirror
PDF download site
```

The ideal reader should feel: "This page helps me understand the paper faster than reading the PDF first."

## Output Paths

Write the blog post here:

```text
src/content/blog/<slug>.mdx
```

Put normal publishable assets here:

```text
public/media/<slug>/
```

Put generated GIF assets here:

```text
public/media/gifs/<asset-slug>/pipeline-1/
public/media/gifs/<asset-slug>/pipeline-2/
```

The asset slug is a filesystem-safe version of the post slug. Use it in media paths and generated GIF folders.

Do not create root-level `blogs/`, `media/`, or `assets/` folders.

## SEO Title Strategy

Do not use the exact paper title as the blog title. The title should signal explanation, analysis, or practical value. Also avoid turning post type labels into repetitive headline suffixes: `Research Digest`, `Paper Review`, and `Visual Guide` are useful positioning categories, but they should not appear in every title.

Bad:

```text
Attention Is All You Need
```

Good:

```text
Attention Is All You Need Explained: Why Transformers Changed Modern AI
How Self-Attention Works: A Visual Guide to the Transformer Paper
DeepSeek R1 Explained: Reasoning Model Architecture and Training Pipeline
Wake Word Detection Is Becoming Intent Gating
A Field Guide To Emotion-Aware ASR
What Device-Directed Speech Changes About Voice Assistants
```

Use the original paper title in the `paper.title` frontmatter and attribution block, not necessarily as the blog headline.

## Required Frontmatter

Every paper blog should include SEO fields, visible tags, and paper attribution metadata:

```yaml
---
title: "Readable SEO article title with explanation intent"
slug: "post-slug-explained"
description: "Search-focused summary that says what readers will understand."
authors: ["Editorial Team"]
date: "YYYY-MM-DD"
modifiedDate: "YYYY-MM-DD"
readTime: "7 min read"
contentType: "paper"
tags:
  - "Paper"
  - "Frontier Paper"
  - "Audio AI"
keywords:
  - "original paper title"
  - "main method explained"
  - "how it works"
  - "audio AI"
paper:
  title: "Original paper title"
  url: "https://arxiv.org/abs/..."
  authors:
    - "Original Author"
  venue: "arXiv"
  year: "2023"
  code: "https://github.com/..."
  project: "https://..."
  dataset: "https://..."
cover:
  src: "/media/gifs/<asset-slug>/pipeline-2/01-article-summary.gif"
  alt: "Animated visual explanation of the original paper's method"
  width: 1396
  height: 620
  fit: "contain"
media:
  - title: "Visual method explanation"
    src: "/media/gifs/<asset-slug>/pipeline-2/01-article-summary.gif"
    type: "image"
    note: "Original visualization generated from the public paper."
---
```

The rendered layout uses `paper:` to show a prominent third-party research attribution block. Keep it filled in for all paper posts.

## Required Article Structure

Do not follow the paper's section order mechanically. Avoid a structure like:

```text
Abstract
Introduction
Related Work
Method
Experiments
Conclusion
```

Use a blog-native structure:

```text
## Why This Paper Matters
## The Big Idea
## Visual Walkthrough
## What The Paper Claims
## How It Works
## What Makes It Different
## Practical Applications
## Strengths And Limitations
## Can You Reproduce It?
## Who Should Read This Paper?
## FAQ
## References
```

Not every post needs every section, but every post must include original explanation, practical interpretation, and references.

## Featured Research Paper Block

The page layout already renders a prominent attribution block from `paper:` frontmatter. The article body should also include a short source/reference section near the end.

Use this intent:

```text
Featured Research Paper

This article explains and summarizes third-party research.
All research contributions belong to the original authors.
This article's contribution is educational explanation, interpretation, and original visualization.
```

Always link to the official paper page or arXiv page. Add official code, project, and dataset links when available.

## Writing Rules

- Write in blog language, not paper language.
- For survey-style research digests, write with a stronger literature-review structure: research question, terminology, historical trajectory, method families, frontier directions, limitations, and practical implications. Keep `research-digest` in frontmatter when appropriate, but make the title sound like a specific article, not a repeated content label.
- Use "the authors propose", "the paper introduces", and "the authors evaluate".
- Do not write "our method", "our experiment", or "our model" when describing third-party research.
- Do not explicitly mention the site brand in the article body, author-facing commentary, examples, or practical implications.
- Use neutral phrases such as "an audio AI stack", "production systems", "downstream applications", or "meeting intelligence products" instead of branded phrases.
- Treat the post as commentary, explanation, implementation notes, or a visual guide.
- Distinguish paper claims from editorial interpretation.
- Include a `References` section with the original paper and official related links.
- Add inline links for difficult concepts the first time they appear. Link terms such as zero-shot learning, VAD, ASR, MFCC, beamforming, false accept rate, EER, knowledge distillation, device-directed speech, or other domain vocabulary to reliable concept pages, official docs, or relevant papers.
- Build a reference network, not only a source list. Important claims should point either to the `References` section, an official source, a concept explainer, or a representative paper.
- Use tags to identify the post type and topic, for example `Paper`, `Frontier Paper`, `Audio AI`, `LLM`, `Speech`, or `Research`.

## Copyright And Content Boundaries

Low-risk and preferred:

- Explain the paper in your own words.
- Reorganize the content around reader understanding.
- Generate original GIFs, diagrams, timelines, and flowcharts.
- Link to the official paper, project page, code, and dataset.
- Attribute authors prominently.
- Quote only very short snippets when necessary, with clear source labeling.

Do not:

- Copy the paper abstract.
- Rewrite the abstract sentence by sentence.
- Copy long passages from the paper.
- Mirror the paper's section structure with light paraphrasing.
- Screenshot or reuse figures, tables, architecture diagrams, or pipeline diagrams from the paper.
- Copy experiment tables directly.
- Host the paper PDF for download.
- Present the original research contribution as the site's work.

If numeric results matter, summarize the finding in prose or create an original visualization from a small, clearly attributed subset of data. Do not reproduce full tables from the paper.

## Original Value Requirements

Each article should add original value beyond summary:

- Explain why the paper matters.
- Identify the core idea in plain language.
- Add a visual walkthrough.
- Explain what is new compared with related work.
- Discuss practical applications.
- Discuss limitations and uncertainty.
- Explain reproduction difficulty when relevant.
- Add a short FAQ targeting real search intent.
- Link to related concepts and papers to build a knowledge network.

SEO value comes from answering questions that papers usually do not answer:

```text
How does this method work?
Why should I care?
What is the key innovation?
Can I use it in a real product?
How hard is it to reproduce?
What are the limitations?
Who should read this paper?
How does it compare with related methods?
```

## GIF Workflow

The GIF renderers do not call an LLM. The active coding agent must first read
the selected pipeline's `SKILL.md`, study the paper and article, and author the
intermediate storyboard.

For compact section explainers, read `AI/ai-gif-pipeline-1/SKILL.md` and write:

```text
public/media/gifs/<asset-slug>/pipeline-1/storyboard.json
```

Then render it:

```bash
npm run gif -- 1 --input public/media/gifs/<asset-slug>/pipeline-1/storyboard.json
```

For an article-wide graphical abstract, research landscape, architecture,
comparison, or checklist, read `AI/ai-gif-pipeline-2/SKILL.md` and write:

```text
public/media/gifs/<asset-slug>/pipeline-2/storyboard.json
```

Then render it:

```bash
npm run gif -- 2 --input public/media/gifs/<asset-slug>/pipeline-2/storyboard.json
```

Both pipelines write:

```text
public/media/gifs/<asset-slug>/pipeline-<n>/storyboard.json
public/media/gifs/<asset-slug>/pipeline-<n>/*.gif
public/media/gifs/<asset-slug>/pipeline-<n>/manifest.json
```

For research digests or survey posts, pipeline 2 can contain multiple
storyboard pages and publish several research maps, such as:

```text
01-article-summary.gif
02-operating-point.gif
03-research-frontier.gif
04-design-checklist.gif
```

GIF rules:

- Generate original visual explanations.
- Do not convert paper figures into GIFs.
- Do not trace paper figures too closely.
- Use pipeline 1 for compact section explainers without arrows.
- Use pipeline 2 for a method, architecture, data flow, graphical abstract, research landscape, comparison map, or practical checklist. Dense survey posts often benefit from 2-5 pipeline-2 visuals distributed through the article.
- Do not let generated GIF artwork display internal editorial labels such as "takeaway". Use reader-facing labels such as "key idea", "design rule", "checklist", or the actual concept being explained.
- Use the shared icon vocabulary in `AI/shared/semantic-icons.cjs`. Prefer concrete AI/audio/mobile/edge/computing icons such as ASR, TTS, microphone, waveform, phone, edge device, chip, GPU, server, router, dataset, embedding, model, gate, filter, and latency before generic idea/agent/schema icons. Keep fallback icons concrete and narrow; fallback should not select person, bot, idea, agent, schema, graph, or chat bubbles.
- Give every published Pipeline 1 card and Pipeline 2 node an explicit canonical `icon` or `visual`; `npm run gif:check` rejects missing or unknown icons.
- For pipeline-2 semantic maps, treat coordinates as relative anchors. Do not add fake margin in coordinates; the renderer fits the map into the content frame.
- Reference GIFs from MDX with public paths only.

Example:

```mdx
![Research map](/media/gifs/<asset-slug>/pipeline-2/01-article-summary.gif)
```

## References Section

End paper posts with a references section:

```mdx
## References

- Original paper: [Paper title](https://arxiv.org/abs/...)
- Code: [official repository](https://github.com/...)
- Project page: [project name](https://...)
- Dataset: [dataset name](https://...)
```

Include only links that are relevant and official or clearly trustworthy.

## SEO Checklist

Before publishing, check:

- The title is not identical to the paper title.
- The slug includes explanation intent when natural, such as `explained`, `visual-guide`, or `how-it-works`.
- The description is written for search users, not only paper readers.
- Keywords include the paper name, method name, domain, and long-tail search intent.
- Tags are visible and useful.
- The post answers practical reader questions.
- The post contains original explanation and interpretation.
- The post links to related topics or papers when useful.
- Difficult terms are linked inline on first use.
- Survey-style posts include enough references to support the research map, not only the final conclusion.
- Longer research digests use visual aids near dense sections, especially comparison tables, frontier maps, and practical checklist sections.
- The cover image has descriptive alt text.
- The page has a complete `paper:` attribution block.

## Review Checklist

Before handoff:

```bash
npm run build
SITE_URL=https://bota.dev npm run build
npm run export:bota -- <slug>
```

Check that:

- The post has `contentType: "paper"`, visible `tags`, and a complete `paper:` block.
- The rendered page says the paper is third-party research.
- The article body does not copy the abstract, figures, tables, or long passages.
- The article uses original blog structure rather than the paper's table of contents.
- The article uses "the authors" or "the paper", not "we" or "our", for third-party work.
- Canonical URLs are correct for the target build.
- GIFs and other media live under `public/media/`.
- The handoff bundle is under `.exports/bota/<slug>/files/`.

For production handoff, copy only:

```text
.exports/bota/<slug>/files/
```

Never copy `AI/`, `.tmp/`, `.exports/`, `node_modules/`, pipeline `output/`, frame folders, or unlicensed third-party PDFs into the production blog deployment.
