const { createCanvas } = require('@napi-rs/canvas');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');

let W = 1000, H = 1000;
const FPS = 20, DURATION = 2;
const BG = '#fffdf8', INK = '#30324d', MUTED = '#686c80';
const PALETTE = ['#dff4ee', '#e5eafe', '#f7e5f1', '#fff0cf', '#e5f5dc'];
const ACCENTS = ['#259d8f', '#557bd8', '#ad67a7', '#e99b1c', '#69a34f'];
const VISUAL_COLORS = {
  person:'#6f4bd8', 'chat-bubbles':'#248fc4', agent:'#7354c7', document:'#1769c2', database:'#7354c7',
  search:'#2d76d6', merge:'#35a65b', schema:'#ef9c18', graph:'#6f58c9', link:'#ed9f12', clock:'#ee6688',
  alert:'#df2f35', idea:'#e7a817', gear:'#5d963f', waveform:'#2f9f9a', microphone:'#7656c8',
  headphones:'#477bd1', music:'#d85f91', globe:'#3c9b78', shield:'#4d8d68', layers:'#e2962d', mask:'#6f67bc'
};
const LAYOUTS = new Set(['linear-flow', 'staged-flow', 'branching', 'before-after', 'cycle', 'hub-spoke', 'cause-effect', 'timeline', 'semantic-map']);
const EDGE_GROUP_COLORS = ['#505365','#397c72','#6858b5','#b87918','#b84f63'];
const GROUP_COLORS = {teal:'rgba(37,157,143,.07)',blue:'rgba(85,123,216,.07)',purple:'rgba(173,103,167,.07)',orange:'rgba(233,155,28,.07)',green:'rgba(105,163,79,.07)'};
const GROUP_STROKES = {teal:'#62afa5',blue:'#829ce0',purple:'#bf8aba',orange:'#ebb256',green:'#8db879'};

function usage() { console.log('Usage: node comic_pipeline.js <article.md|storyboard.json> [output-dir]'); }
function slug(s) { return String(s || 'article').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'article'; }
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function sentences(text) { return String(text).replace(/\s+/g, ' ').trim().split(/(?<=[。！？.!?])\s*/).filter(Boolean); }
function short(text, limit) { const s = String(text || '').trim(); return s.length <= limit ? s : s.slice(0, limit - 1).replace(/[\s，。,.!?；;：:]+$/, '') + '…'; }

function parseMarkdown(raw) {
  const lines = raw.replace(/\r/g, '').split('\n');
  let title = 'Untitled Article', heading = 'Overview', paragraphs = [], pages = [];
  const flush = () => {
    if (!paragraphs.length) return;
    const units = paragraphs.flatMap(p => sentences(p)).filter(Boolean);
    for (let i = 0; i < units.length; i += 4) {
      const group = units.slice(i, i + 4);
      pages.push({
        title: heading,
        section: slug(heading),
        pageLabel: String(Math.floor(i / 4) + 1),
        layout: 'linear-flow',
        headline: short(`${heading}：${group[0] || ''}`, 54),
        nodes: group.map((body, j) => ({ id: `n${j + 1}`, type: j === 0 ? 'input' : j === group.length - 1 ? 'result' : 'process', label: short(body, 24), caption: short(body, 64), visual: ['document', 'idea', 'schema', 'graph'][j % 4], shape: j === 0 || j === group.length - 1 ? 'illustration' : 'card' })),
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
  return { version: 2, style: 'pastel-handdrawn', title, visualDirection: { character: 'friendly guide', recurringMetaphor: 'ideas becoming structure' }, pages };
}

function normalizeStoryboard(sb) {
  if (sb.version === 2) return sb;
  return {
    version: 2, style: sb.style || 'pastel-handdrawn', title: sb.title,
    visualDirection: { character: 'friendly guide', recurringMetaphor: 'ideas becoming structure' },
    pages: sb.pages.map((page, pageIndex) => ({
      title: page.title, section: page.section, pageLabel: page.pageLabel || String(pageIndex + 1),
      layout: 'linear-flow', headline: page.title,
      nodes: page.cards.map((card, i) => ({ id: `n${i + 1}`, type: i === 0 ? 'input' : i === page.cards.length - 1 ? 'result' : 'process', label: card.title, caption: card.body, visual: ({chat:'chat-bubbles',brain:'agent',schema:'schema',graph:'graph'})[card.icon] || 'idea', shape: 'card' })),
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

function icon(ctx, name, x, y, color, phase = 0) {
  const a=phase*Math.PI*2,pulse=(Math.sin(a)+1)/2,wave=(1-Math.cos(a))/2;
  const semanticColor=VISUAL_COLORS[name]||color,lively=new Set(['person','chat-bubbles','agent','graph','idea','gear']),breath=lively.has(name)?.045:.015;
  ctx.save();ctx.translate(x,y);ctx.scale(1+breath*Math.sin(a),1+breath*Math.sin(a));x=0;y=0;
  ctx.strokeStyle=semanticColor;ctx.fillStyle=semanticColor;ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';
  if(name==='person'){
    ctx.beginPath();ctx.arc(x,y-12,11,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(x,y+18,22,Math.PI,0);ctx.stroke();
    const blink=Math.abs(Math.sin(a*2))>.94?1:4;ctx.beginPath();ctx.moveTo(x-5,y-13);ctx.lineTo(x-1,y-13+blink);ctx.moveTo(x+5,y-13);ctx.lineTo(x+1,y-13+blink);ctx.stroke();
  } else if(name==='chat-bubbles'){
    const bob=Math.sin(a)*3;roundRect(ctx,x-28,y-20-bob,38,28,11);ctx.stroke();roundRect(ctx,x-7,y-5+bob,38,28,11);ctx.stroke();
    [-1,0,1].forEach((d,i)=>{ctx.globalAlpha=.25+.75*(.5+.5*Math.sin(a-i*Math.PI*2/3));ctx.beginPath();ctx.arc(x+6+d*7,y+9+bob,2.5,0,Math.PI*2);ctx.fill();});
  } else if(name==='agent'){
    const colors=['#20bf8f','#45a8d8','#7561d8','#b56cc2','#4ec7a0','#6b86e8'];for(const[dx,dy,i]of[[-11,-8,0],[2,-12,1],[13,-6,2],[-14,5,3],[-3,9,4],[10,7,5]]){ctx.strokeStyle=colors[i];ctx.beginPath();ctx.arc(x+dx,y+dy,9+2*Math.sin(a+i),0,Math.PI*2);ctx.stroke();}
    ctx.strokeStyle=semanticColor;ctx.fillStyle='#fff';roundRect(ctx,x-10,y-9,20,18,3);ctx.fill();ctx.stroke();ctx.fillStyle=semanticColor;ctx.font='700 10px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('AI',x,y);
  } else if(name==='document'){
    ctx.beginPath();ctx.moveTo(x-19,y-26);ctx.lineTo(x+10,y-26);ctx.lineTo(x+21,y-15);ctx.lineTo(x+21,y+26);ctx.lineTo(x-19,y+26);ctx.closePath();ctx.stroke();
    [-8,2,12].forEach((dy,i)=>{const reveal=clamp(wave*4-i,0,1);ctx.beginPath();ctx.moveTo(x-10,y+dy);ctx.lineTo(x-10+22*reveal,y+dy);ctx.stroke();});
  } else if(name==='database'){
    [-17,0,17].forEach((dy,i)=>{ctx.globalAlpha=.35+.65*(.5+.5*Math.sin(a-i*Math.PI*2/3));ctx.beginPath();ctx.ellipse(x,y+dy,24,9,0,0,Math.PI*2);ctx.stroke();});ctx.globalAlpha=1;ctx.beginPath();ctx.moveTo(x-24,y-17);ctx.lineTo(x-24,y+17);ctx.moveTo(x+24,y-17);ctx.lineTo(x+24,y+17);ctx.stroke();
  } else if(name==='search'){
    const ox=Math.sin(a)*5,oy=Math.cos(a)*4;ctx.beginPath();ctx.arc(x-5+ox,y-5+oy,17,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x+8+ox,y+8+oy);ctx.lineTo(x+25+ox,y+25+oy);ctx.stroke();
  } else if(name==='merge'){
    ctx.beginPath();ctx.moveTo(x-22,y-20);ctx.quadraticCurveTo(x-20,y+5,x,y+5);ctx.quadraticCurveTo(x+20,y+5,x+22,y+22);ctx.moveTo(x+22,y-20);ctx.quadraticCurveTo(x+20,y+5,x,y+5);ctx.stroke();
    const d=18*(1-wave);[-1,1].forEach(side=>{ctx.beginPath();ctx.arc(x+side*d,y-12+wave*17,4,0,Math.PI*2);ctx.fill();});
  } else if(name==='schema'){
    const colors=['#249d8c','#e79b17','#557bd8'];[-15,0,15].forEach((dy,i)=>{ctx.strokeStyle=colors[i];ctx.globalAlpha=.35+.65*(.5+.5*Math.sin(a-i*Math.PI*2/3));roundRect(ctx,x-23,y+dy-5,46,10,5);ctx.stroke();});
  } else if(name==='link'){
    const d=3*Math.sin(a);ctx.beginPath();ctx.arc(x-11+d,y,15,-1.1,1.1);ctx.arc(x+11-d,y,15,2.05,4.25);ctx.stroke();
  } else if(name==='clock'){
    ctx.beginPath();ctx.arc(x,y,24,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+15*Math.sin(a),y-15*Math.cos(a));ctx.moveTo(x,y);ctx.lineTo(x+11*Math.sin(a/12),y-11*Math.cos(a/12));ctx.stroke();
  } else if(name==='alert'){
    ctx.strokeStyle='#df2f35';ctx.fillStyle='#df2f35';
    ctx.globalAlpha=.55+.45*pulse;ctx.beginPath();ctx.moveTo(x,y-27);ctx.lineTo(x+25,y+22);ctx.lineTo(x-25,y+22);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-11);ctx.lineTo(x,y+8);ctx.stroke();ctx.beginPath();ctx.arc(x,y+16,2,0,Math.PI*2);ctx.fill();
  } else if(name==='idea'){
    ctx.beginPath();ctx.arc(x,y-6,20,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x-8,y+15);ctx.lineTo(x-6,y+27);ctx.lineTo(x+7,y+27);ctx.lineTo(x+9,y+15);ctx.stroke();
    for(let i=0;i<6;i++){const q=a+i*Math.PI/3,r=29+4*pulse;ctx.globalAlpha=.3+.7*((phase+i/6)%1);ctx.beginPath();ctx.moveTo(x+Math.cos(q)*r,y-6+Math.sin(q)*r);ctx.lineTo(x+Math.cos(q)*(r+6),y-6+Math.sin(q)*(r+6));ctx.stroke();}
  } else if(name==='waveform'){
    ctx.beginPath();for(let i=-22;i<=22;i+=4){const amp=5+13*(.5+.5*Math.sin(a+i*.35));const yy=Math.sin(i*.45+a)*amp;i===-22?ctx.moveTo(x+i,y+yy):ctx.lineTo(x+i,y+yy);}ctx.stroke();
  } else if(name==='microphone'){
    ctx.beginPath();ctx.roundRect(x-10,y-24,20,35,10);ctx.stroke();ctx.beginPath();ctx.arc(x,y-2,20,0,Math.PI);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y+18);ctx.lineTo(x,y+27);ctx.moveTo(x-10,y+27);ctx.lineTo(x+10,y+27);ctx.stroke();
  } else if(name==='headphones'){
    const bob=Math.sin(a)*2;ctx.beginPath();ctx.arc(x,y+bob,23,Math.PI,0);ctx.stroke();roundRect(ctx,x-27,y-2+bob,10,24,5);ctx.stroke();roundRect(ctx,x+17,y-2+bob,10,24,5);ctx.stroke();
  } else if(name==='music'){
    const bob=Math.sin(a)*3;ctx.beginPath();ctx.moveTo(x-5,y-20+bob);ctx.lineTo(x-5,y+13+bob);ctx.lineTo(x+18,y+7+bob);ctx.lineTo(x+18,y-25+bob);ctx.lineTo(x-5,y-18+bob);ctx.stroke();ctx.beginPath();ctx.arc(x-12,y+16+bob,8,0,Math.PI*2);ctx.arc(x+11,y+10+bob,8,0,Math.PI*2);ctx.fill();
  } else if(name==='globe'){
    ctx.beginPath();ctx.arc(x,y,24,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y,10+2*Math.sin(a),24,0,0,Math.PI*2);ctx.moveTo(x-23,y);ctx.lineTo(x+23,y);ctx.moveTo(x-19,y-12);ctx.lineTo(x+19,y-12);ctx.moveTo(x-19,y+12);ctx.lineTo(x+19,y+12);ctx.stroke();
  } else if(name==='shield'){
    ctx.beginPath();ctx.moveTo(x,y-27);ctx.lineTo(x+22,y-18);ctx.lineTo(x+18,y+8);ctx.quadraticCurveTo(x,y+27,x,y+27);ctx.quadraticCurveTo(x-18,y+8,x-22,y-18);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(x-9,y);ctx.lineTo(x-2,y+8);ctx.lineTo(x+12,y-9);ctx.stroke();
  } else if(name==='layers'){
    const lift=3*Math.sin(a);[-1,0,1].forEach((k,i)=>{ctx.globalAlpha=.45+i*.25;ctx.beginPath();ctx.moveTo(x,y-18+k*12+lift*k);ctx.lineTo(x+25,y-5+k*12+lift*k);ctx.lineTo(x,y+8+k*12+lift*k);ctx.lineTo(x-25,y-5+k*12+lift*k);ctx.closePath();ctx.stroke();});
  } else if(name==='mask'){
    const slide=5*Math.sin(a);roundRect(ctx,x-26,y-17,52,34,14);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-9+slide,y-2,7,0,Math.PI*2);ctx.arc(x+9+slide,y-2,7,0,Math.PI*2);ctx.fill();ctx.stroke();
  } else if(name==='gear'){
    ctx.rotate(a);ctx.beginPath();for(let i=0;i<16;i++){const q=i*Math.PI/8,r=i%2?20:26;i?ctx.lineTo(Math.cos(q)*r,Math.sin(q)*r):ctx.moveTo(Math.cos(q)*r,Math.sin(q)*r);}ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.stroke();
  } else {
    const pts=[[-17,7],[-6,-14],[12,-10],[19,11],[1,18]],colors=['#38c99b','#7863d8','#f0b23e','#ed728c','#62a9dd'];ctx.beginPath();pts.forEach(([dx,dy],i)=>i?ctx.lineTo(x+dx,y+dy):ctx.moveTo(x+dx,y+dy));ctx.closePath();ctx.stroke();pts.forEach(([dx,dy],i)=>{ctx.fillStyle=colors[i];ctx.globalAlpha=.45+.55*Math.max(0,Math.sin(a+i));ctx.beginPath();ctx.arc(x+dx,y+dy,5,0,Math.PI*2);ctx.fill();});
  }
  ctx.restore();
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

function edgeProgress(t, index, count) { return (t + index / Math.max(1, count)) % 1; }
function nodeProgress() { return 1; }

function nodeBounds(node, compact) {
  const shape=node.shape||'card';
  if(shape==='illustration')return {halfW:105,halfH:120};
  if(shape==='pill')return {halfW:120,halfH:58};
  return {halfW:(compact?100:115),halfH:86};
}

function nodeBodyMetrics(node, compact) {
  const shape=node.shape||'card';
  if(shape==='illustration')return {width:172,maxLines:3,maxSize:15};
  if(shape==='pill')return {width:152,maxLines:2,maxSize:14};
  return {width:(compact?190:220)-28,maxLines:3,maxSize:16};
}

function sharedBodyTypography(ctx, nodes, compact) {
  const maxSize=Math.min(15,...nodes.map(n=>nodeBodyMetrics(n,compact).maxSize));
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

function groupGeometries(ctx, groups, map, compact) {
  const result=[];ctx.save();
  for(const group of groups||[]){
    const members=group.nodeIds.map(id=>map.get(id)).filter(Boolean);if(!members.length)continue;
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(const member of members){const b=nodeBounds(member.node,compact),[x,y]=member.point;left=Math.min(left,x-b.halfW);right=Math.max(right,x+b.halfW);top=Math.min(top,y-b.halfH);bottom=Math.max(bottom,y+b.halfH);}
    left-=20;right+=20;top-=38;bottom+=20;
    let labelSize=17;ctx.font=`700 ${labelSize}px "Microsoft YaHei","Segoe UI",sans-serif`;let labelWidth=ctx.measureText(group.label).width;
    const neededWidth=labelWidth+36,currentWidth=right-left;
    if(currentWidth<neededWidth){const grow=(neededWidth-currentWidth)/2;left-=grow;right+=grow;if(left<12){right+=12-left;left=12;}if(right>W-12){left-=right-(W-12);right=W-12;}left=Math.max(12,left);}
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

function placeEdgeLabels(ctx, edgeSpecs, obstacles) {
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
        if(rect.left<12||rect.right>W-12||rect.top<220||rect.bottom>H-18)continue;
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
  const shape=node.shape||'card',w=shape==='pill'?230:(compact?190:220),h=shape==='pill'?104:162,accent=ACCENTS[index%ACCENTS.length];
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y+(1-alpha)*22);const scale=.9+.1*alpha;ctx.scale(scale,scale);
  if(shape==='illustration'){
    roundRect(ctx,-100,-91,200,202,24);ctx.fillStyle=PALETTE[index%PALETTE.length];ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.stroke();
    drawSemanticIcon(ctx,node.visual||node.icon,0,-58,accent,phase,.90,72,58);
    ctx.fillStyle=INK;const title=fittedText(ctx,node.label,176,2,21,15,700);drawLines(ctx,title,0,-19,title.size+4);
    ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,172,3,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,0,30,body.size+3);ctx.restore();return;
  }
  roundRect(ctx,-w/2,-h/2,w,h,24);ctx.fillStyle=PALETTE[index%PALETTE.length];ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.stroke();
  const ix=shape==='pill'?-w/2+37:0,iy=shape==='pill'?0:-h/2+31,iconScale=shape==='pill'?.60:.75;drawSemanticIcon(ctx,node.visual||node.icon,ix,iy,accent,phase,iconScale,48,48);
  if(shape==='pill'){
    ctx.fillStyle=INK;const title=fittedText(ctx,node.label,w-78,2,19,14,700);drawLines(ctx,title,-w/2+70,-30,title.size+4,'left');
    ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,w-78,2,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,-w/2+70,18,body.size+3,'left');ctx.restore();return;
  }
  ctx.fillStyle=INK;const title=fittedText(ctx,node.label,w-24,2,20,15,700);drawLines(ctx,title,0,-h/2+64,title.size+5);
  ctx.fillStyle=MUTED;const body=fittedText(ctx,node.caption,w-28,3,typography.bodySize,typography.bodySize,400);drawLines(ctx,body,0,-h/2+104,body.size+3);
  ctx.restore();
}

function drawPage(ctx, page, direction, pageIndex, total, frame) {
  const t=frame/(FPS*DURATION);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(68,86,130,.055)';ctx.lineWidth=1;for(let y=18;y<H;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.fillStyle=INK;
  const title=fittedText(ctx,page.title,W-110,2,40,30,700);drawLines(ctx,title,55,25,title.size+7,'left');
  ctx.fillStyle='#4053a0';const headline=fittedText(ctx,page.headline,W-150,2,26,19,700);drawLines(ctx,headline,W/2,145,headline.size+6);
  const pts=page.layout==='semantic-map'?page.nodes.map(n=>[n.position.x*W,n.position.y*H]):positions(page.layout,page.nodes.length),compact=page.format==='wide'?false:page.nodes.length>4,map=new Map(page.nodes.map((n,i)=>[n.id,{point:pts[i],node:n}])),typography=sharedBodyTypography(ctx,page.nodes,compact);
  const groups=groupGeometries(ctx,page.groups,map,compact);drawGroups(ctx,groups);
  const edges=page.edges||[],showEdgeLabels=page.nodes.length<5||page.layout==='semantic-map'||page.layout==='staged-flow',groupStyles=new Map();
  const defaultFlowGroup=(page.layout==='linear-flow'||page.layout==='staged-flow')?'main-flow':null;
  for(const edge of edges){const key=edge.edgeGroup||defaultFlowGroup;if(key&&!groupStyles.has(key)){const color=EDGE_GROUP_COLORS[groupStyles.size%EDGE_GROUP_COLORS.length];groupStyles.set(key,{color,dash:[8,7],lineWidth:2.7});}}
  const edgeSpecs=edges.map((e,i)=>{const groupKey=e.edgeGroup||defaultFlowGroup,pathStyle=e.pathStyle||(page.layout==='branching'?'curve':'straight'),bend=e.bend??(page.layout==='branching'?(i%2?.2:-.2):.24);return {label:showEdgeLabels?e.label:'',priority:e.labelPriority||'optional',relation:e.relation,groupStyle:groupKey?groupStyles.get(groupKey):null,points:edgePath(map.get(e.from),map.get(e.to),compact,(e.via||[]).map(p=>[p.x*W,p.y*H]),pathStyle,bend),phase:edgeProgress(t,i,Math.max(edges.length,page.nodes.length))};});
  edgeSpecs.forEach(spec=>drawArrow(ctx,spec.points,spec.phase,spec.relation,spec.groupStyle));
  const nodeObstacles=page.nodes.map((n,i)=>{const b=nodeBounds(n,compact),[x,y]=pts[i];return {left:x-b.halfW-5,right:x+b.halfW+5,top:y-b.halfH-5,bottom:y+b.halfH+5};});
  const groupBorderObstacles=groups.flatMap(g=>[
    {left:g.left-4,right:g.left+4,top:g.top,bottom:g.bottom},
    {left:g.right-4,right:g.right+4,top:g.top,bottom:g.bottom},
    {left:g.left,right:g.right,top:g.top-4,bottom:g.top+4},
    {left:g.left,right:g.right,top:g.bottom-4,bottom:g.bottom+4}
  ]);
  const edgeLabels=placeEdgeLabels(ctx,edgeSpecs,[...nodeObstacles,...groups.map(g=>g.labelRect),...groupBorderObstacles]);
  page.nodes.forEach((n,i)=>drawNode(ctx,n,...pts[i],i,nodeProgress(t,i,page.nodes.length),compact,(t+i/page.nodes.length)%1,typography));
  drawEdgeLabels(ctx,edgeLabels);
}

function renderGif(page, direction, index, total, outPath) {
  [W,H]=page.format==='wide'?[1600,900]:[1000,1000];
  const canvas=createCanvas(W,H),ctx=canvas.getContext('2d'),gif=new GIFEncoder(W,H);gif.start();gif.setRepeat(0);gif.setDelay(1000/FPS);gif.setQuality(15);
  for(let f=0;f<FPS*DURATION;f++){drawPage(ctx,page,direction,index,total,f);gif.addFrame(ctx);}gif.finish();fs.writeFileSync(outPath,gif.out.getData());
}

function main() {
  const input=process.argv[2],outDir=path.resolve(process.argv[3]||'output');if(!input){usage();process.exit(1);}
  const abs=path.resolve(input),raw=fs.readFileSync(abs,'utf8');let storyboard=path.extname(abs).toLowerCase()==='.json'?JSON.parse(raw):parseMarkdown(raw);
  storyboard=normalizeStoryboard(storyboard);validateStoryboard(storyboard);fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,'storyboard.json'),JSON.stringify(storyboard,null,2));
  const direction=storyboard.visualDirection||{character:'friendly guide',recurringMetaphor:'ideas becoming structure'},outputs=[];
  storyboard.pages.forEach((page,i)=>{const name=`${String(i+1).padStart(2,'0')}-${slug(page.section)}.gif`;renderGif(page,direction,i,storyboard.pages.length,path.join(outDir,name));outputs.push(name);console.log(`Rendered ${name}`);});
  fs.writeFileSync(path.join(outDir,'manifest.json'),JSON.stringify({source:path.basename(abs),title:storyboard.title,version:storyboard.version,pages:outputs},null,2));console.log(`Done: ${outputs.length} GIF(s) in ${outDir}`);
}

main();
