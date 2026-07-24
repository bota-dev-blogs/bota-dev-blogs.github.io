const { createCanvas } = require('@napi-rs/canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');
const sharedIcons = require('../shared/semantic-icons.cjs');

let W = 1000, H = 1000;
const FPS = 20, DURATION = 2;
const BG = '#fffdf8', INK = '#30324d', MUTED = '#686c80';
const FONT_STACK = '"Avenir Next","Inter","Segoe UI","Helvetica Neue",Arial,"Microsoft YaHei",sans-serif';
const PALETTE = ['#dff4ee', '#e5eafe', '#f7e5f1', '#fff0cf', '#e5f5dc'];
const ACCENTS = ['#259d8f', '#557bd8', '#ad67a7', '#e99b1c', '#69a34f'];
const LAYOUTS = new Set([
  'linear-flow', 'staged-flow', 'branching', 'before-after', 'cycle', 'hub-spoke', 'cause-effect',
  'timeline', 'semantic-map', 'converging', 'diverging', 'parallel-lanes', 'swimlanes', 'matrix',
  'funnel', 'layered-stack', 'bridge', 'decision-tree', 'constellation', 'relay-board',
  'trust-stack', 'signal-path', 'control-loop', 'schema-rail', 'retrieval-loop',
  'scatter-gather', 'hourglass', 'spiral'
]);
const EDGE_END_SHAPES = new Set(['auto', 'arrow', 'chevron', 'diamond', 'circle', 'bar', 'none']);
const LABEL_RICH_LAYOUTS = new Set(['semantic-map', 'staged-flow', 'schema-rail', 'retrieval-loop', 'scatter-gather', 'hourglass', 'spiral']);
const EDGE_GROUP_COLORS = ['#505365','#397c72','#6858b5','#b87918','#b84f63'];
const GROUP_COLORS = {teal:'rgba(37,157,143,.07)',blue:'rgba(85,123,216,.07)',purple:'rgba(173,103,167,.07)',orange:'rgba(233,155,28,.07)',green:'rgba(105,163,79,.07)'};
const GROUP_STROKES = {teal:'#62afa5',blue:'#829ce0',purple:'#bf8aba',orange:'#ebb256',green:'#8db879'};

function usage() { console.log('Usage: node comic_pipeline.js <article.md|storyboard.json> [output-dir] [--page n]'); }
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
function slug(s) { return String(s || 'article').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'article'; }
function assetSlug(s) { return String(s || 'blog-gif').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || 'blog-gif'; }
function assetSlugFromOutputDir(outputDir) {
  const base = path.basename(outputDir);
  const candidate = /^pipeline-\d+$/.test(base) ? path.basename(path.dirname(outputDir)) : base;
  return assetSlug(candidate);
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function short(text, limit) { const s = String(text || '').trim(); return s.length <= limit ? s : s.slice(0, limit - 1).replace(/[\s，。,.!?；;：:]+$/, '') + '…'; }
function matchCase(replacement, sample) { if (sample === sample.toUpperCase()) return replacement.toUpperCase(); if (sample[0] === sample[0].toUpperCase()) return replacement.replace(/\b[a-z]/g, c => c.toUpperCase()); return replacement; }
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
    .replace(/\bTL;DR\b|\bTLDR\b/gi, m => matchCase('short version', m))
    .replace(/\bpractical design takeaways\b/gi, m => matchCase('design rules', m))
    .replace(/\bkey takeaways\b/gi, m => matchCase('key ideas', m))
    .replace(/\btakeaways\b/gi, m => matchCase('key ideas', m))
    .replace(/\btakeaway\b/gi, m => matchCase('key idea', m))
    .replace(/\bthis\s+(?:blog\s+)?(?:post|article|essay)\b/gi, m => matchCase('the work', m))
    .replace(/\bthe\s+(?:blog\s+)?(?:post|article|essay)\b/gi, m => matchCase('the work', m))
    .replace(/\bblog post\b/gi, m => matchCase('article', m))
    .replace(/\breferences?\s+section\b/gi, m => matchCase('evidence', m))
    .replace(/\bbibliography\b|\bsources\s+section\b|\bsource\s+list\b|\blist\s+of\s+sources\b/gi, m => matchCase('evidence', m))
    .replace(/\bfurther reading\b/gi, m => matchCase('more evidence', m))
    .replace(/\bappendix\b/gi, m => matchCase('details', m))
    .replace(/\btable of contents\b/gi, m => matchCase('map', m))
    .replace(/\b(?:the\s+)?abstract\s+section\b|\bthe\s+abstract\b/gi, m => matchCase('core idea', m))
    .replace(/\b(?:the\s+)?introduction\s+section\b|\bthe\s+introduction\b/gi, m => matchCase('context', m))
    .replace(/\b(?:the\s+)?related\s+work\s+section\b|\bthe\s+related\s+work\b/gi, m => matchCase('prior work', m))
    .replace(/\b(?:the\s+)?discussion\s+section\b|\bthe\s+discussion\b/gi, m => matchCase('implications', m))
    .replace(/\b(?:the\s+)?limitations?\s+section\b|\bthe\s+limitations?\b/gi, m => matchCase('boundaries', m))
    .replace(/\b(?:the\s+)?future\s+work\s+section\b|\bfuture\s+work\b/gi, m => matchCase('next questions', m))
    .replace(/\bfigure\s+\d+\b/gi, m => matchCase('diagram', m))
    .replace(/\btable\s+\d+\b/gi, m => matchCase('comparison', m))
    .replace(/\bsection\s+\d+\b/gi, m => matchCase('part', m))
    .replace(/\bchapter\s+\d+\b/gi, m => matchCase('part', m))
    .replace(/\bfront\s*matter\b|\bseo metadata\b|\bmetadata\b/gi, m => matchCase('publishing details', m))
    .replace(/\bfinal thoughts\b/gi, m => matchCase('what it means', m))
    .replace(/\bconclusion\b/gi, m => matchCase('what it means', m))
    .replace(/\boverview\b/gi, m => matchCase('map', m));
  text = text.replace(/\s+/g, ' ').trim();
  for (const [pattern, replacement] of EXACT_VISIBLE_LABELS) if (pattern.test(text)) return replacement;
  return text;
}
function sanitizeStoryboardText(storyboard) {
  storyboard.title = sanitizeVisibleText(storyboard.title);
  if (storyboard.visualDirection) {
    storyboard.visualDirection.character = sanitizeVisibleText(storyboard.visualDirection.character);
    storyboard.visualDirection.recurringMetaphor = sanitizeVisibleText(storyboard.visualDirection.recurringMetaphor);
  }
  for (const [index, page] of (storyboard.pages || []).entries()) {
    page.outputFile = page.outputFile || defaultOutputName(page, index, storyboard.pages.length);
    page.title = sanitizeVisibleText(page.title);
    page.section = sanitizeVisibleText(page.section);
    page.headline = sanitizeVisibleText(page.headline);
    for (const node of page.nodes || []) {
      node.label = sanitizeVisibleText(node.label);
      node.caption = sanitizeVisibleText(node.caption);
    }
    for (const edge of page.edges || []) edge.label = sanitizeVisibleText(edge.label);
    for (const group of page.groups || []) group.label = sanitizeVisibleText(group.label);
  }
  return storyboard;
}

function isSafeGifBasename(fileName) {
  return typeof fileName === 'string'
    && path.basename(fileName) === fileName
    && /^[A-Za-z0-9][A-Za-z0-9._-]*\.gif$/.test(fileName);
}

function validateStoryboard(sb) {
  if (!sb || sb.version !== 2 || !Array.isArray(sb.pages) || !sb.pages.length) throw new Error('storyboard v2 requires non-empty pages');
  const outputFiles = new Set();
  sb.pages.forEach((p, i) => {
    if (!p.title || !p.section || !LAYOUTS.has(p.layout)) throw new Error(`page ${i + 1}: invalid title, section, or layout`);
    if (!isSafeGifBasename(p.outputFile)) throw new Error(`page ${i + 1}: outputFile must be a safe basename ending in .gif`);
    if (outputFiles.has(p.outputFile)) throw new Error(`page ${i + 1}: duplicate outputFile "${p.outputFile}"`);
    outputFiles.add(p.outputFile);
    if (!Array.isArray(p.nodes) || p.nodes.length < 2 || p.nodes.length > 6) throw new Error(`page ${i + 1}: nodes must contain 2-6 items`);
    const ids = new Set(p.nodes.map(n => n.id));
    if (ids.size !== p.nodes.length) throw new Error(`page ${i + 1}: node ids must be unique`);
    for (const e of p.edges || []) {
      if (!ids.has(e.from) || !ids.has(e.to)) throw new Error(`page ${i + 1}: edge references unknown node`);
      if (e.endShape && !EDGE_END_SHAPES.has(e.endShape)) throw new Error(`page ${i + 1}: edge uses unsupported endShape "${e.endShape}"`);
    }
    if (p.layout === 'semantic-map' && p.nodes.some(n => !n.position)) throw new Error(`page ${i + 1}: semantic-map requires every node.position`);
    for (const g of p.groups || []) for (const id of g.nodeIds) if (!ids.has(id)) throw new Error(`page ${i + 1}: group references unknown node`);
  });
}

function tokenize(text) {
  const value = String(text || '').trim();
  return /[\u3400-\u9fff]/.test(value) ? Array.from(value) : value.split(/(\s+)/).filter(Boolean);
}

function wrapLines(ctx, text, width, maxLines) {
  const tokens = tokenize(text), lines = []; let line = '', consumed = 0;
  for (const token of tokens) {
    if (ctx.measureText(line + token).width > width && line.trim()) { lines.push(line.trim()); line = token.trimStart(); }
    else line += token;
    consumed++;
    if (lines.length >= maxLines) break;
  }
  if (line.trim() && lines.length < maxLines) lines.push(line.trim());
  return { lines, overflow: consumed < tokens.length };
}

function fittedText(ctx, text, width, maxLines, maxSize, minSize, weight = 400) {
  for (let size = maxSize; size >= minSize; size--) {
    ctx.font = `${weight} ${size}px ${FONT_STACK}`;
    const result = wrapLines(ctx, text, width, maxLines);
    if (!result.overflow) return { ...result, size };
  }
  ctx.font = `${weight} ${minSize}px ${FONT_STACK}`;
  return { ...wrapLines(ctx, short(text, Math.max(18, maxLines * 16)), width, maxLines), size: minSize };
}

function drawLines(ctx, result, x, y, lineHeight, align = 'center') {
  ctx.textAlign = align; ctx.textBaseline = 'top';
  result.lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
}

function textBlockHeight(result, lineHeight) {
  return result.lines.length ? result.lines.length * lineHeight : 0;
}

function icon(ctx, name, x, y, color, phase = 0) {
  return sharedIcons.drawCanvasIcon(ctx, name, x, y, color, phase);
}


function drawSemanticIcon(ctx, name, x, y, color, phase, scale, viewportW, viewportH) {
  ctx.save();ctx.beginPath();ctx.rect(x-viewportW/2,y-viewportH/2,viewportW,viewportH);ctx.clip();
  ctx.translate(x,y);ctx.scale(scale,scale);icon(ctx,name,0,0,color,phase);ctx.restore();
}

function normalizedPositions(layout, count) {
  const line = (n, y, left = .04, right = .96) => Array.from({length:n}, (_, i) => [n === 1 ? .5 : left + i * ((right - left) / (n - 1)), y]);
  const grid = (n, cols = 3, left = .04, right = .96, top = .08, bottom = .92) => {
    const rows = Math.ceil(n / cols);
    return Array.from({length:n}, (_, i) => {
      const row = Math.floor(i / cols), col = i % cols;
      const rowCount = Math.min(cols, n - row * cols);
      const rowLeft = rowCount === 1 ? .5 : left;
      const rowRight = rowCount === 1 ? .5 : right;
      return [rowCount === 1 ? .5 : rowLeft + col * ((rowRight - rowLeft) / (rowCount - 1)), rows === 1 ? .5 : top + row * ((bottom - top) / (rows - 1))];
    });
  };
  const ring = (n, rx = .43, ry = .43, offset = -Math.PI / 2) => Array.from({length:n}, (_, i) => {
    const angle = offset + i * Math.PI * 2 / n;
    return [.5 + rx * Math.cos(angle), .5 + ry * Math.sin(angle)];
  });
  if (layout === 'staged-flow') {
    if (count === 3) return [[.05,.12],[.5,.88],[.95,.12]];
    if (count === 4) return [[.08,.12],[.92,.12],[.92,.88],[.08,.88]];
    if (count === 5) return [[.02,.12],[.5,.12],[.98,.12],[.74,.88],[.26,.88]];
    return [[.02,.12],[.5,.12],[.98,.12],[.98,.88],[.5,.88],[.02,.88]];
  }
  if (layout === 'before-after') return count <= 2 ? line(count, .5, .08, .92) : grid(count, 2, .08, .92, .1, .9);
  if (layout === 'cycle' || layout === 'control-loop') return ring(count, .43, .43);
  if (layout === 'hub-spoke') return [[.5,.5], ...ring(count - 1, .46, .43)];
  if (layout === 'constellation') return ring(count, .46, .39, -.8);
  if (layout === 'branching' || layout === 'decision-tree') {
    if (count <= 3) return [[.5,.06], ...line(count - 1, .86, .2, .8)];
    const upperCount = Math.min(2, count - 1);
    return [[.5,.04], ...line(upperCount, .48, .22, .78), ...line(count - 1 - upperCount, .94, .08, .92)];
  }
  if (layout === 'cause-effect') {
    const left = Math.ceil(count / 2), right = count - left;
    return [
      ...Array.from({length:left}, (_, i) => [.08, left === 1 ? .5 : .08 + i * (.84 / (left - 1))]),
      ...Array.from({length:right}, (_, i) => [.92, right === 1 ? .5 : .08 + i * (.84 / (right - 1))])
    ];
  }
  if (layout === 'converging') return [...grid(count - 1, 2, .02, .5, .02, .98), [.98,.5]];
  if (layout === 'diverging') return [[.02,.5], ...grid(count - 1, 2, .5, .98, .02, .98)];
  if (layout === 'parallel-lanes') {
    const topCount = Math.ceil(count / 2), bottomCount = count - topCount;
    return [...line(topCount, .18, .04, .96), ...line(bottomCount, .82, .04, .96)];
  }
  if (layout === 'relay-board') {
    if (count < 4) return line(count, .5, .02, .98);
    const routeCount = count - 3;
    const routes = Array.from({length:routeCount}, (_, i) => [.32, routeCount === 1 ? .5 : .08 + i * (.84 / (routeCount - 1))]);
    return [[.02,.5], ...routes, [.72,.5], [.98,.5]];
  }
  if (layout === 'swimlanes') return Array.from({length:count}, (_, i) => {
    const col = Math.floor(i / 2), cols = Math.ceil(count / 2);
    return [cols === 1 ? .5 : .04 + col * (.92 / (cols - 1)), i % 2 ? .82 : .18];
  });
  if (layout === 'matrix') return grid(count, count <= 4 ? 2 : 3, .04, .96, .08, .92);
  if (layout === 'funnel') {
    if (count === 2) return [[.22,.08],[.5,.92]];
    const topCount = Math.min(3, count - 1), middleCount = count - topCount - 1;
    return [...line(topCount, .08, .04, .96), ...line(middleCount, .5, .25, .75), [.5,.94]];
  }
  if (layout === 'layered-stack') return grid(count, 2, .24, .76, .04, .96);
  if (layout === 'trust-stack') return Array.from({length:count}, (_, i) => [i % 2 ? .58 : .42, count === 1 ? .5 : .04 + i * (.92 / (count - 1))]);
  if (layout === 'signal-path') return Array.from({length:count}, (_, i) => [count === 1 ? .5 : .02 + i * (.96 / (count - 1)), i % 2 ? .78 : .22]);
  if (layout === 'schema-rail') {
    const sideCount = count <= 4 ? 1 : 2, processCount = count - sideCount;
    const side = Array.from({length:sideCount}, (_, i) => [.12, sideCount === 1 ? .5 : .28 + i * .44]);
    const process = Array.from({length:processCount}, (_, i) => [.7, processCount === 1 ? .5 : .04 + i * (.92 / (processCount - 1))]);
    return [...side, ...process];
  }
  if (layout === 'retrieval-loop') {
    if (count <= 3) return line(count, .24, .04, .96);
    const topCount = 3, lowerCount = count - topCount;
    return [...line(topCount, .18, .04, .96), ...line(lowerCount, .84, lowerCount === 1 ? .5 : .28, lowerCount === 1 ? .5 : .72)];
  }
  if (layout === 'scatter-gather') {
    if (count <= 2) return line(count, .5, .04, .96);
    const workerCount = count - 2;
    return [[.02,.5], ...Array.from({length:workerCount}, (_, i) => [.5, workerCount === 1 ? .5 : .04 + i * (.92 / (workerCount - 1))]), [.98,.5]];
  }
  if (layout === 'hourglass') {
    if (count <= 2) return line(count, .5, .18, .82);
    const topCount = Math.ceil((count - 1) / 2), bottomCount = count - topCount - 1;
    return [...line(topCount, .05, .08, .92), [.5,.5], ...line(bottomCount, .95, .2, .8)];
  }
  if (layout === 'spiral') {
    if (count <= 2) return line(count, .5, .08, .92);
    return [...ring(count - 1, .46, .48), [.5,.5]];
  }
  if (layout === 'bridge' && count <= 4) return Array.from({length:count}, (_, i) => {
    const progress = i / Math.max(1, count - 1);
    return [.03 + progress * .94, .78 - Math.sin(progress * Math.PI) * .68];
  });
  if (layout === 'bridge') return grid(count, 3, .04, .96, .08, .92);
  if (layout === 'timeline') return count <= 3
    ? Array.from({length:count}, (_, i) => [count === 1 ? .5 : .04 + i * (.92 / (count - 1)), i % 2 ? .82 : .18])
    : grid(count, 3, .04, .96, .08, .92);
  return count <= 3 ? line(count, .5, .02, .98) : grid(count, 3, .04, .96, .08, .92);
}

function fixedLayout(page, compact, frame) {
  const bounds=page.nodes.map(node=>nodeBounds(node,compact));
  const maxHalfW=Math.max(...bounds.map(bound=>bound.halfW)),maxHalfH=Math.max(...bounds.map(bound=>bound.halfH));
  const centerFrame={
    left:frame.left+maxHalfW+18,
    right:frame.right-maxHalfW-18,
    top:frame.top+maxHalfH+20,
    bottom:frame.bottom-maxHalfH-20
  };
  const mapX=value=>centerFrame.left+clamp(value,0,1)*(centerFrame.right-centerFrame.left);
  const mapY=value=>centerFrame.top+clamp(value,0,1)*(centerFrame.bottom-centerFrame.top);
  const point=value=>[mapX(value.x),mapY(value.y)];
  return {
    pts:normalizedPositions(page.layout,page.nodes.length).map(([x,y])=>[mapX(x),mapY(y)]),
    point,
    labelFrame:{left:frame.left+8,right:frame.right-8,top:frame.top+2,bottom:frame.bottom-8}
  };
}

function layoutFrame(page, headerBottom) {
  const wide=page.format==='wide';
  return {
    left:wide?52:46,
    right:W-(wide?52:46),
    top:Math.max(headerBottom+(wide?18:22),wide?168:190),
    bottom:H-(wide?42:50)
  };
}

function axisMapper(min, max, targetMin, targetMax, minSpan) {
  const targetMid=(targetMin+targetMax)/2;
  if(!Number.isFinite(min)||!Number.isFinite(max)||Math.abs(max-min)<.001)return()=>targetMid;
  let span=Math.max(max-min,minSpan),mid=(min+max)/2,lo=mid-span/2,hi=mid+span/2;
  if(lo<0){hi-=lo;lo=0;}if(hi>1){lo-=hi-1;hi=1;}
  lo=clamp(lo,0,.999);hi=clamp(hi,lo+.001,1);
  return v=>clamp(targetMin+((v-lo)/(hi-lo))*(targetMax-targetMin),targetMin,targetMax);
}

function semanticLayout(page, compact, frame) {
  const wide=page.format==='wide',bounds=page.nodes.map(n=>nodeBounds(n,compact));
  const maxHalfW=Math.max(...bounds.map(b=>b.halfW)),maxHalfH=Math.max(...bounds.map(b=>b.halfH));
  let centerFrame={
    left:frame.left+maxHalfW+(wide?28:24),
    right:frame.right-maxHalfW-(wide?28:24),
    top:frame.top+maxHalfH+(wide?24:34),
    bottom:frame.bottom-maxHalfH-(wide?28:34)
  };
  if(centerFrame.left>centerFrame.right){const mid=(frame.left+frame.right)/2;centerFrame.left=centerFrame.right=mid;}
  if(centerFrame.top>centerFrame.bottom){const mid=(frame.top+frame.bottom)/2;centerFrame.top=centerFrame.bottom=mid;}
  const xs=page.nodes.map(n=>n.position.x),ys=page.nodes.map(n=>n.position.y);
  const mapX=axisMapper(Math.min(...xs),Math.max(...xs),centerFrame.left,centerFrame.right,wide ? .44 : .36);
  const mapY=axisMapper(Math.min(...ys),Math.max(...ys),centerFrame.top,centerFrame.bottom,wide ? .28 : .32);
  return {
    pts:page.nodes.map(n=>[mapX(n.position.x),mapY(n.position.y)]),
    point:p=>[mapX(p.x),mapY(p.y)],
    labelFrame:{left:frame.left+8,right:frame.right-8,top:frame.top+2,bottom:frame.bottom-8}
  };
}

function edgeProgress(t, index, count) { return (t + index / Math.max(1, count)) % 1; }
function nodeProgress(t, index, count) { return .95 + .05 * (.5 + .5 * Math.sin((t + index / Math.max(1, count)) * Math.PI * 2)); }

function pointOnPolyline(points, progress) {
  if (!points.length) return [0, 0];
  if (points.length === 1) return points[0];
  const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  let target = ((progress % 1) + 1) % 1 * total;
  for (let index = 0; index < lengths.length; index += 1) {
    if (target <= lengths[index]) {
      const ratio = target / (lengths[index] || 1);
      return [
        points[index][0] + (points[index + 1][0] - points[index][0]) * ratio,
        points[index][1] + (points[index + 1][1] - points[index][1]) * ratio
      ];
    }
    target -= lengths[index];
  }
  return points[points.length - 1];
}

function nodeBounds(node, compact) {
  const shape=node.shape||'card';
  if(shape==='illustration')return {halfW:118,halfH:128};
  if(shape==='pill')return {halfW:130,halfH:64};
  return {halfW:(compact?110:132),halfH:(compact?92:98)};
}

function nodeBodyMetrics(node, compact) {
  const shape=node.shape||'card';
  if(shape==='illustration')return {width:190,maxLines:3,maxSize:16};
  if(shape==='pill')return {width:170,maxLines:2,maxSize:15};
  return {width:(compact?210:250)-38,maxLines:3,maxSize:16};
}

function sharedBodyTypography(ctx, nodes, compact) {
  const maxSize=Math.min(16,...nodes.map(n=>nodeBodyMetrics(n,compact).maxSize));
  for(let size=maxSize;size>=11;size--){
    const fits=nodes.every(node=>{const m=nodeBodyMetrics(node,compact);ctx.font=`400 ${size}px ${FONT_STACK}`;return !wrapLines(ctx,node.caption,m.width,m.maxLines).overflow;});
    if(fits)return {bodySize:size};
  }
  return {bodySize:11};
}

function edgeAnchor(from, to, compact) {
  const [x1,y1]=from.point,[x2,y2]=to.point||to,dx=x2-x1,dy=y2-y1,b=nodeBounds(from.node,compact);
  const scale=1/Math.max(Math.abs(dx)/b.halfW,Math.abs(dy)/b.halfH,0.001);
  return [x1+dx*scale,y1+dy*scale];
}

function edgePath(from, to, compact, via=[], pathStyle='straight', bend=.24) {
  const firstTarget=via[0]||to.point,lastSource=via[via.length-1]||from.point;
  const start=edgeAnchor(from,firstTarget,compact),end=edgeAnchor(to,lastSource,compact),points=[start,...via,end];
  if(pathStyle==='curve'&&!via.length){
    const dx=end[0]-start[0],dy=end[1]-start[1],len=Math.hypot(dx,dy)||1,nx=dy/len,ny=-dx/len,amount=Math.min(len,280)*bend;
    const control=[(start[0]+end[0])/2+nx*amount,(start[1]+end[1])/2+ny*amount],curve=[];
    for(let i=0;i<=24;i++){const t=i/24,u=1-t;curve.push([u*u*start[0]+2*u*t*control[0]+t*t*end[0],u*u*start[1]+2*u*t*control[1]+t*t*end[1]]);}
    return curve;
  }
  return points;
}

function resolvedEndShape(relation, requested='auto') {
  if (requested && requested !== 'auto') return requested;
  return ({flow:'arrow',supervision:'circle',evidence:'diamond',contrast:'chevron',constraint:'bar'})[relation] || 'arrow';
}

function drawEdgeEnd(ctx, points, color, relation, requested='auto') {
  const shape=resolvedEndShape(relation,requested);
  if(shape==='none'||points.length<2)return;
  const [px,py]=points[points.length-2],[ex,ey]=points[points.length-1],dx=ex-px,dy=ey-py,length=Math.hypot(dx,dy)||1;
  const ux=dx/length,uy=dy/length,nx=-uy,ny=ux;
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=.92;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';
  if(shape==='arrow'){
    const backX=ex-10*ux,backY=ey-10*uy;
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(backX+5*nx,backY+5*ny);ctx.lineTo(backX-5*nx,backY-5*ny);ctx.closePath();ctx.fill();
  }else if(shape==='chevron'){
    const backX=ex-9*ux,backY=ey-9*uy;
    ctx.beginPath();ctx.moveTo(backX+5*nx,backY+5*ny);ctx.lineTo(ex,ey);ctx.lineTo(backX-5*nx,backY-5*ny);ctx.stroke();
  }else if(shape==='diamond'){
    const centerX=ex-5*ux,centerY=ey-5*uy,backX=ex-10*ux,backY=ey-10*uy;
    ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(centerX+5*nx,centerY+5*ny);ctx.lineTo(backX,backY);ctx.lineTo(centerX-5*nx,centerY-5*ny);ctx.closePath();ctx.fill();
  }else if(shape==='circle'){
    ctx.beginPath();ctx.arc(ex-4*ux,ey-4*uy,5,0,Math.PI*2);ctx.stroke();
  }else if(shape==='bar'){
    ctx.beginPath();ctx.moveTo(ex+6*nx,ey+6*ny);ctx.lineTo(ex-6*nx,ey-6*ny);ctx.stroke();
  }
  ctx.restore();
}

function drawArrow(ctx, points, phase, relation='flow', groupStyle=null, endShape='auto') {
  const styles={flow:{color:'#505365',dash:[8,7]},supervision:{color:'#8057d9',dash:[3,6]},evidence:{color:'#357a61',dash:[8,7]},contrast:{color:'#cf5c62',dash:[12,6]},constraint:{color:'#cf8b1e',dash:[2,5]}},style=styles[relation]||styles.flow;
  const resolved=groupStyle||style,resolvedCycle=resolved.dash[0]+resolved.dash[1];
  ctx.save();ctx.strokeStyle=resolved.color;ctx.fillStyle=resolved.color;ctx.lineWidth=resolved.lineWidth||(relation==='supervision'?3:2.5);ctx.lineCap='round';ctx.setLineDash(resolved.dash);ctx.lineDashOffset=-phase*resolvedCycle*4;
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);
  const pulse=pointOnPolyline(points,phase),echo=pointOnPolyline(points,phase+.5);
  [pulse,echo].forEach(([x,y],index)=>{ctx.globalAlpha=.3+.25*(.5+.5*Math.sin(phase*Math.PI*2+index));ctx.beginPath();ctx.arc(x,y,index?3.5:4.5,0,Math.PI*2);ctx.fill();});
  ctx.restore();
  drawEdgeEnd(ctx,points,resolved.color,relation,endShape);
}

function groupGeometries(ctx, groups, map, compact, frame) {
  const result=[];ctx.save();
  for(const group of groups||[]){
    const members=group.nodeIds.map(id=>map.get(id)).filter(Boolean);if(!members.length)continue;
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(const member of members){const b=nodeBounds(member.node,compact),[x,y]=member.point;left=Math.min(left,x-b.halfW);right=Math.max(right,x+b.halfW);top=Math.min(top,y-b.halfH);bottom=Math.max(bottom,y+b.halfH);}
    left-=22;right+=22;top-=44;bottom+=30;
    const limits={left:frame?.left??12,right:frame?.right??W-12,top:frame?.top??140,bottom:frame?.bottom??H-18};
    left=Math.max(limits.left,left);right=Math.min(limits.right,right);top=Math.max(limits.top,top);bottom=Math.min(limits.bottom,bottom);
    let labelSize=17;ctx.font=`700 ${labelSize}px ${FONT_STACK}`;let labelWidth=ctx.measureText(group.label).width;
    const neededWidth=labelWidth+36,currentWidth=right-left;
    if(currentWidth<neededWidth){const grow=(neededWidth-currentWidth)/2;left-=grow;right+=grow;if(left<limits.left){right+=limits.left-left;left=limits.left;}if(right>limits.right){left-=right-limits.right;right=limits.right;}left=Math.max(limits.left,left);}
    while(labelSize>12&&labelWidth>right-left-36){labelSize--;ctx.font=`700 ${labelSize}px ${FONT_STACK}`;labelWidth=ctx.measureText(group.label).width;}
    const labelX=group.labelAlign==='right'?right-18:left+18,labelTop=top+20-labelSize/2-5,labelBottom=top+20+labelSize/2+5;
    result.push({group,left,top,right,bottom,labelX,labelSize,labelRect:{left:group.labelAlign==='right'?labelX-labelWidth-5:labelX-5,right:group.labelAlign==='right'?labelX+5:labelX+labelWidth+5,top:labelTop,bottom:labelBottom}});
  }
  ctx.restore();return result;
}

function drawGroups(ctx, geometries) {
  for(const g of geometries){const {group,left,top,right,bottom,labelX,labelSize}=g;
    roundRect(ctx,left,top,right-left,bottom-top,28);ctx.fillStyle=GROUP_COLORS[group.color]||GROUP_COLORS.blue;ctx.fill();ctx.strokeStyle=GROUP_STROKES[group.color]||GROUP_STROKES.blue;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=GROUP_STROKES[group.color]||GROUP_STROKES.blue;ctx.font=`700 ${labelSize}px ${FONT_STACK}`;ctx.textAlign=group.labelAlign==='right'?'right':'left';ctx.textBaseline='middle';ctx.fillText(group.label,labelX,top+20);
  }
}

function rectsOverlap(a,b,pad=0){return a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;}
function segmentHitsRect(a,b,r){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.max(2,Math.ceil(length/5));
  for(let i=0;i<=steps;i++){const t=i/steps,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom)return true;}
  return false;
}

function placeEdgeLabels(ctx, edgeSpecs, obstacles, labelFrame={left:12,right:W-12,top:180,bottom:H-18}) {
  const placed=[],allSegments=edgeSpecs.flatMap(spec=>spec.points.slice(0,-1).map((a,i)=>[a,spec.points[i+1]]));
  const ranked=edgeSpecs.filter(spec=>spec.label).sort((a,b)=>(b.priority==='essential')-(a.priority==='essential'));
  for(const spec of ranked){
    const labelSize=spec.label.length>15?12:spec.label.length>11?13:15;ctx.font=`600 ${labelSize}px ${FONT_STACK}`;
    const width=ctx.measureText(spec.label).width,height=labelSize+4;
    const segments=spec.points.slice(0,-1).map((a,i)=>({a,b:spec.points[i+1],length:Math.hypot(spec.points[i+1][0]-a[0],spec.points[i+1][1]-a[1])})).sort((a,b)=>b.length-a.length);
    const fractions=spec.priority==='essential'?[.35,.65,.5,.22,.78]:[.35,.65,.5],extraOffsets=spec.priority==='essential'?[10,24,40]:[10,24];
    let accepted=null;
    candidate: for(const segment of segments){
      const dx=segment.b[0]-segment.a[0],dy=segment.b[1]-segment.a[1],len=segment.length||1,nx=dy/len,ny=-dx/len;
      const clearance=Math.abs(nx)*width/2+Math.abs(ny)*height/2;
      for(const fraction of fractions)for(const side of [1,-1])for(const extra of extraOffsets){
        const offset=side*(clearance+extra),x=segment.a[0]+dx*fraction+nx*offset,y=segment.a[1]+dy*fraction+ny*offset;
        const rect={left:x-width/2-3,right:x+width/2+3,top:y-height/2-3,bottom:y+height/2+3};
        if(rect.left<labelFrame.left||rect.right>labelFrame.right||rect.top<labelFrame.top||rect.bottom>labelFrame.bottom)continue;
        if(obstacles.some(o=>rectsOverlap(rect,o,5))||placed.some(p=>rectsOverlap(rect,p.rect,7)))continue;
        const lineRect={left:rect.left-4,right:rect.right+4,top:rect.top-4,bottom:rect.bottom+4};
        if(allSegments.some(([a,b])=>segmentHitsRect(a,b,lineRect)))continue;
        accepted={...spec,x,y,rect,labelSize};break candidate;
      }
    }
    if(accepted)placed.push(accepted);
  }
  return placed;
}

function drawEdgeLabels(ctx, labels){
  ctx.save();ctx.fillStyle=MUTED;ctx.textAlign='center';ctx.textBaseline='middle';
  for(const label of labels){ctx.font=`600 ${label.labelSize}px ${FONT_STACK}`;ctx.fillText(label.label,label.x,label.y);}
  ctx.restore();
}

function drawLayoutBackdrop(ctx, page, points, frame, t) {
  const layout = page.layout;
  const accent = ACCENTS[(page.title.length + page.nodes.length) % ACCENTS.length];
  const left = frame.left + 12, right = frame.right - 12, top = frame.top + 10, bottom = frame.bottom - 10;
  const width = right - left, height = bottom - top;
  const pulse = .5 + .5 * Math.sin(t * Math.PI * 2);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (layout === 'schema-rail') {
    const sideCount = page.nodes.length <= 4 ? 1 : 2, processPoints = points.slice(sideCount);
    ctx.fillStyle = PALETTE[0];ctx.globalAlpha = .22;roundRect(ctx,left,top,width*.31,height,28);ctx.fill();
    ctx.strokeStyle = ACCENTS[0];ctx.globalAlpha = .24;ctx.lineWidth = 2;ctx.stroke();
    ctx.fillStyle = PALETTE[1];ctx.globalAlpha = .18;roundRect(ctx,left+width*.37,top,width*.63,height,28);ctx.fill();
    ctx.strokeStyle = ACCENTS[1];ctx.globalAlpha = .2;ctx.stroke();
    if(processPoints.length){
      const spineX=processPoints.reduce((sum,[x])=>sum+x,0)/processPoints.length;
      const minY=Math.min(...processPoints.map(([,y])=>y)),maxY=Math.max(...processPoints.map(([,y])=>y));
      ctx.strokeStyle=ACCENTS[1];ctx.globalAlpha=.22;ctx.lineWidth=4;ctx.setLineDash([6,10]);ctx.lineDashOffset=-t*36;
      ctx.beginPath();ctx.moveTo(spineX,minY);ctx.lineTo(spineX,maxY);ctx.stroke();ctx.setLineDash([]);
      ctx.globalAlpha=.62;ctx.fillStyle=ACCENTS[1];ctx.beginPath();ctx.arc(spineX,minY+(maxY-minY)*pulse,6,0,Math.PI*2);ctx.fill();
    }
  } else if (layout === 'retrieval-loop') {
    ctx.fillStyle=PALETTE[1];ctx.globalAlpha=.18;roundRect(ctx,left,top,width,height*.48,28);ctx.fill();
    ctx.fillStyle=PALETTE[2];ctx.globalAlpha=.2;roundRect(ctx,left+width*.24,top+height*.62,width*.52,height*.34,28);ctx.fill();
    const lower=points.slice(3),memory=lower[Math.floor(lower.length/2)]||[left+width*.5,bottom-30],target=points[1]||[left+width*.5,top+40];
    const feedback=[];for(let index=0;index<=24;index++){const p=index/24,u=1-p;feedback.push([u*u*memory[0]+2*u*p*(left+width*.5)+p*p*target[0],u*u*memory[1]+2*u*p*(top+height*.5)+p*p*target[1]]);}
    ctx.strokeStyle=ACCENTS[2];ctx.globalAlpha=.22;ctx.lineWidth=3;ctx.setLineDash([5,10]);ctx.lineDashOffset=-t*32;
    ctx.beginPath();feedback.forEach(([x,y],index)=>index?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);
    const marker=pointOnPolyline(feedback,t);ctx.globalAlpha=.65;ctx.fillStyle=ACCENTS[2];ctx.beginPath();ctx.arc(marker[0],marker[1],6,0,Math.PI*2);ctx.fill();
  } else if (layout === 'scatter-gather') {
    const workers=points.slice(1,-1),source=points[0],result=points[points.length-1];
    workers.forEach(([x,y],index)=>{ctx.fillStyle=PALETTE[(index+1)%PALETTE.length];ctx.globalAlpha=.2;roundRect(ctx,source[0]+44,y-70,result[0]-source[0]-88,140,24);ctx.fill();});
    ctx.strokeStyle=accent;ctx.globalAlpha=.2;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(source[0],source[1]);ctx.lineTo(result[0],result[1]);ctx.stroke();
    if(workers.length){const active=Math.min(workers.length-1,Math.floor(t*workers.length)%workers.length),worker=workers[active];ctx.globalAlpha=.62;ctx.fillStyle=ACCENTS[active%ACCENTS.length];ctx.beginPath();ctx.arc(worker[0],worker[1],8,0,Math.PI*2);ctx.fill();}
  } else if (layout === 'hourglass') {
    const cx=left+width*.5,cy=top+height*.5,neck=width*.12;
    ctx.strokeStyle=accent;ctx.globalAlpha=.18;ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(left+width*.08,top);ctx.lineTo(cx-neck,cy);ctx.lineTo(left+width*.2,bottom);ctx.moveTo(right-width*.08,top);ctx.lineTo(cx+neck,cy);ctx.lineTo(right-width*.2,bottom);ctx.stroke();
    ctx.globalAlpha=.36;ctx.beginPath();ctx.moveTo(cx-neck,cy);ctx.lineTo(cx+neck,cy);ctx.stroke();
    const scanY=top+height*(.08+.84*pulse),span=Math.abs(scanY-cy)/Math.max(1,height*.5),half=neck+(width*.3)*span;
    ctx.globalAlpha=.2;ctx.setLineDash([4,10]);ctx.beginPath();ctx.moveTo(cx-half,scanY);ctx.lineTo(cx+half,scanY);ctx.stroke();ctx.setLineDash([]);
  } else if (layout === 'spiral') {
    const cx=left+width*.5,cy=top+height*.5,spiral=Array.from({length:61},(_,index)=>{const progress=index/60,radius=1-progress,angle=-Math.PI/2+progress*Math.PI*2*1.15;return[cx+Math.cos(angle)*width*.42*radius,cy+Math.sin(angle)*height*.4*radius];});
    ctx.strokeStyle=accent;ctx.globalAlpha=.2;ctx.lineWidth=3;ctx.setLineDash([6,10]);ctx.lineDashOffset=-t*34;
    ctx.beginPath();spiral.forEach(([x,y],index)=>index?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);
    const marker=pointOnPolyline(spiral,t);ctx.globalAlpha=.65;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(marker[0],marker[1],7,0,Math.PI*2);ctx.fill();
    const last=points[points.length-1];ctx.globalAlpha=.16;ctx.beginPath();ctx.arc(last[0],last[1],34+10*pulse,0,Math.PI*2);ctx.stroke();
  } else if (layout === 'relay-board') {
    const source = points[0], gate = points[points.length - 2], result = points[points.length - 1];
    const routes = points.slice(1, -2);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .16;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(source[0], source[1]);
    ctx.lineTo(result[0], result[1]);
    ctx.stroke();
    routes.forEach(([x, y], index) => {
      ctx.fillStyle = PALETTE[(index + 1) % PALETTE.length];
      ctx.globalAlpha = .22;
      roundRect(ctx, source[0] + 40, y - 72, gate[0] - source[0] - 80, 144, 24);
      ctx.fill();
    });
    const markerX = source[0] + (result[0] - source[0]) * pulse;
    ctx.globalAlpha = .55;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(markerX, source[1], 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (layout === 'parallel-lanes' || layout === 'swimlanes') {
    const rows = [...new Set(points.map(([, y]) => Math.round(y)))].sort((a, b) => a - b);
    rows.forEach((y, index) => {
      ctx.fillStyle = PALETTE[(index + 1) % PALETTE.length];
      ctx.globalAlpha = .24;
      roundRect(ctx, left, y - 112, width, 224, 28);
      ctx.fill();
      ctx.globalAlpha = .22;
      ctx.strokeStyle = ACCENTS[(index + 1) % ACCENTS.length];
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 12]);
      ctx.beginPath();
      ctx.moveTo(left + width * pulse, y - 90);
      ctx.lineTo(left + width * pulse, y + 90);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  } else if (layout === 'funnel') {
    const levels = [...new Set(points.map(([, y]) => Math.round(y)))].sort((a, b) => a - b);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .17;
    ctx.lineWidth = 3;
    levels.forEach((y, index) => {
      const progress = index / Math.max(1, levels.length - 1);
      const half = width * (.43 - progress * .29);
      ctx.beginPath();
      ctx.moveTo(W / 2 - half, y - 78);
      ctx.lineTo(W / 2 + half, y - 78);
      ctx.stroke();
    });
    const lastLevel = levels[levels.length - 1] ?? (top + height * .78);
    const previousLevel = levels[levels.length - 2] ?? (top + height * .58);
    const apertureY = (previousLevel + lastLevel) / 2;
    const apertureHalfWidth = width * (.09 + .025 * pulse);
    ctx.globalAlpha = .24 + .08 * pulse;
    ctx.beginPath();
    ctx.moveTo(W / 2 - apertureHalfWidth, apertureY);
    ctx.lineTo(W / 2 + apertureHalfWidth, apertureY);
    ctx.stroke();
  } else if (layout === 'semantic-map') {
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .11;
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 12]);
    ctx.beginPath();
    ctx.moveTo(left, top + height * .5);
    ctx.lineTo(right, top + height * .5);
    ctx.moveTo(left + width * .5, top);
    ctx.lineTo(left + width * .5, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    points.forEach(([x, y], index) => {
      const ring = 44 + 8 * (.5 + .5 * Math.sin(t * Math.PI * 2 + index));
      ctx.globalAlpha = .035 + .055 * (.5 + .5 * Math.sin(t * Math.PI * 2 + index));
      ctx.fillStyle = ACCENTS[index % ACCENTS.length];
      ctx.beginPath();
      ctx.arc(x, y, ring, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (layout === 'signal-path') {
    const rail = Array.from({length:21}, (_, index) => {
      const progress = index / 20;
      const envelope = Math.sin(progress * Math.PI);
      return [left + width * progress, top + height * .5 + Math.sin(progress * Math.PI * 8) * 26 * envelope];
    });
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .2;
    ctx.lineWidth = 3;
    ctx.beginPath();
    rail.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.stroke();
    const marker = pointOnPolyline(rail, t);
    ctx.globalAlpha = .58;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(marker[0], marker[1], 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (layout === 'timeline') {
    const y = top + height * .5;
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .2;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    const markerX = left + width * pulse;
    ctx.globalAlpha = .5;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(markerX, y, 6, 0, Math.PI * 2);
    ctx.fill();
    points.forEach(([x]) => {
      ctx.globalAlpha = .2;
      ctx.beginPath();
      ctx.moveTo(x, y - 18);
      ctx.lineTo(x, y + 18);
      ctx.stroke();
    });
  } else if (layout === 'cycle' || layout === 'control-loop' || layout === 'constellation' || layout === 'hub-spoke') {
    const cx = points.reduce((sum, [x]) => sum + x, 0) / Math.max(1, points.length);
    const cy = points.reduce((sum, [, y]) => sum + y, 0) / Math.max(1, points.length);
    const radiusX = Math.min(width * .4, 360), radiusY = Math.min(height * .4, 220);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .14;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 12]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    const angle = -Math.PI / 2 + t * Math.PI * 2;
    ctx.globalAlpha = .6;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * radiusX, cy + Math.sin(angle) * radiusY, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (layout === 'matrix') {
    const scanX = left + width * (.08 + .84 * pulse);
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .13;
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 10]);
    ctx.beginPath();
    ctx.moveTo(scanX, top);
    ctx.lineTo(scanX, bottom);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (layout === 'layered-stack' || layout === 'trust-stack') {
    for (let index = 0; index < 4; index += 1) {
      const y = top + (index + 1) * height / 5;
      ctx.strokeStyle = ACCENTS[index % ACCENTS.length];
      ctx.globalAlpha = .12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }
  } else if (layout === 'branching' || layout === 'decision-tree') {
    const active = Math.floor(pulse * Math.max(1, points.length));
    points.slice(0, Math.min(points.length, 4)).forEach(([x, y], index) => {
      ctx.strokeStyle = ACCENTS[index % ACCENTS.length];
      ctx.globalAlpha = index === active ? .42 : .12;
      ctx.lineWidth = index === active ? 4 : 2;
      ctx.beginPath();
      ctx.arc(x, y, 28 + (index === active ? 8 : 0), 0, Math.PI * 2);
      ctx.stroke();
    });
  } else {
    ctx.strokeStyle = accent;
    ctx.globalAlpha = .12;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 14]);
    ctx.beginPath();
    ctx.moveTo(left, bottom - 8);
    ctx.lineTo(right, bottom - 8);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawNode(ctx, node, x, y, index, alpha, compact, phase, typography) {
  const shape=node.shape||'card',w=shape==='pill'?250:(compact?210:250),h=shape==='pill'?112:(compact?170:178),accent=ACCENTS[index%ACCENTS.length];
  const visualName=sharedIcons.resolveIconName(node.visual||node.icon,`${node.label||''} ${node.caption||''}`,index);
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y+(1-alpha)*22);const scale=.9+.1*alpha;ctx.scale(scale,scale);
  const activity=.5+.5*Math.sin(phase*Math.PI*2+index*.7);
  const haloW=shape==='illustration'?220:w,haloH=shape==='illustration'?220:h;
  ctx.globalAlpha=.08+activity*.08;
  ctx.strokeStyle=accent;
  ctx.lineWidth=3;
  roundRect(ctx,-haloW/2-7,-haloH/2-7,haloW+14,haloH+14,shape==='pill'?32:30);
  ctx.stroke();
  ctx.globalAlpha=alpha;
  if(shape==='illustration'){
    roundRect(ctx,-110,-101,220,220,26);ctx.fillStyle=PALETTE[index%PALETTE.length];ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.stroke();
    drawSemanticIcon(ctx,visualName,0,-66,accent,phase,.98,80,64);
    ctx.fillStyle=INK;const title=fittedText(ctx,node.label,192,2,22,15,700),titleY=-27,titleLine=title.size+5;drawLines(ctx,title,0,titleY,titleLine);
    const bodyY=titleY+textBlockHeight(title,titleLine)+9,bodyLines=Math.max(1,Math.floor((88-bodyY)/(typography.bodySize+4)));
    ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,190,bodyLines,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,0,bodyY,body.size+4);ctx.restore();return;
  }
  roundRect(ctx,-w/2,-h/2,w,h,24);ctx.fillStyle=PALETTE[index%PALETTE.length];ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.stroke();
  const ix=shape==='pill'?-w/2+41:0,iy=shape==='pill'?0:-h/2+36,iconScale=shape==='pill'?.64:.82;drawSemanticIcon(ctx,visualName,ix,iy,accent,phase,iconScale,54,54);
  if(shape==='pill'){
    ctx.fillStyle=INK;const title=fittedText(ctx,node.label,w-88,2,20,14,700),titleY=-32,titleLine=title.size+5;drawLines(ctx,title,-w/2+80,titleY,titleLine,'left');
    const bodyY=titleY+textBlockHeight(title,titleLine)+8,bodyLines=Math.max(1,Math.floor((h/2-10-bodyY)/(typography.bodySize+4)));
    ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,w-88,bodyLines,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,-w/2+80,bodyY,body.size+4,'left');ctx.restore();return;
  }
  ctx.fillStyle=INK;const title=fittedText(ctx,node.label,w-34,2,21,15,700),titleY=-h/2+72,titleLine=title.size+5;drawLines(ctx,title,0,titleY,titleLine);
  const bodyY=titleY+textBlockHeight(title,titleLine)+8,bodyLines=Math.max(1,Math.floor((h/2-12-bodyY)/(typography.bodySize+4)));
  ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,w-38,bodyLines,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,0,bodyY,body.size+4);
  ctx.restore();
}

function drawPage(ctx, page, direction, pageIndex, total, frame) {
  const t=frame/(FPS*DURATION);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(68,86,130,.055)';ctx.lineWidth=1;for(let y=18;y<H;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.fillStyle=INK;
  const wide=page.format==='wide',titleX=wide?55:48,titleY=wide?22:24,titleLineGap=7;
  const title=fittedText(ctx,page.title,W-(wide?110:96),2,40,30,700),titleLine=title.size+titleLineGap;drawLines(ctx,title,titleX,titleY,titleLine,'left');
  const titleBottom=titleY+textBlockHeight(title,titleLine),headlineY=Math.max(wide?116:132,titleBottom+(wide?28:26));
  ctx.fillStyle='#4053a0';const headline=fittedText(ctx,page.headline,W-(wide?170:130),2,26,19,700),headlineLine=headline.size+6;drawLines(ctx,headline,W/2,headlineY,headlineLine);
  const headlineBottom=headlineY+textBlockHeight(headline,headlineLine),content=layoutFrame(page,headlineBottom),compact=page.format==='wide'?page.nodes.length>5:page.nodes.length>4;
  const layout=page.layout==='semantic-map'?semanticLayout(page,compact,content):fixedLayout(page,compact,content);
  const pts=layout.pts,map=new Map(page.nodes.map((n,i)=>[n.id,{point:pts[i],node:n}])),typography=sharedBodyTypography(ctx,page.nodes,compact);
  drawLayoutBackdrop(ctx,page,pts,content,t);
  const groups=groupGeometries(ctx,page.groups,map,compact,content);drawGroups(ctx,groups);
  const edges=page.edges||[],showEdgeLabels=page.nodes.length<5||LABEL_RICH_LAYOUTS.has(page.layout),groupStyles=new Map();
  const defaultFlowGroup=(page.layout==='linear-flow'||page.layout==='staged-flow')?'main-flow':null;
  for(const edge of edges){const key=edge.edgeGroup||defaultFlowGroup;if(key&&!groupStyles.has(key)){const color=EDGE_GROUP_COLORS[groupStyles.size%EDGE_GROUP_COLORS.length];groupStyles.set(key,{color,dash:[8,7],lineWidth:2.7});}}
  const edgeSpecs=edges.map((e,i)=>{const groupKey=e.edgeGroup||defaultFlowGroup,pathStyle=e.pathStyle||(page.layout==='branching'?'curve':'straight'),bend=e.bend??(page.layout==='branching'?(i%2?.2:-.2):.24);return {label:showEdgeLabels?e.label:'',priority:e.labelPriority||'optional',relation:e.relation,endShape:e.endShape||'auto',groupStyle:groupKey?groupStyles.get(groupKey):null,points:edgePath(map.get(e.from),map.get(e.to),compact,(e.via||[]).map(layout.point),pathStyle,bend),phase:edgeProgress(t,i,Math.max(edges.length,page.nodes.length))};});
  edgeSpecs.forEach(spec=>drawArrow(ctx,spec.points,spec.phase,spec.relation,spec.groupStyle,spec.endShape));
  const nodeObstacles=page.nodes.map((n,i)=>{const b=nodeBounds(n,compact),[x,y]=pts[i];return {left:x-b.halfW-5,right:x+b.halfW+5,top:y-b.halfH-5,bottom:y+b.halfH+5};});
  const groupBorderObstacles=groups.flatMap(g=>[
    {left:g.left-4,right:g.left+4,top:g.top,bottom:g.bottom},
    {left:g.right-4,right:g.right+4,top:g.top,bottom:g.bottom},
    {left:g.left,right:g.right,top:g.top-4,bottom:g.top+4},
    {left:g.left,right:g.right,top:g.bottom-4,bottom:g.bottom+4}
  ]);
  const edgeLabels=placeEdgeLabels(ctx,edgeSpecs,[...nodeObstacles,...groups.map(g=>g.labelRect),...groupBorderObstacles],layout.labelFrame);
  page.nodes.forEach((n,i)=>drawNode(ctx,n,...pts[i],i,nodeProgress(t,i,page.nodes.length),compact,(t+i/page.nodes.length)%1,typography));
  drawEdgeLabels(ctx,edgeLabels);
}

function renderGif(page, direction, index, total, outPath) {
  [W,H]=page.format==='wide'?[1600,900]:[1000,1000];
  const canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),gif=new GIFEncoder(W,H);gif.start();gif.setRepeat(0);gif.setDelay(1000/FPS);gif.setQuality(15);
  for(let f=0;f<FPS*DURATION;f++){drawPage(ctx,page,direction,index,total,f);gif.addFrame(ctx);}gif.finish();fs.writeFileSync(outPath,gif.out.getData());
}

function cleanStaleGifs(outDir, outputs) {
  const keep = new Set(outputs);
  for (const fileName of fs.readdirSync(outDir)) {
    if (fileName.endsWith('.gif') && !keep.has(fileName)) fs.unlinkSync(path.join(outDir, fileName));
  }
}

function defaultOutputName(page, index, total) {
  return total===1?'01-article-summary.gif':`${String(index+1).padStart(2,'0')}-${slug(page.section)}.gif`;
}

function outputName(page, index, total) {
  return page.outputFile || defaultOutputName(page, index, total);
}

function main() {
  const args=parseArgs(process.argv.slice(2));if(args.help||!args.input){usage();process.exit(args.help?0:1);}
  const abs=path.resolve(args.input),outDir=path.resolve(args.outDir),raw=fs.readFileSync(abs,'utf8');
  if(path.extname(abs).toLowerCase()!=='.json')throw new Error('Pipeline 2 requires an agent-authored storyboard.json input.');
  const storyboard=sanitizeStoryboardText(JSON.parse(raw));validateStoryboard(storyboard);
  const pageIndexes=storyboard.pages.map((_,index)=>index);
  if (args.page !== undefined) {
    if (!Number.isInteger(args.page) || args.page < 1 || args.page > storyboard.pages.length) throw new Error(`--page must be between 1 and ${storyboard.pages.length}`);
    pageIndexes.splice(0,pageIndexes.length,args.page-1);
  }
  fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'storyboard.json'),JSON.stringify(storyboard,null,2));
  const direction=storyboard.visualDirection||{character:'article guide',recurringMetaphor:'article concepts as a readable map'};
  const expectedOutputs=storyboard.pages.map((page,index)=>outputName(page,index,storyboard.pages.length));
  pageIndexes.forEach(i=>{const page=storyboard.pages[i],name=expectedOutputs[i];renderGif(page,direction,i,storyboard.pages.length,path.join(outDir,name));console.log(`Rendered ${name}`);});
  if(args.page===undefined)cleanStaleGifs(outDir,expectedOutputs);
  const outputs=args.page===undefined?expectedOutputs:expectedOutputs.filter(name=>fs.existsSync(path.join(outDir,name)));
  fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify({
    pipeline:'ai-gif-pipeline-2',
    source:path.basename(abs),
    assetSlug:assetSlugFromOutputDir(outDir),
    title:storyboard.title,
    version:storyboard.version,
    outputs:{
      storyboard:'storyboard.json',
      gifs:outputs
    },
    pages:outputs
  },null,2));console.log(`Done: rendered ${pageIndexes.length} GIF(s); manifest tracks ${outputs.length} GIF(s) in ${outDir}`);
}

if (require.main === module) main();

module.exports = { LAYOUTS, EDGE_END_SHAPES };
