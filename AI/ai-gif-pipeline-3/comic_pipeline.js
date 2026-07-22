const { createCanvas } = require('@napi-rs/canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');
const sharedIcons = require('../shared/semantic-icons.cjs');

let W = 1000, H = 1000;
const FPS = 20, DURATION = 2;
const BG = '#fffdf8', INK = '#30324d', MUTED = '#686c80';
const PALETTE = ['#dff4ee', '#e5eafe', '#f7e5f1', '#fff0cf', '#e5f5dc'];
const ACCENTS = ['#259d8f', '#557bd8', '#ad67a7', '#e99b1c', '#69a34f'];
const LAYOUTS = new Set(['linear-flow', 'staged-flow', 'branching', 'before-after', 'cycle', 'hub-spoke', 'cause-effect', 'timeline', 'semantic-map']);
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
function sentences(text) { return String(text).replace(/\s+/g, ' ').trim().split(/(?<=[。！？.!?])\s*/).filter(Boolean); }
function short(text, limit) { const s = String(text || '').trim(); return s.length <= limit ? s : s.slice(0, limit - 1).replace(/[\s，。,.!?；;：:]+$/, '') + '…'; }
function matchCase(replacement, sample) { if (sample === sample.toUpperCase()) return replacement.toUpperCase(); if (sample[0] === sample[0].toUpperCase()) return replacement.replace(/\b[a-z]/g, c => c.toUpperCase()); return replacement; }
const NON_VISUAL_SECTION_RE = /^(?:references?|bibliography|sources?|further reading|footnotes?|appendix|acknowledg(?:e)?ments?|table of contents|contents|external links|citation notes|source notes?|notes?|related links|metadata|front\s*matter|seo|changelog|revision history|about the author|author note|disclaimer|read more|see also|share|subscribe|newsletter|comments?)$/i;
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
function isNonVisualSectionHeading(heading) {
  return NON_VISUAL_SECTION_RE.test(String(heading || '').replace(/[:：]+$/g, '').trim());
}
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
  for (const page of storyboard.pages || []) {
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

function parseMarkdown(raw) {
  const lines = raw.replace(/\r/g, '').split('\n');
  let title = 'Untitled Article', heading = 'Overview', paragraphs = [], pages = [];
  const flush = () => {
    if (!paragraphs.length) return;
    if (isNonVisualSectionHeading(heading)) { paragraphs = []; return; }
    const units = paragraphs.flatMap(p => sentences(p)).filter(Boolean);
    for (let i = 0; i < units.length; i += 4) {
      const group = units.slice(i, i + 4);
      pages.push({
        title: heading,
        section: slug(heading),
        pageLabel: String(Math.floor(i / 4) + 1),
        layout: 'linear-flow',
        headline: short(`${heading}: ${group[0] || ''}`, 54),
        nodes: group.map((body, j) => ({ id: `n${j + 1}`, type: j === 0 ? 'input' : j === group.length - 1 ? 'result' : 'process', label: short(body, 24), caption: short(body, 64), visual: sharedIcons.semanticIconFor(`${heading} ${body}`, j), shape: j === 0 || j === group.length - 1 ? 'illustration' : 'card' })),
        edges: group.slice(1).map((_, j) => ({ from: `n${j + 1}`, to: `n${j + 2}`, label: '' }))
      });
    }
    paragraphs = [];
  };
  for (const line of lines) {
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      if (h[1].length === 1 && title === 'Untitled Article') title = h[2].trim();
      else { flush(); heading = h[2].trim(); }
    } else if (line.trim()) paragraphs.push(line.replace(/^[-*]\s+/, '').trim());
  }
  flush();
  return { version: 2, style: 'pastel-handdrawn', title, visualDirection: { character: 'article guide', recurringMetaphor: 'article concepts as a readable map' }, pages };
}

function normalizeStoryboard(sb) {
  if (sb.version === 2) return sb;
  return {
    version: 2, style: sb.style || 'pastel-handdrawn', title: sb.title,
    visualDirection: { character: 'article guide', recurringMetaphor: 'article concepts as a readable map' },
    pages: sb.pages.map((page, pageIndex) => ({
      title: page.title, section: page.section, pageLabel: page.pageLabel || String(pageIndex + 1),
      layout: 'linear-flow', headline: page.title,
      nodes: page.cards.map((card, i) => ({ id: `n${i + 1}`, type: i === 0 ? 'input' : i === page.cards.length - 1 ? 'result' : 'process', label: card.title, caption: card.body, visual: sharedIcons.resolveIconName(card.icon, `${card.title || ''} ${card.body || ''}`, i), shape: 'card' })),
      edges: page.cards.slice(1).map((_, i) => ({ from: `n${i + 1}`, to: `n${i + 2}`, label: '' }))
    }))
  };
}

function validateStoryboard(sb) {
  if (!sb || sb.version !== 2 || !Array.isArray(sb.pages) || !sb.pages.length) throw new Error('storyboard v2 requires non-empty pages');
  sb.pages.forEach((p, i) => {
    if (!p.title || !p.section || !LAYOUTS.has(p.layout)) throw new Error(`page ${i + 1}: invalid title, section, or layout`);
    if (p.format === 'wide' && p.layout !== 'semantic-map') throw new Error(`page ${i + 1}: wide format requires semantic-map`);
    if (!Array.isArray(p.nodes) || p.nodes.length < 2 || p.nodes.length > 6) throw new Error(`page ${i + 1}: nodes must contain 2-6 items`);
    const ids = new Set(p.nodes.map(n => n.id));
    if (ids.size !== p.nodes.length) throw new Error(`page ${i + 1}: node ids must be unique`);
    for (const e of p.edges || []) if (!ids.has(e.from) || !ids.has(e.to)) throw new Error(`page ${i + 1}: edge references unknown node`);
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
    ctx.font = `${weight} ${size}px "Comic Sans MS","Microsoft YaHei","Segoe UI",sans-serif`;
    const result = wrapLines(ctx, text, width, maxLines);
    if (!result.overflow) return { ...result, size };
  }
  ctx.font = `${weight} ${minSize}px "Comic Sans MS","Microsoft YaHei","Segoe UI",sans-serif`;
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

function positions(layout, count) {
  const cx = 500, cy = 570;
  if (layout === 'staged-flow') {
    if (count === 3) return [[180,390],[500,735],[820,390]];
    if (count === 4) return [[230,390],[770,390],[770,735],[230,735]];
    if (count === 5) return [[160,380],[500,380],[840,380],[680,740],[320,740]];
    if (count === 6) return [[160,380],[500,380],[840,380],[840,740],[500,740],[160,740]];
  }
  if (layout === 'before-after') return count === 2 ? [[255,560],[745,560]] : Array.from({length:count},(_,i)=>[190+i*(620/(count-1)),560]);
  if (layout === 'cycle') return Array.from({length:count},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/count;return [cx+300*Math.cos(a),cy+230*Math.sin(a)];});
  if (layout === 'hub-spoke') return [[cx,cy],...Array.from({length:count-1},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/(count-1);return [cx+310*Math.cos(a),cy+230*Math.sin(a)];})];
  if (layout === 'branching') return count <= 3 ? [[500,400],...[...Array(count-1)].map((_,i)=>[270+i*(460/Math.max(1,count-2)),650])] : [[500,390],...Array.from({length:count-1},(_,i)=>[170+i*(660/(count-2)),650])];
  if (layout === 'cause-effect') { const left=Math.ceil(count/2); return Array.from({length:count},(_,i)=>i<left?[240,430+i*190]:[760,460+(i-left)*210]); }
  if (layout === 'timeline') return Array.from({length:count},(_,i)=>[110+i*(780/(count-1)),568+(i%2?167:-168)]);
  return Array.from({length:count},(_,i)=>[145+i*(710/(count-1)),560]);
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
function nodeProgress() { return 1; }

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
    const fits=nodes.every(node=>{const m=nodeBodyMetrics(node,compact);ctx.font=`400 ${size}px "Comic Sans MS","Microsoft YaHei","Segoe UI",sans-serif`;return !wrapLines(ctx,node.caption,m.width,m.maxLines).overflow;});
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

function drawArrow(ctx, points, phase, relation='flow', groupStyle=null) {
  const styles={flow:{color:'#505365',dash:[8,7]},supervision:{color:'#8057d9',dash:[3,6]},evidence:{color:'#357a61',dash:[8,7]},contrast:{color:'#cf5c62',dash:[12,6]},constraint:{color:'#cf8b1e',dash:[2,5]}},style=styles[relation]||styles.flow,cycle=style.dash[0]+style.dash[1];
  const resolved=groupStyle||style,resolvedCycle=resolved.dash[0]+resolved.dash[1];
  ctx.save();ctx.strokeStyle=resolved.color;ctx.fillStyle=resolved.color;ctx.lineWidth=resolved.lineWidth||(relation==='supervision'?3:2.5);ctx.lineCap='round';ctx.setLineDash(resolved.dash);ctx.lineDashOffset=-phase*resolvedCycle*4;
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.setLineDash([]);
  const [px,py]=points[points.length-2],[ex,ey]=points[points.length-1],ang=Math.atan2(ey-py,ex-px);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-14*Math.cos(ang-.5),ey-14*Math.sin(ang-.5));ctx.lineTo(ex-14*Math.cos(ang+.5),ey-14*Math.sin(ang+.5));ctx.closePath();ctx.fill();
  ctx.restore();
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
    let labelSize=17;ctx.font=`700 ${labelSize}px "Microsoft YaHei","Segoe UI",sans-serif`;let labelWidth=ctx.measureText(group.label).width;
    const neededWidth=labelWidth+36,currentWidth=right-left;
    if(currentWidth<neededWidth){const grow=(neededWidth-currentWidth)/2;left-=grow;right+=grow;if(left<limits.left){right+=limits.left-left;left=limits.left;}if(right>limits.right){left-=right-limits.right;right=limits.right;}left=Math.max(limits.left,left);}
    while(labelSize>12&&labelWidth>right-left-36){labelSize--;ctx.font=`700 ${labelSize}px "Microsoft YaHei","Segoe UI",sans-serif`;labelWidth=ctx.measureText(group.label).width;}
    const labelX=group.labelAlign==='right'?right-18:left+18,labelTop=top+20-labelSize/2-5,labelBottom=top+20+labelSize/2+5;
    result.push({group,left,top,right,bottom,labelX,labelSize,labelRect:{left:group.labelAlign==='right'?labelX-labelWidth-5:labelX-5,right:group.labelAlign==='right'?labelX+5:labelX+labelWidth+5,top:labelTop,bottom:labelBottom}});
  }
  ctx.restore();return result;
}

function drawGroups(ctx, geometries) {
  for(const g of geometries){const {group,left,top,right,bottom,labelX,labelSize}=g;
    roundRect(ctx,left,top,right-left,bottom-top,28);ctx.fillStyle=GROUP_COLORS[group.color]||GROUP_COLORS.blue;ctx.fill();ctx.strokeStyle=GROUP_STROKES[group.color]||GROUP_STROKES.blue;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=GROUP_STROKES[group.color]||GROUP_STROKES.blue;ctx.font=`700 ${labelSize}px "Microsoft YaHei","Segoe UI",sans-serif`;ctx.textAlign=group.labelAlign==='right'?'right':'left';ctx.textBaseline='middle';ctx.fillText(group.label,labelX,top+20);
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
    const labelSize=spec.label.length>15?12:spec.label.length>11?13:15;ctx.font=`600 ${labelSize}px "Microsoft YaHei","Segoe UI",sans-serif`;
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
  for(const label of labels){ctx.font=`600 ${label.labelSize}px "Microsoft YaHei","Segoe UI",sans-serif`;ctx.fillText(label.label,label.x,label.y);}
  ctx.restore();
}

function drawNode(ctx, node, x, y, index, alpha, compact, phase, typography) {
  const shape=node.shape||'card',w=shape==='pill'?250:(compact?210:250),h=shape==='pill'?112:(compact?170:178),accent=ACCENTS[index%ACCENTS.length];
  const visualName=sharedIcons.resolveIconName(node.visual||node.icon,`${node.label||''} ${node.caption||''}`,index);
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y+(1-alpha)*22);const scale=.9+.1*alpha;ctx.scale(scale,scale);
  if(shape==='illustration'){
    roundRect(ctx,-110,-101,220,220,26);ctx.fillStyle=PALETTE[index%PALETTE.length];ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.stroke();
    drawSemanticIcon(ctx,visualName,0,-66,accent,phase,.98,80,64);
    ctx.fillStyle=INK;const title=fittedText(ctx,node.label,192,2,22,15,700),titleY=-27,titleLine=title.size+5;drawLines(ctx,title,0,titleY,titleLine);
    ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,190,3,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,0,titleY+textBlockHeight(title,titleLine)+9,body.size+4);ctx.restore();return;
  }
  roundRect(ctx,-w/2,-h/2,w,h,24);ctx.fillStyle=PALETTE[index%PALETTE.length];ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.stroke();
  const ix=shape==='pill'?-w/2+41:0,iy=shape==='pill'?0:-h/2+36,iconScale=shape==='pill'?.64:.82;drawSemanticIcon(ctx,visualName,ix,iy,accent,phase,iconScale,54,54);
  if(shape==='pill'){
    ctx.fillStyle=INK;const title=fittedText(ctx,node.label,w-88,2,20,14,700),titleY=-32,titleLine=title.size+5;drawLines(ctx,title,-w/2+80,titleY,titleLine,'left');
    ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,w-88,2,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,-w/2+80,titleY+textBlockHeight(title,titleLine)+8,body.size+4,'left');ctx.restore();return;
  }
  ctx.fillStyle=INK;const title=fittedText(ctx,node.label,w-34,2,21,15,700),titleY=-h/2+72,titleLine=title.size+5;drawLines(ctx,title,0,titleY,titleLine);
  ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,w-38,3,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,0,titleY+textBlockHeight(title,titleLine)+8,body.size+4);
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
  const headlineBottom=headlineY+textBlockHeight(headline,headlineLine),content=layoutFrame(page,headlineBottom),compact=page.format==='wide'?false:page.nodes.length>4;
  const layout=page.layout==='semantic-map'?semanticLayout(page,compact,content):{pts:positions(page.layout,page.nodes.length),point:p=>[p.x*W,p.y*H],labelFrame:{left:content.left+8,right:content.right-8,top:content.top+2,bottom:content.bottom-8}};
  const pts=layout.pts,map=new Map(page.nodes.map((n,i)=>[n.id,{point:pts[i],node:n}])),typography=sharedBodyTypography(ctx,page.nodes,compact);
  const groups=groupGeometries(ctx,page.groups,map,compact,content);drawGroups(ctx,groups);
  const edges=page.edges||[],showEdgeLabels=page.nodes.length<5||page.layout==='semantic-map'||page.layout==='staged-flow',groupStyles=new Map();
  const defaultFlowGroup=(page.layout==='linear-flow'||page.layout==='staged-flow')?'main-flow':null;
  for(const edge of edges){const key=edge.edgeGroup||defaultFlowGroup;if(key&&!groupStyles.has(key)){const color=EDGE_GROUP_COLORS[groupStyles.size%EDGE_GROUP_COLORS.length];groupStyles.set(key,{color,dash:[8,7],lineWidth:2.7});}}
  const edgeSpecs=edges.map((e,i)=>{const groupKey=e.edgeGroup||defaultFlowGroup,pathStyle=e.pathStyle||(page.layout==='branching'?'curve':'straight'),bend=e.bend??(page.layout==='branching'?(i%2?.2:-.2):.24);return {label:showEdgeLabels?e.label:'',priority:e.labelPriority||'optional',relation:e.relation,groupStyle:groupKey?groupStyles.get(groupKey):null,points:edgePath(map.get(e.from),map.get(e.to),compact,(e.via||[]).map(layout.point),pathStyle,bend),phase:edgeProgress(t,i,Math.max(edges.length,page.nodes.length))};});
  edgeSpecs.forEach(spec=>drawArrow(ctx,spec.points,spec.phase,spec.relation,spec.groupStyle));
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

function main() {
  const args=parseArgs(process.argv.slice(2));if(args.help||!args.input){usage();process.exit(args.help?0:1);}
  const abs=path.resolve(args.input),outDir=path.resolve(args.outDir),raw=fs.readFileSync(abs,'utf8');let storyboard=path.extname(abs).toLowerCase()==='.json'?JSON.parse(raw):parseMarkdown(raw);
  storyboard=sanitizeStoryboardText(normalizeStoryboard(storyboard));validateStoryboard(storyboard);
  if (args.page !== undefined) {
    if (!Number.isInteger(args.page) || args.page < 1 || args.page > storyboard.pages.length) throw new Error(`--page must be between 1 and ${storyboard.pages.length}`);
    storyboard.pages = [storyboard.pages[args.page - 1]];
  }
  fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'storyboard.json'),JSON.stringify(storyboard,null,2));
  const direction=storyboard.visualDirection||{character:'article guide',recurringMetaphor:'article concepts as a readable map'},outputs=[];
  storyboard.pages.forEach((page,i)=>{const name=storyboard.pages.length===1?'01-article-summary.gif':`${String(i+1).padStart(2,'0')}-${slug(page.section)}.gif`;renderGif(page,direction,i,storyboard.pages.length,path.join(outDir,name));outputs.push(name);console.log(`Rendered ${name}`);});
  cleanStaleGifs(outDir, outputs);
  fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify({
    pipeline:'ai-gif-pipeline-3',
    source:path.basename(abs),
    assetSlug:assetSlugFromOutputDir(outDir),
    title:storyboard.title,
    version:storyboard.version,
    outputs:{
      storyboard:'storyboard.json',
      gifs:outputs
    },
    pages:outputs
  },null,2));console.log(`Done: ${outputs.length} GIF(s) in ${outDir}`);
}

main();
