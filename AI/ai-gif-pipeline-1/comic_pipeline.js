const { createCanvas } = require('@napi-rs/canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');
const sharedIcons = require('../shared/semantic-icons.cjs');

const W = 1000, H = 1000, FPS = 20, DURATION = 2;
const BG = '#fffdf8', INK = '#292b42', MUTED = '#667085';
const FONT_STACK = '"Avenir Next","Inter","Segoe UI","Helvetica Neue",Arial,"Microsoft YaHei",sans-serif';
const PALETTE = ['#eefaf6', '#eef3ff', '#fbf0f7', '#fff6df', '#f0f8ea', '#f7f5ff'];
const ACCENTS = ['#259d8f', '#557bd8', '#ad67a7', '#e99b1c', '#69a34f', '#d85f91'];
const LAYOUTS = [
  'row', 'timeline', 'spotlight', 'stacked', 'grid', 'mosaic', 'compare', 'lanes', 'checklist',
  'flow-board', 'bento', 'split-focus', 'staircase', 'bands', 'triptych', 'dashboard', 'orbit',
  'matrix', 'system-board', 'failure-focus'
];
const COMPOSITIONS = ['flow', 'comparison', 'checklist', 'system-map', 'failure-map', 'evidence-map', 'compact-grid', 'spotlight'];
const INTRO_STYLES = ['guide', 'badge', 'ribbon', 'split', 'quiet'];
const TITLE_TREATMENTS = ['underline', 'corner-tag', 'side-note', 'none'];
const SURFACES = ['sheet', 'open', 'lanes', 'soft-panel', 'frame'];
const BOARD_LEFT = 64;
const BOARD_RIGHT = 936;
const BOARD_BOTTOM = 946;

function usage() {
  console.log('Usage: node comic_pipeline.js <article.md|storyboard.json> [output-dir] [--page n]');
}

function parseArgs(argv) {
  const positional = [];
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--page') args.page = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') args.help = true;
    else positional.push(arg);
  }
  return { input: positional[0], outDir: positional[1] || 'output', page: args.page, help: args.help };
}

function slug(s) {
  return String(s || 'article').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'article';
}

function assetSlug(s) {
  return String(s || 'blog-gif').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || 'blog-gif';
}

function assetSlugFromOutputDir(outputDir) {
  const base = path.basename(outputDir);
  const candidate = /^pipeline-\d+$/.test(base) ? path.basename(path.dirname(outputDir)) : base;
  return assetSlug(candidate);
}

function hashText(text) {
  let hash = 0;
  for (const char of String(text || '')) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function pickFrom(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolveIconName(name, text, index = 0) {
  return sharedIcons.resolveIconName(name, text, index);
}


function pageText(page) {
  return [
    page.title,
    page.section,
    page.kicker,
    ...(page.cards || []).flatMap((card) => [card.title, card.body])
  ].filter(Boolean).join(' ').toLowerCase();
}

function inferComposition(page) {
  const text = pageText(page);
  if (/negative result|fail(?:ed|ure)?|did not work|not work|missing vowel|too much missing|pronunciation did not|bottleneck|alert/.test(text)) return 'failure-map';
  if (/\bvirtual\b|\bphysical\b|versus|\bvs\b|compare|comparison|\boption\b|trade[- ]?off|\bphone\b|\broom\b|\benterprise\b|path a|path b/.test(text)) return 'comparison';
  if (/pipeline|segment|translate|translation|rebuild|flow|stage|step|source|output|process|locali[sz]ation|synthesis/.test(text)) return 'flow';
  if (/question|define|choose|pick|constrain|calibrat|checklist|design|target construct|time scale/.test(text)) return 'checklist';
  if (/gate|intent|confidence|context evidence|evidence|wake|threshold|escalate|permission/.test(text)) return 'system-map';
  if (/review|inspect|detect|search|evidence|signal|feature|label|dataset/.test(text)) return 'evidence-map';
  if ((page.cards || []).length === 1) return 'spotlight';
  return 'compact-grid';
}

function matchCase(replacement, sample) {
  if (sample === sample.toUpperCase()) return replacement.toUpperCase();
  if (sample[0] === sample[0].toUpperCase()) return replacement.replace(/\b[a-z]/g, (char) => char.toUpperCase());
  return replacement;
}

const EXACT_VISIBLE_LABELS = [
  [/^practical design takeaways?$/i, 'Design Rules'],
  [/^key takeaways?$/i, 'Key Ideas'],
  [/^takeaways?$/i, 'Key Ideas'],
  [/^tldr$|^tl;dr$/i, 'Short Version'],
  [/^references?$/i, 'Evidence'],
  [/^bibliography$|^sources?$/i, 'Evidence'],
  [/^further reading$/i, 'More Evidence'],
  [/^appendix$/i, 'Details'],
  [/^table of contents$|^contents$/i, 'Map'],
  [/^summary$/i, 'What It Means'],
  [/^conclusion$|^final thoughts$/i, 'What It Means'],
  [/^overview$/i, 'Map'],
  [/^abstract$/i, 'Core Idea'],
  [/^introduction$|^intro$/i, 'Context'],
  [/^background$/i, 'Context'],
  [/^related work$/i, 'Prior Work'],
  [/^discussion$/i, 'Implications'],
  [/^limitations?$/i, 'Boundaries'],
  [/^future work$/i, 'Next Questions'],
  [/^implementation notes?$/i, 'Implementation'],
  [/^concepts?$/i, 'Concept Map'],
  [/^figure\s*\d*$/i, 'Diagram'],
  [/^table\s*\d*$/i, 'Comparison'],
  [/^section\s*\d*$/i, 'Part'],
  [/^chapter\s*\d*$/i, 'Part']
];

function sanitizeVisibleText(value) {
  if (typeof value !== 'string') return value;
  let text = value
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\bTL;DR\b|\bTLDR\b/gi, (match) => matchCase('short version', match))
    .replace(/\bpractical design takeaways\b/gi, (match) => matchCase('design rules', match))
    .replace(/\bkey takeaways\b/gi, (match) => matchCase('key ideas', match))
    .replace(/\btakeaways\b/gi, (match) => matchCase('key ideas', match))
    .replace(/\btakeaway\b/gi, (match) => matchCase('key idea', match))
    .replace(/\bthis\s+(?:blog\s+)?(?:post|article|essay)\b/gi, (match) => matchCase('the work', match))
    .replace(/\bthe\s+(?:blog\s+)?(?:post|article|essay)\b/gi, (match) => matchCase('the work', match))
    .replace(/\bblog post\b/gi, (match) => matchCase('article', match))
    .replace(/\breferences?\s+section\b/gi, (match) => matchCase('evidence', match))
    .replace(/\bbibliography\b|\bsources\s+section\b|\bsource\s+list\b|\blist\s+of\s+sources\b/gi, (match) => matchCase('evidence', match))
    .replace(/\bfurther reading\b/gi, (match) => matchCase('more evidence', match))
    .replace(/\bappendix\b/gi, (match) => matchCase('details', match))
    .replace(/\btable of contents\b/gi, (match) => matchCase('map', match))
    .replace(/\b(?:the\s+)?abstract\s+section\b|\bthe\s+abstract\b/gi, (match) => matchCase('core idea', match))
    .replace(/\b(?:the\s+)?introduction\s+section\b|\bthe\s+introduction\b/gi, (match) => matchCase('context', match))
    .replace(/\b(?:the\s+)?related\s+work\s+section\b|\bthe\s+related\s+work\b/gi, (match) => matchCase('prior work', match))
    .replace(/\b(?:the\s+)?discussion\s+section\b|\bthe\s+discussion\b/gi, (match) => matchCase('implications', match))
    .replace(/\b(?:the\s+)?limitations?\s+section\b|\bthe\s+limitations?\b/gi, (match) => matchCase('boundaries', match))
    .replace(/\b(?:the\s+)?future\s+work\s+section\b|\bfuture\s+work\b/gi, (match) => matchCase('next questions', match))
    .replace(/\bfigure\s+\d+\b/gi, (match) => matchCase('diagram', match))
    .replace(/\btable\s+\d+\b/gi, (match) => matchCase('comparison', match))
    .replace(/\bsection\s+\d+\b/gi, (match) => matchCase('part', match))
    .replace(/\bchapter\s+\d+\b/gi, (match) => matchCase('part', match))
    .replace(/\bfront\s*matter\b|\bseo metadata\b|\bmetadata\b/gi, (match) => matchCase('publishing details', match))
    .replace(/\bfinal thoughts\b/gi, (match) => matchCase('what it means', match))
    .replace(/\bconclusion\b/gi, (match) => matchCase('what it means', match))
    .replace(/\boverview\b/gi, (match) => matchCase('map', match));
  text = text.replace(/\s+/g, ' ').trim();
  for (const [pattern, replacement] of EXACT_VISIBLE_LABELS) {
    if (pattern.test(text)) return replacement;
  }
  return text;
}

function sanitizeStoryboardText(storyboard) {
  storyboard.title = sanitizeVisibleText(storyboard.title);
  storyboard.pages.forEach((page) => {
    page.fileSlug = page.fileSlug || slug(page.section);
    page.title = sanitizeVisibleText(page.title);
    page.section = sanitizeVisibleText(page.section);
    page.kicker = sanitizeVisibleText(page.kicker);
    page.headline = sanitizeVisibleText(page.headline);
    (page.cards || []).forEach((card) => {
      card.title = sanitizeVisibleText(card.title);
      card.body = sanitizeVisibleText(card.body);
    });
  });
  return storyboard;
}

function compositionLabelFor(composition) {
  return ({
    flow: 'Process',
    comparison: 'Options',
    checklist: 'Design Rules',
    'system-map': 'Gate Logic',
    'failure-map': 'Failure Point',
    'evidence-map': 'Evidence',
    'compact-grid': 'Key Ideas',
    spotlight: 'Focus'
  })[composition] || 'Visual Map';
}

function validateStoryboard(sb) {
  if (!sb || !Array.isArray(sb.pages) || !sb.pages.length) throw new Error('storyboard.pages must be a non-empty array');
  sb.pages.forEach((p, i) => {
    if (!p.title || !p.section) throw new Error(`page ${i + 1}: title and section are required`);
    if (!Array.isArray(p.cards) || p.cards.length < 1 || p.cards.length > 4) throw new Error(`page ${i + 1}: cards must contain 1–4 items`);
    if (p.layout && !LAYOUTS.includes(p.layout)) throw new Error(`page ${i + 1}: unsupported layout "${p.layout}"`);
    if (p.composition && !COMPOSITIONS.includes(p.composition)) throw new Error(`page ${i + 1}: unsupported composition "${p.composition}"`);
    if (p.introStyle && !INTRO_STYLES.includes(p.introStyle)) throw new Error(`page ${i + 1}: unsupported introStyle "${p.introStyle}"`);
    if (p.titleTreatment && !TITLE_TREATMENTS.includes(p.titleTreatment)) throw new Error(`page ${i + 1}: unsupported titleTreatment "${p.titleTreatment}"`);
  });
}

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function wrap(ctx, text, width, maxLines) {
  const value = String(text);
  const latin = /\s/.test(value) && !/[\u3400-\u9fff]/.test(value);
  const tokens = latin ? value.trim().split(/\s+/).map((v,i)=>i ? ' '+v : v) : Array.from(value);
  const lines = []; let line = ''; let consumed = 0;
  for (const token of tokens) {
    if (ctx.measureText(line + token).width > width && line) {
      lines.push(line.trim()); line = token.trimStart();
    } else line += token;
    consumed++;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  if (consumed < tokens.length && lines.length) lines[lines.length - 1] = lines[lines.length - 1].replace(/[\s.,;:!?。！？、]*$/, '') + '…';
  return lines;
}

function textBlockHeight(lines, lineHeight) {
  return Math.max(0, lines.length ? (lines.length - 1) * lineHeight + lineHeight : 0);
}

function drawTextLines(ctx, lines, x, y, lineHeight) {
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
}

function icon(ctx, name, x, y, color, phase = 0) {
  return sharedIcons.drawCanvasIcon(ctx, name, x, y, color, phase);
}


function pageDesign(page, pageIndex) {
  const seed = hashText(`${page.title}|${page.section}|${page.pageLabel}|${page.cards?.length || 0}`);
  let composition = page.composition || inferComposition(page);
  const count = page.cards.length;
  const layoutFamilies = {
    flow: ['flow-board', 'timeline', 'staircase', 'bands'],
    comparison: ['compare', 'split-focus', 'lanes', 'matrix'],
    checklist: ['checklist', 'stacked', 'bands', 'staircase'],
    'system-map': ['system-board', 'orbit', 'dashboard', 'bento'],
    'failure-map': ['failure-focus', 'spotlight', 'split-focus'],
    'evidence-map': ['matrix', 'dashboard', 'mosaic', 'triptych'],
    'compact-grid': ['bento', 'mosaic', 'grid', 'triptych', 'dashboard'],
    spotlight: ['spotlight']
  };
  let layout = page.layout || pickFrom(layoutFamilies[composition] || LAYOUTS, seed + pageIndex * 17);
  let introStyle = page.introStyle || pickFrom(INTRO_STYLES, (seed >> 3) + pageIndex * 11);
  let titleTreatment = page.titleTreatment || pickFrom(TITLE_TREATMENTS, (seed >> 6) + pageIndex * 7);
  if (count === 1) { layout = 'spotlight'; composition = 'spotlight'; }
  if (count === 2 && ['grid', 'matrix', 'triptych'].includes(layout)) layout = 'compare';
  if (count === 4 && layout === 'row') layout = 'dashboard';
  if (composition === 'comparison' && count < 2) composition = 'spotlight';
  if (composition === 'flow' && count < 2) composition = 'spotlight';
  if (composition === 'flow' && introStyle === 'quiet') introStyle = 'ribbon';
  if (titleTreatment === 'side-note') titleTreatment = 'underline';
  const surface = layout === 'lanes'
    ? 'lanes'
    : layout === 'checklist'
      ? 'open'
      : pickFrom(SURFACES, (seed >> 9) + pageIndex * 5);
  return { seed, layout, composition, introStyle, titleTreatment, surface };
}

function drawPaper(ctx) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(80,83,101,.026)';
  ctx.lineWidth = 1;
  for (let y = 40; y < H; y += 52) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let x = 46; x < W; x += 52) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
}

function drawTitleBlock(ctx, page, design) {
  const accent = ACCENTS[design.seed % ACCENTS.length];
  const treatment = design.titleTreatment;
  ctx.fillStyle = INK;
  ctx.font = `800 40px ${FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const titleLines = wrap(ctx, page.title, 820, 2);
  titleLines.forEach((line, i) => ctx.fillText(line, 64, 42 + i * 43));
  const titleBottom = 42 + titleLines.length * 43;

  if (treatment === 'underline') {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(64, titleBottom + 13);
    ctx.lineTo(Math.min(64 + 240 + titleLines[0].length * 6.4, 760), titleBottom + 13);
    ctx.stroke();
  } else if (treatment === 'corner-tag') {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(BOARD_RIGHT - 66, 44);
    ctx.lineTo(BOARD_RIGHT, 44);
    ctx.lineTo(BOARD_RIGHT, 110);
    ctx.stroke();
  } else if (treatment === 'side-note') {
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .72;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(48, 44);
    ctx.lineTo(48, titleBottom + 20);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(80,83,101,.10)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(64, titleBottom + 26);
  ctx.lineTo(936, titleBottom + 26);
  ctx.stroke();
  return titleBottom + 34;
}

function drawBoardSurface(ctx, top, seed, options = {}) {
  const y = Math.max(top - 12, 212);
  const minHeight = options.minHeight ?? 220;
  const h = Math.max(options.height || (BOARD_BOTTOM - y), minHeight);
  ctx.save();
  roundRect(ctx, BOARD_LEFT - 12, y, BOARD_RIGHT - BOARD_LEFT + 24, h, 28);
  ctx.fillStyle = options.fill || 'rgba(255,255,255,.44)';
  ctx.fill();
  ctx.strokeStyle = options.stroke || 'rgba(80,83,101,.12)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  const accent = ACCENTS[seed % ACCENTS.length];
  ctx.globalAlpha = .16;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(BOARD_LEFT + 10, y + 24);
  ctx.lineTo(BOARD_RIGHT - 10, y + 24);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawKickerPanel(ctx, x, y, w, h, accent, fill, text, iconName, t, mode = 'guide') {
  ctx.save();
  if (mode === 'quiet') {
    ctx.fillStyle = MUTED;
    ctx.font = `600 19px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    wrap(ctx, text, w, 2).forEach((line, i) => ctx.fillText(line, x, y + i * 25));
    ctx.restore();
    return;
  }

  roundRect(ctx, x, y, w, h, mode === 'ribbon' ? 12 : 22);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = mode === 'ribbon' ? 1.8 : 2.2;
  ctx.stroke();
  if (mode === 'text-only') {
    ctx.fillStyle = INK;
    ctx.font = `700 23px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    wrap(ctx, text, w - 48, 2).forEach((line, i, lines) => {
      const start = y + h / 2 - (lines.length - 1) * 13;
      ctx.fillText(line, x + 24, start + i * 27);
    });
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#fff';
  const tile = mode === 'badge' ? 50 : 58;
  roundRect(ctx, x + 18, y + (h - tile) / 2, tile, tile, 16);
  ctx.fill();
  ctx.stroke();
  icon(ctx, iconName, x + 18 + tile / 2, y + h / 2, accent, t);
  ctx.fillStyle = INK;
  ctx.font = `700 ${mode === 'ribbon' ? 22 : 23}px ${FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  wrap(ctx, text, w - tile - 58, 2).forEach((line, i, lines) => {
    const start = y + h / 2 - (lines.length - 1) * 13;
    ctx.fillText(line, x + tile + 42, start + i * 27);
  });
  ctx.restore();
}

function drawIntro(ctx, page, design, startY, t) {
  const accent = ACCENTS[(design.seed >> 4) % ACCENTS.length];
  const fill = PALETTE[(design.seed >> 8) % PALETTE.length];
  const kicker = page.kicker || page.headline || page.section || 'A compact visual note';
  const firstCard = page.cards[0] || {};
  const iconName = resolveIconName(firstCard.icon, `${firstCard.title || ''} ${firstCard.body || ''}`, 0);
  const y = startY + 8;
  ctx.save();
  if (design.introStyle === 'quiet') {
    drawKickerPanel(ctx, BOARD_LEFT + 2, y + 4, 792, 52, accent, fill, kicker, iconName, t, 'quiet');
    ctx.restore();
    return y + 58;
  }

  if (design.introStyle === 'split') {
    roundRect(ctx, BOARD_LEFT, y, 164, 72, 21);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.1;
    ctx.stroke();
    icon(ctx, iconName, BOARD_LEFT + 82, y + 36, accent, t);
    drawKickerPanel(ctx, BOARD_LEFT + 184, y, BOARD_RIGHT - BOARD_LEFT - 184, 72, accent, '#fff', kicker, iconName, t, 'text-only');
    ctx.restore();
    return y + 82;
  }

  if (design.introStyle === 'badge') {
    const badgeW = 68;
    roundRect(ctx, BOARD_LEFT, y + 8, badgeW, 56, 18);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.1;
    ctx.stroke();
    icon(ctx, iconName, BOARD_LEFT + badgeW / 2, y + 36, accent, t);
    drawKickerPanel(ctx, BOARD_LEFT + badgeW + 16, y, BOARD_RIGHT - BOARD_LEFT - badgeW - 16, 72, accent, '#fff', kicker, iconName, t, 'text-only');
    ctx.restore();
    return y + 86;
  }

  if (design.introStyle === 'ribbon') {
    drawKickerPanel(ctx, BOARD_LEFT, y, BOARD_RIGHT - BOARD_LEFT, 74, accent, fill, kicker, iconName, t, 'ribbon');
    ctx.restore();
    return y + 88;
  }

  drawKickerPanel(ctx, BOARD_LEFT, y, BOARD_RIGHT - BOARD_LEFT, 82, accent, fill, kicker, iconName, t, 'guide');
  ctx.restore();
  return y + 96;
}

function drawCard(ctx, card, x, y, w, h, index, t, options = {}) {
  const accent = ACCENTS[index % ACCENTS.length];
  const palette = PALETTE[index % PALETTE.length];
  const iconName = resolveIconName(card.icon, `${card.title || ''} ${card.body || ''}`, index);
  const pulse = 1 + (options.pulse ?? 0.014) * Math.sin(t * Math.PI * 2 + index * .8);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.shadowColor = 'rgba(39,42,63,.08)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  roundRect(ctx, x, y, w, h, 20);
  ctx.fillStyle = palette;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.4;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = `800 12px ${FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.globalAlpha = .64;
  if (options.number === true) ctx.fillText(String(index + 1), x + 24, y + 20);
  ctx.globalAlpha = 1;

  if (options.sideIcon) {
    ctx.fillStyle = '#fff';
    roundRect(ctx, x + 34, y + h / 2 - 34, 68, 68, 18);
    ctx.fill();
    ctx.stroke();
    icon(ctx, iconName, x + 68, y + h / 2, accent, t + index * .08);
    ctx.fillStyle = INK;
    ctx.font = `700 22px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const textX = x + 128, textW = w - 158;
    const titleLines = wrap(ctx, card.title, textW, 2);
    titleLines.forEach((line, j) => ctx.fillText(line, textX, y + 34 + j * 27));
    ctx.fillStyle = MUTED;
    ctx.font = `500 16px ${FONT_STACK}`;
    const bodyY = y + 92 + Math.max(0, titleLines.length - 1) * 19;
    wrap(ctx, card.body, textW, Math.max(2, Math.floor((y + h - bodyY - 22) / 23))).forEach((line, j) => ctx.fillText(line, textX, bodyY + j * 23));
    ctx.restore();
    return;
  }

  const compact = h < 245 || w < 260;
  const tile = compact ? 50 : 60;
  const iconX = x + 28;
  const iconY = y + 48;
  ctx.fillStyle = '#fff';
  roundRect(ctx, iconX, iconY, tile, tile, 15);
  ctx.fill();
  ctx.stroke();
  icon(ctx, iconName, iconX + tile / 2, iconY + tile / 2, accent, t + index * .08);

  ctx.fillStyle = INK;
  ctx.font = `700 ${compact ? 19 : 22}px ${FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const titleX = compact ? x + 28 : x + 104;
  const titleY = compact ? y + 112 : y + 48;
  const titleW = compact ? w - 56 : w - 132;
  const titleLines = wrap(ctx, card.title, titleW, compact ? 2 : 3);
  titleLines.forEach((line, j) => ctx.fillText(line, titleX, titleY + j * (compact ? 24 : 27)));
  ctx.fillStyle = MUTED;
  ctx.font = `500 ${compact ? 15 : 16}px ${FONT_STACK}`;
  const bodyY = Math.max(titleY + titleLines.length * (compact ? 25 : 28) + (compact ? 12 : 18), iconY + tile + (compact ? 14 : 18));
  const bodyLines = Math.max(2, Math.floor((y + h - bodyY - 24) / (compact ? 20 : 23)));
  wrap(ctx, card.body, w - 56, bodyLines).forEach((line, j) => ctx.fillText(line, x + 28, bodyY + j * (compact ? 20 : 23)));
  ctx.restore();
}

function drawMiniCard(ctx, card, x, y, w, h, index, t, options = {}) {
  const accent = options.accent || ACCENTS[index % ACCENTS.length];
  const palette = options.fill || PALETTE[index % PALETTE.length];
  const iconName = resolveIconName(card.icon, `${card.title || ''} ${card.body || ''}`, index);
  const pulse = 1 + (options.pulse ?? 0.012) * Math.sin(t * Math.PI * 2 + index * .75);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  ctx.shadowColor = 'rgba(39,42,63,.07)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, x, y, w, h, options.radius || 18);
  ctx.fillStyle = palette;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  const tile = options.small ? 46 : 56;
  const tileX = x + 18;
  const tileY = options.sideIcon ? y + h / 2 - tile / 2 : y + 18;
  ctx.fillStyle = '#fff';
  roundRect(ctx, tileX, tileY, tile, tile, 15);
  ctx.fill();
  ctx.stroke();
  icon(ctx, iconName, tileX + tile / 2, tileY + tile / 2, accent, t + index * .11);

  if (options.number === true) {
    ctx.fillStyle = accent;
    ctx.font = `800 12px ${FONT_STACK}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.globalAlpha = .82;
    ctx.fillText(String(index + 1).padStart(2, '0'), x + w - 18, y + 18);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = INK;
  ctx.font = `700 ${options.small ? 18 : 20}px ${FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const textX = x + (options.sideIcon ? tile + 38 : 18);
  const textW = w - (options.sideIcon ? tile + 58 : 36);
  const titleLines = wrap(ctx, card.title, textW, options.small ? 2 : 2);
  const lineH = options.small ? 19 : 21;
  let bodyLines = [];
  let textY = options.sideIcon ? y + 22 : y + tile + 34;
  if (options.sideIcon) {
    const titleH = titleLines.length * (options.small ? 22 : 24);
    const maxBodyLines = Math.max(1, Math.floor((h - titleH - 42) / lineH));
    bodyLines = wrap(ctx, card.body, textW, maxBodyLines);
    const blockH = titleH + 10 + bodyLines.length * lineH;
    textY = y + Math.max(18, (h - blockH) / 2);
  }
  titleLines.forEach((line, j) => ctx.fillText(line, textX, textY + j * (options.small ? 22 : 24)));
  ctx.fillStyle = MUTED;
  ctx.font = `500 ${options.small ? 14 : 15}px ${FONT_STACK}`;
  const bodyY = textY + titleLines.length * (options.small ? 22 : 24) + 10;
  if (!options.sideIcon) {
    const maxLines = Math.max(1, Math.floor((y + h - bodyY - 16) / lineH));
    bodyLines = wrap(ctx, card.body, textW, maxLines);
  }
  bodyLines.forEach((line, j) => ctx.fillText(line, textX, bodyY + j * lineH));
  ctx.restore();
}

function drawSoftRail(ctx, points, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = .24;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.stroke();
  ctx.globalAlpha = 1;
  points.forEach(([x, y]) => {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.restore();
}

function drawFlowComposition(ctx, cards, top, t, design) {
  const count = cards.length;
  const accent = ACCENTS[(design.seed >> 5) % ACCENTS.length];
  const y0 = top + 22;
  const gap = 14;

  if (count === 2) {
    const cardW = 404;
    const cardH = Math.min(318, Math.max(248, BOARD_BOTTOM - y0 - 44));
    const xs = [86, 510];
    drawBoardSurface(ctx, top, design.seed + 101, {
      fill: 'rgba(255,255,255,.30)',
      stroke: 'rgba(80,83,101,.08)',
      height: y0 - (Math.max(top - 12, 212)) + cardH + 68
    });
    drawSoftRail(ctx, xs.map((x) => [x + cardW / 2, y0 + 18]), accent);
    cards.forEach((card, i) => drawMiniCard(ctx, card, xs[i], y0 + 38, cardW, cardH, i, t, { pulse: 0.011 }));
    return;
  }

  if (count >= 4) {
    const tileW = 420;
    const tileH = Math.min(196, Math.max(168, (BOARD_BOTTOM - y0 - gap - 78) / 2));
    drawBoardSurface(ctx, top, design.seed + 101, {
      fill: 'rgba(255,255,255,.30)',
      stroke: 'rgba(80,83,101,.08)',
      height: y0 - (Math.max(top - 12, 212)) + tileH * 2 + gap + 44
    });
    const positions = [
      [76, y0],
      [504, y0],
      [76, y0 + tileH + gap],
      [504, y0 + tileH + gap]
    ];
    cards.forEach((card, i) => {
      drawMiniCard(ctx, card, positions[i][0], positions[i][1], tileW, tileH, i, t, {
        sideIcon: true,
        small: true,
        pulse: 0.01
      });
    });
    return;
  }

  const rowH = Math.min(152, Math.max(132, (BOARD_BOTTOM - y0 - gap * (count - 1) - 116) / count));
  const railX = 96;
  const contentH = count * rowH + (count - 1) * gap;
  drawBoardSurface(ctx, top, design.seed + 101, {
    fill: 'rgba(255,255,255,.30)',
    stroke: 'rgba(80,83,101,.08)',
    height: y0 - (Math.max(top - 12, 212)) + contentH + 42
  });
  ctx.save();
  ctx.strokeStyle = 'rgba(80,83,101,.10)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(railX, y0 + 22);
  ctx.lineTo(railX, y0 + count * rowH + (count - 1) * gap - 22);
  ctx.stroke();
  ctx.restore();

  cards.forEach((card, i) => {
    const y = y0 + i * (rowH + gap);
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(railX, y + rowH / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ACCENTS[i % ACCENTS.length];
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    drawMiniCard(ctx, card, 124, y, 786, rowH, i, t, {
      sideIcon: true,
      number: false,
      small: rowH < 164,
      pulse: 0.01
    });
  });
}

function drawComparisonComposition(ctx, cards, top, t, design) {
  const y = top + 26;
  const gap = 16;
  const hasSummary = Boolean(cards[2]);
  const summaryH = hasSummary ? 130 : 0;
  const pairH = Math.min(hasSummary ? 276 : 330, Math.max(238, BOARD_BOTTOM - y - (hasSummary ? summaryH + gap + 74 : 78)));
  drawBoardSurface(ctx, top, design.seed + 131, {
    fill: 'rgba(255,255,255,.32)',
    stroke: 'rgba(80,83,101,.08)',
    height: y - (Math.max(top - 12, 212)) + pairH + (hasSummary ? gap + summaryH : 0) + 42
  });
  const accent = ACCENTS[(design.seed >> 2) % ACCENTS.length];
  ctx.save();
  ctx.strokeStyle = 'rgba(80,83,101,.14)';
  ctx.setLineDash([6, 10]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(500, y + 18);
  ctx.lineTo(500, y + pairH - 18);
  ctx.stroke();
  ctx.setLineDash([]);
  [-12, 12].forEach((dy) => {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(500, y + pairH / 2 + dy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  });
  ctx.restore();

  drawMiniCard(ctx, cards[0], BOARD_LEFT, y, 402, pairH, 0, t);
  drawMiniCard(ctx, cards[1], 534, y, 402, pairH, 1, t);
  if (cards[2]) {
    drawMiniCard(ctx, cards[2], 128, y + pairH + gap, 744, summaryH, 2, t, {
      sideIcon: true,
      fill: '#fff6df',
      accent: ACCENTS[3],
      pulse: 0.01
    });
  }
}

function drawChecklistComposition(ctx, cards, top, t, design) {
  const gap = 14;
  const y0 = top + 22;
  const rowH = Math.min(128, Math.max(112, (BOARD_BOTTOM - y0 - gap * (cards.length - 1) - 122) / cards.length));
  const contentH = cards.length * rowH + (cards.length - 1) * gap;
  drawBoardSurface(ctx, top, design.seed + 151, {
    fill: 'rgba(255,255,255,.26)',
    stroke: 'rgba(80,83,101,.08)',
    height: y0 - (Math.max(top - 12, 212)) + contentH + 42
  });
  const accent = ACCENTS[(design.seed >> 7) % ACCENTS.length];
  ctx.save();
  ctx.strokeStyle = 'rgba(80,83,101,.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(103, y0 + 18);
  ctx.lineTo(103, y0 + cards.length * rowH + (cards.length - 1) * gap - 18);
  ctx.stroke();
  ctx.restore();
  cards.forEach((card, i) => {
    const y = y0 + i * (rowH + gap);
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(103, y + rowH / 2, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ACCENTS[i % ACCENTS.length];
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(94, y + rowH / 2);
    ctx.lineTo(101, y + rowH / 2 + 8);
    ctx.lineTo(114, y + rowH / 2 - 10);
    ctx.stroke();
    ctx.restore();
    drawMiniCard(ctx, card, 142, y, 766, rowH, i, t, { sideIcon: true, number: false, small: true, pulse: 0.01, accent });
  });
}

function drawSystemMapComposition(ctx, cards, top, t, design) {
  const y = top + 22;
  const accent = ACCENTS[(design.seed >> 4) % ACCENTS.length];
  const hubIcon = resolveIconName(cards[cards.length - 1]?.icon || cards[0]?.icon, pageText({ cards }), 0);
  const hubX = 392, hubY = y + 66, hubW = 216, hubH = 126;
  const targets = [
    [76, y + 34, 280, 196],
    [644, y + 34, 280, 196],
    [190, y + 252, 620, 134]
  ];
  const contentBottom = cards.length > 2 ? targets[2][1] + targets[2][3] : y + 248;
  drawBoardSurface(ctx, top, design.seed + 171, {
    fill: 'rgba(255,255,255,.25)',
    stroke: 'rgba(80,83,101,.08)',
    height: contentBottom - (Math.max(top - 12, 212)) + 42
  });
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.globalAlpha = .21;
  ctx.lineWidth = 2.6;
  ctx.setLineDash([7, 9]);
  targets.slice(0, cards.length).forEach(([x, yy, w, h]) => {
    ctx.beginPath();
    ctx.moveTo(hubX + hubW / 2, hubY + hubH / 2);
    ctx.lineTo(x + w / 2, yy + h / 2);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  roundRect(ctx, hubX, hubY, hubW, hubH, 34);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  icon(ctx, hubIcon, hubX + hubW / 2, hubY + 48, accent, t);
  [-20, 0, 20].forEach((dx, i) => {
    ctx.fillStyle = ACCENTS[i % ACCENTS.length];
    ctx.globalAlpha = .38 + .62 * (.5 + .5 * Math.sin(t * Math.PI * 2 + i));
    ctx.beginPath();
    ctx.arc(hubX + hubW / 2 + dx, hubY + 94, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
  cards.forEach((card, i) => {
    const [x, yy, w, h] = targets[i] || [BOARD_LEFT, y + 34 + i * 156, 872, 136];
    drawMiniCard(ctx, card, x, yy, w, h, i, t, { sideIcon: w > 360, small: true, pulse: 0.012 });
  });
}

function drawFailureMapComposition(ctx, cards, top, t, design) {
  const y = top + 22;
  const warn = cards.findIndex((card) => /fail|missing|not|did not|alert|problem|pronunciation|risk|gap/i.test(`${card.title} ${card.body}`));
  const problemIndex = warn >= 0 ? warn : Math.min(1, cards.length - 1);
  const problem = cards[problemIndex];
  const support = cards.filter((_, i) => i !== problemIndex);
  const problemH = 218;
  const supportY = y + problemH + 18;
  const supportH = 132;
  const contentBottom = support[2] ? supportY + supportH * 2 + 18 : supportY + supportH;
  drawBoardSurface(ctx, top, design.seed + 191, {
    fill: 'rgba(255,255,255,.28)',
    stroke: 'rgba(80,83,101,.08)',
    height: contentBottom - (Math.max(top - 12, 212)) + 42
  });
  ctx.save();
  ctx.fillStyle = 'rgba(223,47,53,.07)';
  roundRect(ctx, 330, y, 340, problemH, 34);
  ctx.fill();
  ctx.strokeStyle = '#df2f35';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.restore();
  drawMiniCard(ctx, problem, 356, y + 34, 288, problemH - 58, problemIndex, t, { fill: '#fbf0f7', accent: '#df2f35', number: false, small: true });
  support.slice(0, 2).forEach((card, i) => {
    const x = i === 0 ? 78 : 540;
    drawMiniCard(ctx, card, x, supportY, 382, supportH, i, t, { sideIcon: true, small: true, pulse: 0.01 });
  });
  if (support[2]) drawMiniCard(ctx, support[2], 314, supportY + supportH + 18, 372, supportH, 3, t, { sideIcon: true, small: true, pulse: 0.01 });
}

function drawCompactGridComposition(ctx, cards, top, t, design) {
  if (cards.length === 3) {
    const y = top + 22;
    const topH = 210;
    const gap = 16;
    const bottomH = 132;
    drawBoardSurface(ctx, top, design.seed + 211, {
      fill: 'rgba(255,255,255,.25)',
      stroke: 'rgba(80,83,101,.08)',
      height: y - (Math.max(top - 12, 212)) + topH + gap + bottomH + 42
    });
    drawMiniCard(ctx, cards[0], 72, y, 340, topH, 0, t);
    drawMiniCard(ctx, cards[1], 438, y, 490, topH, 1, t, { sideIcon: true });
    drawMiniCard(ctx, cards[2], 168, y + topH + gap, 664, bottomH, 2, t, { sideIcon: true, small: true, pulse: 0.01 });
    return;
  }
  drawGridLayout(ctx, cards, top, t);
}

function drawRowLayout(ctx, cards, top, t) {
  drawBoardSurface(ctx, top, 11);
  const count = cards.length;
  if (count === 1) {
    drawCard(ctx, cards[0], 138, top + 18, 724, Math.min(584, BOARD_BOTTOM - top - 30), 0, t);
    return;
  }
  if (count === 4) return drawGridLayout(ctx, cards, top, t);
  const gap = 22, cardW = count === 2 ? 410 : (872 - gap * (count - 1)) / count;
  const x0 = count === 2 ? 75 : 64;
  const h = Math.min(count === 2 ? 530 : 548, BOARD_BOTTOM - top - 34);
  cards.forEach((card, i) => drawCard(ctx, card, x0 + i * (cardW + gap), top + 18, cardW, h, i, t));
}

function drawGridLayout(ctx, cards, top, t) {
  drawBoardSurface(ctx, top, 23);
  if (cards.length === 3) {
    const gap = 20;
    const y = top + 18;
    const available = BOARD_BOTTOM - y;
    const topH = Math.min(285, Math.max(240, (available - gap) * .5));
    const bottomH = Math.min(300, available - topH - gap);
    drawCard(ctx, cards[0], BOARD_LEFT, y, 424, topH, 0, t);
    drawCard(ctx, cards[1], 512, y, 424, topH, 1, t);
    drawCard(ctx, cards[2], 86, y + topH + gap, 828, bottomH, 2, t, { sideIcon: true, pulse: 0.012 });
    return;
  }
  const cols = cards.length === 2 ? 2 : 2;
  const rows = Math.ceil(cards.length / cols);
  const gap = 20, cardW = (872 - gap) / 2;
  const y = top + 18;
  const available = BOARD_BOTTOM - y;
  const cardH = Math.max(224, Math.min(306, (available - gap * (rows - 1)) / rows));
  cards.forEach((card, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    drawCard(ctx, card, BOARD_LEFT + col * (cardW + gap), y + row * (cardH + gap), cardW, cardH, i, t);
  });
}

function drawStackedLayout(ctx, cards, top, t) {
  drawBoardSurface(ctx, top, 37);
  const gap = 16;
  const y0 = top + 18;
  const cardH = Math.min(204, (BOARD_BOTTOM - y0 - gap * (cards.length - 1)) / cards.length);
  ctx.save();
  ctx.strokeStyle = 'rgba(80,83,101,.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(68, y0 + 12);
  ctx.lineTo(68, y0 + cards.length * cardH + (cards.length - 1) * gap - 12);
  ctx.stroke();
  ctx.restore();
  cards.forEach((card, i) => {
    const y = y0 + i * (cardH + gap);
    ctx.save();
    ctx.fillStyle = ACCENTS[i % ACCENTS.length];
    ctx.beginPath();
    ctx.arc(68, y + cardH / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawCard(ctx, card, 94 + (i % 2) * 22, y, 808 - (i % 2) * 22, cardH, i, t, { sideIcon: true, pulse: 0.012 });
  });
}

function drawTimelineLayout(ctx, cards, top, t) {
  if (cards.length === 1) return drawRowLayout(ctx, cards, top, t);
  drawBoardSurface(ctx, top, 51, { fill: 'rgba(255,255,255,.38)' });
  const compact = cards.length === 4;
  if (cards.length === 3) {
    const gap = 18;
    const y0 = top + 22;
    const w = 274;
    const h = Math.min(430, Math.max(380, BOARD_BOTTOM - y0 - 120));
    const xs = [82, 363, 644];
    const yTop = y0;
    const yLow = Math.min(BOARD_BOTTOM - h - 18, y0 + 168);
    const ys = [yTop, yLow, yTop];
    ctx.save();
    ctx.strokeStyle = 'rgba(80,83,101,.11)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xs[0] + w + gap, yLow + h / 2);
    ctx.lineTo(xs[2] - gap, yLow + h / 2);
    ctx.stroke();
    ctx.fillStyle = ACCENTS[1];
    ctx.beginPath();
    ctx.arc(W / 2, yLow + h / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    cards.forEach((card, i) => drawCard(ctx, card, xs[i], ys[i], w, h, i, t, { pulse: 0.014 }));
    return;
  }
  const w = compact ? 392 : 286;
  const h = compact ? Math.min(270, Math.max(232, (BOARD_BOTTOM - top - 62) / 2 - 18)) : Math.min(420, Math.max(360, BOARD_BOTTOM - top - 142));
  const y1 = top + (compact ? 22 : 28);
  const y2 = top + (compact ? h + 36 : Math.min(330, BOARD_BOTTOM - top - h - 22));
  const xs = compact ? [82, 526, 82, 526] : [72, 357, 642];
  const ys = compact ? [y1, y1, y2, y2] : [y1, y2, y1];
  const railY = top + (compact ? h + 30 : 280);
  ctx.save();
  ctx.strokeStyle = 'rgba(80,83,101,.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(xs[0] + w / 2, railY);
  ctx.lineTo(xs[cards.length - 1] + w / 2, railY);
  ctx.stroke();
  xs.slice(0, cards.length).forEach((x, i) => {
    ctx.fillStyle = ACCENTS[i % ACCENTS.length];
    ctx.beginPath();
    ctx.arc(x + w / 2, railY, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
  cards.forEach((card, i) => drawCard(ctx, card, xs[i], ys[i], w, h, i, t, { pulse: 0.016 }));
}

function drawSpotlightLayout(ctx, cards, top, t) {
  if (cards.length === 1) return drawRowLayout(ctx, cards, top, t);
  drawBoardSurface(ctx, top, 67);
  const primaryH = Math.min(560, BOARD_BOTTOM - top - 24);
  drawCard(ctx, cards[0], BOARD_LEFT, top + 18, cards.length === 2 ? 410 : 420, primaryH - 8, 0, t);
  const rightX = cards.length === 2 ? 526 : 520;
  const rightW = cards.length === 2 ? 410 : 416;
  const supportCount = cards.length - 1;
  const gap = 16;
  const supportH = (primaryH - 8 - gap * (supportCount - 1)) / supportCount;
  cards.slice(1).forEach((card, offset) => {
    const y = top + 18 + offset * (supportH + gap);
    drawCard(ctx, card, rightX, y, rightW, supportH, offset + 1, t, { sideIcon: supportH < 210, pulse: 0.014 });
  });
}

function drawMosaicLayout(ctx, cards, top, t) {
  if (cards.length < 3) return drawSpotlightLayout(ctx, cards, top, t);
  drawBoardSurface(ctx, top, 79);
  const y = top + 18;
  const gap = 16;
  const height = Math.min(548, BOARD_BOTTOM - y);
  const primaryW = cards.length === 3 ? 510 : 430;
  drawCard(ctx, cards[0], BOARD_LEFT, y, primaryW, height, 0, t, { pulse: 0.016 });
  const supportX = BOARD_LEFT + primaryW + gap;
  const supportW = BOARD_RIGHT - supportX;
  const supportCount = cards.length - 1;
  const supportH = (height - gap * (supportCount - 1)) / supportCount;
  cards.slice(1).forEach((card, i) => {
    drawMiniCard(ctx, card, supportX, y + i * (supportH + gap), supportW, supportH, i + 1, t, {
      sideIcon: true,
      small: supportH < 180,
      pulse: 0.012
    });
  });
}

function drawLanesLayout(ctx, cards, top, t) {
  drawBoardSurface(ctx, top, 83, { fill: 'rgba(255,255,255,.25)' });
  const y = top + 18;
  const gap = 16;
  const cols = cards.length === 1 ? 1 : 2;
  const rows = Math.ceil(cards.length / cols);
  const cardW = cols === 1 ? 760 : 420;
  const cardH = Math.min(244, (BOARD_BOTTOM - y - gap * (rows - 1)) / rows);
  const laneX = cols === 1 ? [120] : [74, 506];
  laneX.forEach((x, i) => {
    ctx.save();
    ctx.fillStyle = PALETTE[(i + 1) % PALETTE.length];
    roundRect(ctx, x - 10, y - 8, cardW + 20, rows * cardH + (rows - 1) * gap + 16, 26);
    ctx.globalAlpha = .55;
    ctx.fill();
    ctx.restore();
  });
  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    drawMiniCard(ctx, card, laneX[col], y + row * (cardH + gap), cardW, cardH, i, t, {
      sideIcon: true,
      small: true,
      pulse: 0.012
    });
  });
}

function drawBentoLayout(ctx, cards, top, t) {
  if (cards.length < 3) return drawGridLayout(ctx, cards, top, t);
  drawBoardSurface(ctx, top, 89);
  const y = top + 18;
  const gap = 16;
  const height = Math.min(548, BOARD_BOTTOM - y);
  if (cards.length === 3) {
    const topH = height * .52;
    drawCard(ctx, cards[0], 104, y, 792, topH, 0, t, { sideIcon: true, pulse: 0.016 });
    drawMiniCard(ctx, cards[1], 104, y + topH + gap, 388, height - topH - gap, 1, t, { small: true });
    drawMiniCard(ctx, cards[2], 508, y + topH + gap, 388, height - topH - gap, 2, t, { small: true });
    return;
  }
  const leftW = 506;
  const rightW = 350;
  drawCard(ctx, cards[0], BOARD_LEFT, y, leftW, height, 0, t, { pulse: 0.016 });
  const rightX = BOARD_LEFT + leftW + gap;
  const smallH = (height - gap * 2) / 3;
  cards.slice(1).forEach((card, i) => drawMiniCard(ctx, card, rightX, y + i * (smallH + gap), rightW, smallH, i + 1, t, {
    sideIcon: true,
    small: true,
    pulse: 0.011
  }));
}

function drawSplitFocusLayout(ctx, cards, top, t) {
  if (cards.length === 1) return drawSpotlightLayout(ctx, cards, top, t);
  drawBoardSurface(ctx, top, 97, { fill: 'rgba(255,255,255,.28)' });
  const y = top + 18;
  const gap = 18;
  const height = Math.min(548, BOARD_BOTTOM - y);
  const leftW = 548;
  drawCard(ctx, cards[0], BOARD_LEFT, y, leftW, height, 0, t, { pulse: 0.018 });
  const supportX = BOARD_LEFT + leftW + gap;
  const supportW = BOARD_RIGHT - supportX;
  const supportH = (height - gap * (cards.length - 2)) / (cards.length - 1);
  cards.slice(1).forEach((card, i) => drawMiniCard(ctx, card, supportX, y + i * (supportH + gap), supportW, supportH, i + 1, t, {
    sideIcon: supportH < 190,
    small: true,
    pulse: 0.012
  }));
}

function drawStaircaseLayout(ctx, cards, top, t) {
  drawBoardSurface(ctx, top, 101, { fill: 'rgba(255,255,255,.22)' });
  const y = top + 18;
  const gap = 14;
  const cardH = Math.min(132, (BOARD_BOTTOM - y - gap * (cards.length - 1)) / cards.length);
  cards.forEach((card, i) => {
    const x = 76 + i * 42;
    const w = 840 - i * 70;
    drawMiniCard(ctx, card, x, y + i * (cardH + gap), w, cardH, i, t, {
      sideIcon: true,
      small: true,
      pulse: 0.014
    });
  });
}

function drawBandsLayout(ctx, cards, top, t) {
  const y = top + 18;
  const gap = 10;
  const bandH = Math.min(132, (BOARD_BOTTOM - y - gap * (cards.length - 1)) / cards.length);
  cards.forEach((card, i) => {
    const inset = i % 2 ? 104 : 66;
    drawMiniCard(ctx, card, inset, y + i * (bandH + gap), 1000 - inset * 2, bandH, i, t, {
      sideIcon: true,
      small: true,
      fill: PALETTE[i % PALETTE.length],
      pulse: 0.012
    });
  });
}

function drawTriptychLayout(ctx, cards, top, t) {
  if (cards.length < 3) return drawComparisonComposition(ctx, cards, top, t, { seed: 107 });
  drawBoardSurface(ctx, top, 107);
  const y = top + 18;
  const gap = 14;
  const bottomH = cards.length === 4 ? 132 : 0;
  const mainH = Math.min(430, BOARD_BOTTOM - y - (bottomH ? bottomH + gap : 0));
  const cardW = (872 - gap * 2) / 3;
  cards.slice(0, 3).forEach((card, i) => drawCard(ctx, card, BOARD_LEFT + i * (cardW + gap), y, cardW, mainH, i, t, {
    pulse: 0.014
  }));
  if (cards[3]) drawMiniCard(ctx, cards[3], 154, y + mainH + gap, 692, bottomH, 3, t, {
    sideIcon: true,
    small: true,
    pulse: 0.012
  });
}

function drawDashboardLayout(ctx, cards, top, t) {
  if (cards.length < 3) return drawGridLayout(ctx, cards, top, t);
  drawBoardSurface(ctx, top, 113);
  const y = top + 18;
  const gap = 14;
  const heroH = 246;
  drawCard(ctx, cards[0], 96, y, 808, heroH, 0, t, { sideIcon: true, pulse: 0.017 });
  const count = cards.length - 1;
  const w = (872 - gap * (count - 1)) / count;
  const h = Math.min(254, BOARD_BOTTOM - y - heroH - gap);
  cards.slice(1).forEach((card, i) => drawMiniCard(ctx, card, BOARD_LEFT + i * (w + gap), y + heroH + gap, w, h, i + 1, t, {
    small: true,
    pulse: 0.012
  }));
}

function drawOrbitLayout(ctx, cards, top, t) {
  if (cards.length < 3) return drawSpotlightLayout(ctx, cards, top, t);
  drawBoardSurface(ctx, top, 127, { fill: 'rgba(255,255,255,.18)' });
  const y = top + 18;
  const height = Math.min(548, BOARD_BOTTOM - y);
  const centerY = y + height / 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(85,123,216,.16)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 10]);
  ctx.beginPath();
  ctx.ellipse(500, centerY, 350, 208, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  const positions = cards.length === 3
    ? [[360, y], [110, y + height - 214], [610, y + height - 214]]
    : [[88, y], [562, y], [88, y + height - 214], [562, y + height - 214]];
  cards.forEach((card, i) => drawMiniCard(ctx, card, positions[i][0], positions[i][1], cards.length === 3 ? 280 : 350, 214, i, t, {
    small: true,
    pulse: 0.017
  }));
}

function drawMatrixLayout(ctx, cards, top, t) {
  drawBoardSurface(ctx, top, 131, { fill: 'rgba(255,255,255,.24)' });
  const y = top + 18;
  const gap = 14;
  const cols = 2;
  const rows = Math.ceil(cards.length / cols);
  const w = (872 - gap) / 2;
  const h = Math.min(258, (BOARD_BOTTOM - y - gap * (rows - 1)) / rows);
  cards.forEach((card, i) => drawMiniCard(ctx, card, BOARD_LEFT + (i % cols) * (w + gap), y + Math.floor(i / cols) * (h + gap), w, h, i, t, {
    sideIcon: true,
    pulse: 0.013
  }));
}

function drawCards(ctx, page, design, top, t) {
  const layout = design.layout;
  const renderers = {
    row: drawRowLayout,
    timeline: drawTimelineLayout,
    spotlight: drawSpotlightLayout,
    stacked: drawStackedLayout,
    grid: drawGridLayout,
    mosaic: drawMosaicLayout,
    lanes: drawLanesLayout,
    bento: drawBentoLayout,
    'split-focus': drawSplitFocusLayout,
    staircase: drawStaircaseLayout,
    bands: drawBandsLayout,
    triptych: drawTriptychLayout,
    dashboard: drawDashboardLayout,
    orbit: drawOrbitLayout,
    matrix: drawMatrixLayout
  };
  if (layout === 'compare') return drawComparisonComposition(ctx, page.cards, top, t, design);
  if (layout === 'checklist') return drawChecklistComposition(ctx, page.cards, top, t, design);
  if (layout === 'flow-board') return drawFlowComposition(ctx, page.cards, top, t, design);
  if (layout === 'system-board') return drawSystemMapComposition(ctx, page.cards, top, t, design);
  if (layout === 'failure-focus') return drawFailureMapComposition(ctx, page.cards, top, t, design);
  return (renderers[layout] || drawCompactGridComposition)(ctx, page.cards, top, t, design);
}

function minimumCardsTop(introStyle) {
  if (introStyle === 'quiet') return 188;
  if (introStyle === 'ribbon') return 218;
  if (introStyle === 'split') return 218;
  if (introStyle === 'badge') return 222;
  return 230;
}

function drawPage(ctx, page, pageIndex, total, frame) {
  const t = frame / (FPS * DURATION);
  const design = pageDesign(page, pageIndex);
  drawPaper(ctx);
  const introStart = drawTitleBlock(ctx, page, design);
  const cardsTop = Math.min(342, drawIntro(ctx, page, design, introStart, t) + 14);
  drawCards(ctx, page, design, Math.max(cardsTop, minimumCardsTop(design.introStyle)), t);
}

function renderGif(page, index, total, outPath) {
  const canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),gif=new GIFEncoder(W,H);gif.start();gif.setRepeat(0);gif.setDelay(1000/FPS);gif.setQuality(15);
  for(let f=0;f<FPS*DURATION;f++){drawPage(ctx,page,index,total,f);gif.addFrame(ctx);}
  gif.finish();fs.writeFileSync(outPath,gif.out.getData());
}

function cleanStaleGifs(outDir, outputs) {
  const keep = new Set(outputs);
  for (const fileName of fs.readdirSync(outDir)) {
    if (fileName.endsWith('.gif') && !keep.has(fileName)) fs.unlinkSync(path.join(outDir, fileName));
  }
}

function main() {
  const args=parseArgs(process.argv.slice(2));if(args.help||!args.input){usage();process.exit(args.help?0:1);}
  const input=args.input, outDir=path.resolve(args.outDir);const abs=path.resolve(input);const raw=fs.readFileSync(abs,'utf8');
  if(path.extname(abs).toLowerCase()!=='.json')throw new Error('Pipeline 1 requires an agent-authored storyboard.json input.');
  const storyboard=sanitizeStoryboardText(JSON.parse(raw));validateStoryboard(storyboard);
  if (args.page !== undefined) {
    if (!Number.isInteger(args.page) || args.page < 1 || args.page > storyboard.pages.length) throw new Error(`--page must be between 1 and ${storyboard.pages.length}`);
    storyboard.pages = [storyboard.pages[args.page - 1]];
  }
  fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'storyboard.json'),JSON.stringify(storyboard,null,2));
  const outputs=[];storyboard.pages.forEach((page,i)=>{const name=`${String(i+1).padStart(2,'0')}-${page.fileSlug || slug(page.section)}.gif`;renderGif(page,i,storyboard.pages.length,path.join(outDir,name));outputs.push(name);console.log(`Rendered ${name}`);});
  cleanStaleGifs(outDir, outputs);
  fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify({
    pipeline:'ai-gif-pipeline-1',
    source:path.basename(abs),
    assetSlug:assetSlugFromOutputDir(outDir),
    title:storyboard.title,
    outputs:{
      storyboard:'storyboard.json',
      gifs:outputs
    },
    pages:outputs
  },null,2));console.log(`Done: ${outputs.length} GIF(s) in ${outDir}`);
}

main();
