const ICON_NAMES = [
  'chat-bubbles', 'agent', 'schema', 'graph', 'microphone', 'waveform',
  'shield', 'gate', 'layers', 'globe', 'translate', 'document', 'clock',
  'database', 'search', 'check', 'alert', 'gear', 'link', 'headphones',
  'idea', 'phone', 'room', 'speaker', 'subtitle', 'sliders', 'network',
  'bot', 'cloud', 'chip', 'lock', 'ear', 'video', 'target', 'branch',
  'filter', 'merge', 'music', 'mask', 'person', 'asr', 'tts', 'model',
  'embedding', 'dataset', 'server', 'gpu', 'edge-device', 'router',
  'sensor', 'camera', 'latency'
];

const FALLBACK_ICON_NAMES = [
  'document', 'layers', 'dataset', 'search', 'waveform', 'gate', 'target',
  'filter', 'clock', 'network', 'model', 'server', 'check', 'branch', 'gear'
];

const SOFT_ICON_NAMES = new Set([
  'agent', 'bot', 'chat-bubbles', 'check', 'document', 'gear', 'graph',
  'idea', 'person', 'schema'
]);

const ICON_ALIASES = {
  ai: 'model',
  brain: 'model',
  chat: 'chat-bubbles',
  caption: 'subtitle',
  captions: 'subtitle',
  transcript: 'subtitle',
  transcription: 'asr',
  stt: 'asr',
  'speech-to-text': 'asr',
  synthesis: 'tts',
  'text-to-speech': 'tts',
  llm: 'model',
  classifier: 'model',
  neural: 'model',
  representation: 'embedding',
  vector: 'embedding',
  corpus: 'dataset',
  data: 'dataset',
  cpu: 'chip',
  processor: 'chip',
  accelerator: 'gpu',
  smartphone: 'phone',
  mobile: 'phone',
  tablet: 'edge-device',
  edge: 'edge-device',
  'on-device': 'edge-device',
  embedded: 'edge-device',
  wifi: 'router',
  bluetooth: 'router',
  backend: 'server',
  privacy: 'lock',
  security: 'shield',
  safety: 'shield',
  threshold: 'filter',
  calibration: 'filter',
  meeting: 'room',
  assistant: 'bot',
  user: 'person',
  operator: 'person',
  human: 'person'
};

const VISUAL_COLORS = {
  person: '#6f4bd8',
  'chat-bubbles': '#248fc4',
  agent: '#7354c7',
  schema: '#ef9c18',
  graph: '#6f58c9',
  microphone: '#7656c8',
  waveform: '#2f9f9a',
  shield: '#4d8d68',
  gate: '#2b8f82',
  layers: '#e2962d',
  globe: '#3c9b78',
  translate: '#477bd1',
  document: '#1769c2',
  clock: '#ee6688',
  database: '#7354c7',
  search: '#2d76d6',
  check: '#35a65b',
  alert: '#df2f35',
  gear: '#5d963f',
  link: '#ed9f12',
  headphones: '#477bd1',
  idea: '#e7a817',
  phone: '#2d76d6',
  room: '#997143',
  speaker: '#d85f91',
  subtitle: '#1769c2',
  sliders: '#805ac4',
  network: '#2b8f82',
  bot: '#7354c7',
  cloud: '#2d76d6',
  chip: '#557bd8',
  lock: '#4d8d68',
  ear: '#7656c8',
  video: '#d85f91',
  target: '#e99b1c',
  branch: '#2b8f82',
  filter: '#805ac4',
  merge: '#35a65b',
  music: '#d85f91',
  mask: '#6f67bc',
  asr: '#7656c8',
  tts: '#d85f91',
  model: '#7354c7',
  embedding: '#6f58c9',
  dataset: '#1769c2',
  server: '#557bd8',
  gpu: '#805ac4',
  'edge-device': '#2b8f82',
  router: '#2d76d6',
  sensor: '#2f9f9a',
  camera: '#d85f91',
  latency: '#ee6688'
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fallbackIconFor(fallbackIndex = 0) {
  return FALLBACK_ICON_NAMES[Math.abs(fallbackIndex) % FALLBACK_ICON_NAMES.length];
}

function matchSemanticIcon(text) {
  const value = String(text || '').toLowerCase();
  if (!value.trim()) return null;
  const rules = [
    [/wake word|hotword|always[- ]on|listener|listening|voice trigger/, 'ear'],
    [/automatic speech recognition|\basr\b|speech[- ]?to[- ]?text|speech recognition|transcrib|transcription/, 'asr'],
    [/text[- ]?to[- ]?speech|\btts\b|speech synthesis|synthesi[sz]ed speech|voice generation/, 'tts'],
    [/\bser\b|speech emotion recognition|emotion recognition|paralinguistic|affective computing/, 'waveform'],
    [/vad|voice activity|speech segment|utterance|speech|audio capture|microphone/, 'microphone'],
    [/emotion|affect|arousal|valence|prosody|laughter|acoustic|wave/, 'waveform'],
    [/speaker identity|speaker diar|diari[sz]ation|familiar speaker|voice identity|who spoke/, 'speaker'],
    [/caption|subtitle|transcript|timed text|segment text/, 'subtitle'],
    [/phone|mobile|handset|app/, 'phone'],
    [/meeting room|conference room|in[- ]person|physical room|room capture|tabletop/, 'room'],
    [/bot joins|meeting bot|virtual meeting|online meeting|assistant joins|voice assistant|copilot|otter/, 'bot'],
    [/human|user|operator|participant|customer|speaker panel/, 'person'],
    [/camera|webcam|vision capture|frame capture/, 'camera'],
    [/router|wi[- ]?fi|bluetooth|network adapter|access point/, 'router'],
    [/cloud|remote|web stream|online stream|audio stream|connectivity/, 'cloud'],
    [/on[- ]device|edge device|edge ai|embedded|wearable|tinyml|microcontroller|local model|mobile inference/, 'edge-device'],
    [/gpu|accelerator|cuda|tensor core|parallel compute/, 'gpu'],
    [/server|backend|datacenter|data center|cluster|hosted service|deployment/, 'server'],
    [/chip|cpu|processor|silicon|npu|microchip/, 'chip'],
    [/privacy|consent|permission|encrypted|credential|secret|access control/, 'lock'],
    [/secure|safety|policy|guardrail|trust boundary|abuse|misuse/, 'shield'],
    [/latency|real[- ]?time|response time|delay|streaming budget|low[- ]latency/, 'latency'],
    [/risk|unsafe|failure|negative result|not work|missing|gap|error|caution|alert/, 'alert'],
    [/gate|intent|confidence|escalate|decision|accept|reject|permission to continue/, 'gate'],
    [/threshold|calibrat|operating point|tune|filter|false accept|false reject|precision|recall/, 'filter'],
    [/target construct|construct|objective|metric|criterion|success criteria/, 'target'],
    [/alternative|trade[- ]?off|branch|option|fork|path a|path b/, 'branch'],
    [/translate|translation|language|locali[sz]ation|multilingual|darija|arabic|chinese|english/, 'translate'],
    [/globe|cross[- ]?lingual|global|international|locale/, 'globe'],
    [/video|watchable|ffmpeg|clip|timeline|media output/, 'video'],
    [/g2p|phoneme|pronunciation|vowel|automation|transform|render step/, 'gear'],
    [/self[- ]?supervised|pre[- ]?train|fine[- ]?tun|zero[- ]?shot|few[- ]?shot|transfer learning/, 'model'],
    [/embedding|representation|vector|latent space|semantic space|feature space/, 'embedding'],
    [/dataset|corpus|benchmark|annotation|labels?|training data|label store|gold set/, 'dataset'],
    [/database|memory|storage|warehouse/, 'database'],
    [/model|classifier|reasoning|llm|inference|neural network|foundation model|encoder|decoder|transformer/, 'model'],
    [/agent system|agentic|planner|tool use/, 'agent'],
    [/schema|ontology|structured|field|constraint|format/, 'schema'],
    [/graph|relation|node|entity|network map/, 'graph'],
    [/api|integration|route|routing|connect|network/, 'network'],
    [/sensor|signal capture|telemetry|device signal/, 'sensor'],
    [/pipeline|stack|layer|architecture|stage|system/, 'layers'],
    [/merge|combine|dedupe|align|reconcile|join/, 'merge'],
    [/search|retrieve|inspect|detect|find|evidence|review|audit/, 'search'],
    [/document|paper|report|note|article|text|survey|digest|reference/, 'document'],
    [/time|timing|latency|session|turn|schedule|scale/, 'clock'],
    [/quality|valid|robust|check|verify|evaluation|ablation|baseline|safe behavior/, 'check'],
    [/music|song|melody/, 'music'],
    [/mask|hidden|masked prediction/, 'mask']
  ];
  const match = rules.find(([pattern]) => pattern.test(value));
  return match ? match[1] : null;
}

function semanticIconFor(text, fallbackIndex = 0) {
  return matchSemanticIcon(text) || fallbackIconFor(fallbackIndex);
}

function resolveIconName(name, text = '', index = 0, fallbackName = '') {
  const explicit = ICON_ALIASES[name] || name;
  const fallbackAlias = ICON_ALIASES[fallbackName] || fallbackName;
  const fallback = ICON_NAMES.includes(fallbackAlias) ? fallbackAlias : fallbackIconFor(index);
  const semantic = matchSemanticIcon(text);
  if (!explicit || !ICON_NAMES.includes(explicit)) return semantic || fallback;
  if (SOFT_ICON_NAMES.has(explicit)) return semantic || fallback;
  return explicit;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCanvasIcon(ctx, name, x, y, color, phase = 0, options = {}) {
  const aliasedName = ICON_ALIASES[name] || name;
  const iconName = options.text
    ? resolveIconName(name, options.text, options.index || 0)
    : (ICON_NAMES.includes(aliasedName) ? aliasedName : resolveIconName(name));
  const semanticColor = VISUAL_COLORS[iconName] || color;
  const a = phase * Math.PI * 2;
  const pulse = (Math.sin(a) + 1) / 2;
  const wave = (1 - Math.cos(a)) / 2;
  const breath = options.breath ?? (['person', 'chat-bubbles', 'agent', 'graph', 'gear'].includes(iconName) ? 0.035 : 0.014);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1 + breath * Math.sin(a), 1 + breath * Math.sin(a));
  ctx.strokeStyle = semanticColor;
  ctx.fillStyle = semanticColor;
  ctx.lineWidth = options.lineWidth || 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (iconName === 'person') {
    ctx.beginPath(); ctx.arc(0, -13, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 18, 21, Math.PI, 0); ctx.stroke();
  } else if (iconName === 'chat-bubbles') {
    const bob = Math.sin(a) * 2;
    roundRect(ctx, -28, -21 - bob, 40, 28, 10); ctx.stroke();
    roundRect(ctx, -8, -3 + bob, 38, 27, 10); ctx.stroke();
    [-8, 4, 16].forEach((dx, i) => {
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(dx, 10 + bob, 2.6, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'agent') {
    const pts = [[-21, -13], [19, -15], [-17, 18], [22, 14]];
    ctx.globalAlpha = 0.78;
    ctx.beginPath();
    pts.forEach(([dx, dy]) => { ctx.moveTo(0, 0); ctx.lineTo(dx, dy); });
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    roundRect(ctx, -13, -13, 26, 26, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = semanticColor;
    pts.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.48 + 0.52 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'schema') {
    [-16, 0, 16].forEach((dy, i) => {
      ctx.globalAlpha = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(a - i));
      roundRect(ctx, -24, dy - 5, 48, 10, 5); ctx.stroke();
    });
  } else if (iconName === 'graph') {
    const pts = [[-23, 12], [-8, -13], [9, -8], [23, 14]];
    ctx.beginPath();
    pts.forEach(([dx, dy], i) => i ? ctx.lineTo(dx, dy) : ctx.moveTo(dx, dy));
    ctx.stroke();
    pts.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.55 + 0.45 * Math.max(0, Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, dy, 5.5, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'microphone') {
    roundRect(ctx, -10, -26, 20, 36, 10); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -2, 21, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 19); ctx.lineTo(0, 28); ctx.moveTo(-11, 28); ctx.lineTo(11, 28); ctx.stroke();
  } else if (iconName === 'asr') {
    const lift = Math.sin(a) * 1.5;
    roundRect(ctx, -29, -23 + lift, 17, 31, 8); ctx.stroke();
    ctx.beginPath(); ctx.arc(-20.5, -4 + lift, 17, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-20.5, 13 + lift); ctx.lineTo(-20.5, 23 + lift); ctx.moveTo(-28, 23 + lift); ctx.lineTo(-13, 23 + lift); ctx.stroke();
    roundRect(ctx, -4, -20, 34, 40, 8); ctx.stroke();
    [-8, 2, 12].forEach((dy, i) => {
      const reveal = clamp(wave * 4 - i, 0, 1);
      ctx.beginPath(); ctx.moveTo(4, dy); ctx.lineTo(4 + 18 * reveal, dy); ctx.stroke();
    });
  } else if (iconName === 'tts') {
    roundRect(ctx, -30, -20, 28, 38, 8); ctx.stroke();
    [-8, 2, 12].forEach((dy, i) => {
      const reveal = clamp(wave * 4 - i, 0, 1);
      ctx.beginPath(); ctx.moveTo(-22, dy); ctx.lineTo(-22 + 14 * reveal, dy); ctx.stroke();
    });
    roundRect(ctx, 6, -9, 11, 18, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(17, -10); ctx.lineTo(28, -19); ctx.lineTo(28, 19); ctx.lineTo(17, 10); ctx.stroke();
    [16, 24].forEach((r, i) => {
      ctx.globalAlpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(27, 0, r, -0.65, 0.65); ctx.stroke();
    });
  } else if (iconName === 'waveform') {
    ctx.beginPath();
    for (let i = -24; i <= 24; i += 4) {
      const amp = 4 + 12 * (0.5 + 0.5 * Math.sin(a + i * 0.35));
      const yy = Math.sin(i * 0.42 + a) * amp;
      i === -24 ? ctx.moveTo(i, yy) : ctx.lineTo(i, yy);
    }
    ctx.stroke();
  } else if (iconName === 'shield') {
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(23, -18); ctx.lineTo(18, 8);
    ctx.quadraticCurveTo(0, 28, 0, 28); ctx.quadraticCurveTo(-18, 8, -23, -18);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-2, 8); ctx.lineTo(13, -10); ctx.stroke();
  } else if (iconName === 'gate') {
    [-20, 20].forEach((x0) => { roundRect(ctx, x0 - 4, -26, 8, 52, 4); ctx.stroke(); });
    [-11, 0, 11].forEach((dy, i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(0, dy, 4.5, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'layers') {
    [-1, 0, 1].forEach((k, i) => {
      ctx.globalAlpha = 0.5 + i * 0.22;
      const lift = 2 * Math.sin(a) * k;
      ctx.beginPath();
      ctx.moveTo(0, -20 + k * 12 + lift); ctx.lineTo(26, -6 + k * 12 + lift);
      ctx.lineTo(0, 8 + k * 12 + lift); ctx.lineTo(-26, -6 + k * 12 + lift);
      ctx.closePath(); ctx.stroke();
    });
  } else if (iconName === 'globe') {
    ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 10 + Math.sin(a) * 2, 25, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-23, 0); ctx.lineTo(23, 0); ctx.moveTo(-18, -12); ctx.lineTo(18, -12); ctx.moveTo(-18, 12); ctx.lineTo(18, 12); ctx.stroke();
  } else if (iconName === 'translate') {
    roundRect(ctx, -29, -16, 24, 28, 7); ctx.stroke();
    roundRect(ctx, 5, -12, 24, 28, 7); ctx.stroke();
    [-8, 0].forEach((dy, i) => {
      const reveal = clamp(wave * 3 - i, 0, 1);
      ctx.beginPath(); ctx.moveTo(-24, dy); ctx.lineTo(-24 + 14 * reveal, dy); ctx.stroke();
    });
    [0, 8].forEach((dy, i) => {
      const reveal = clamp(wave * 3 - i, 0, 1);
      ctx.beginPath(); ctx.moveTo(10, dy); ctx.lineTo(10 + 14 * reveal, dy); ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(-5, -22); ctx.quadraticCurveTo(8, -28, 22, -19);
    ctx.moveTo(5, 24); ctx.quadraticCurveTo(-9, 28, -22, 18);
    ctx.stroke();
  } else if (iconName === 'document') {
    ctx.beginPath();
    ctx.moveTo(-19, -27); ctx.lineTo(10, -27); ctx.lineTo(21, -16); ctx.lineTo(21, 27); ctx.lineTo(-19, 27); ctx.closePath(); ctx.stroke();
    [-8, 3, 14].forEach((dy, i) => {
      const reveal = clamp(wave * 4 - i, 0, 1);
      ctx.beginPath(); ctx.moveTo(-10, dy); ctx.lineTo(-10 + 24 * reveal, dy); ctx.stroke();
    });
  } else if (iconName === 'clock') {
    ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(15 * Math.sin(a), -15 * Math.cos(a)); ctx.moveTo(0, 0); ctx.lineTo(10, -8); ctx.stroke();
  } else if (iconName === 'database') {
    [-17, 0, 17].forEach((dy, i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.ellipse(0, dy, 24, 9, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(-24, -17); ctx.lineTo(-24, 17); ctx.moveTo(24, -17); ctx.lineTo(24, 17); ctx.stroke();
  } else if (iconName === 'dataset') {
    roundRect(ctx, -27, -24, 54, 48, 8); ctx.stroke();
    [-12, 0, 12].forEach((dy, i) => {
      ctx.globalAlpha = 0.52 + 0.48 * (0.5 + 0.5 * Math.sin(a - i));
      roundRect(ctx, -19, dy - 4, 8, 8, 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-5, dy); ctx.lineTo(18, dy); ctx.stroke();
    });
  } else if (iconName === 'embedding') {
    roundRect(ctx, -27, -23, 54, 46, 10); ctx.stroke();
    const pts = [[-15, -9], [-2, -15], [13, -8], [-11, 9], [6, 12], [18, 5]];
    ctx.beginPath();
    [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5]].forEach(([from, to]) => {
      ctx.moveTo(pts[from][0], pts[from][1]);
      ctx.lineTo(pts[to][0], pts[to][1]);
    });
    ctx.stroke();
    pts.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(a + i * 0.7));
      ctx.beginPath(); ctx.arc(dx, dy, 3.7, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'search') {
    const ox = Math.sin(a) * 4, oy = Math.cos(a) * 3;
    ctx.beginPath(); ctx.arc(-5 + ox, -5 + oy, 17, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8 + ox, 8 + oy); ctx.lineTo(25 + ox, 25 + oy); ctx.stroke();
  } else if (iconName === 'check') {
    ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-13, 1); ctx.lineTo(-4, 11); ctx.lineTo(15, -12); ctx.stroke();
  } else if (iconName === 'alert') {
    ctx.strokeStyle = '#df2f35'; ctx.fillStyle = '#df2f35'; ctx.globalAlpha = 0.65 + 0.35 * pulse;
    ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(26, 23); ctx.lineTo(-26, 23); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 8); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 16, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'gear') {
    ctx.rotate(a * 0.22);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const q = i * Math.PI / 8, r = i % 2 ? 19 : 25;
      i ? ctx.lineTo(Math.cos(q) * r, Math.sin(q) * r) : ctx.moveTo(Math.cos(q) * r, Math.sin(q) * r);
    }
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
  } else if (iconName === 'link') {
    const d = 2 * Math.sin(a);
    ctx.beginPath(); ctx.arc(-11 + d, 0, 15, -1.05, 1.05); ctx.arc(11 - d, 0, 15, 2.1, 4.2); ctx.stroke();
  } else if (iconName === 'headphones') {
    const bob = Math.sin(a) * 2;
    ctx.beginPath(); ctx.arc(0, bob, 24, Math.PI, 0); ctx.stroke();
    roundRect(ctx, -29, -2 + bob, 10, 24, 5); ctx.stroke();
    roundRect(ctx, 19, -2 + bob, 10, 24, 5); ctx.stroke();
  } else if (iconName === 'idea') {
    ctx.beginPath(); ctx.arc(0, -6, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, 15); ctx.lineTo(-6, 27); ctx.lineTo(7, 27); ctx.lineTo(9, 15); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const q = a + i * Math.PI / 3, r = 30 + 3 * pulse;
      ctx.globalAlpha = 0.35 + 0.65 * ((phase + i / 6) % 1);
      ctx.beginPath(); ctx.moveTo(Math.cos(q) * r, -6 + Math.sin(q) * r); ctx.lineTo(Math.cos(q) * (r + 6), -6 + Math.sin(q) * (r + 6)); ctx.stroke();
    }
  } else if (iconName === 'bot') {
    const bob = Math.sin(a) * 1.6;
    roundRect(ctx, -24, -18 + bob, 48, 34, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -18 + bob); ctx.lineTo(0, -29 + bob); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -32 + bob, 3, 0, Math.PI * 2); ctx.fill();
    [-9, 9].forEach((dx, i) => {
      ctx.globalAlpha = 0.38 + 0.62 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, -4 + bob, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(-10, 9 + bob); ctx.lineTo(10, 9 + bob); ctx.stroke();
  } else if (iconName === 'model') {
    roundRect(ctx, -25, -23, 50, 46, 11); ctx.stroke();
    const pts = [[-13, -10], [0, -14], [13, -9], [-10, 8], [6, 11], [17, 5]];
    ctx.beginPath();
    [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5]].forEach(([from, to]) => {
      ctx.moveTo(pts[from][0], pts[from][1]);
      ctx.lineTo(pts[to][0], pts[to][1]);
    });
    ctx.stroke();
    pts.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(a + i * 0.9));
      ctx.beginPath(); ctx.arc(dx, dy, 3.8, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'cloud') {
    const drift = Math.sin(a) * 2;
    ctx.beginPath();
    ctx.moveTo(-27 + drift, 8);
    ctx.quadraticCurveTo(-24 + drift, -8, -9 + drift, -7);
    ctx.quadraticCurveTo(-2 + drift, -23, 15 + drift, -12);
    ctx.quadraticCurveTo(30 + drift, -10, 28 + drift, 8);
    ctx.closePath(); ctx.stroke();
    [-12, 0, 12].forEach((dx, i) => {
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(dx + drift, 22, 2.8, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'chip') {
    roundRect(ctx, -20, -20, 40, 40, 8); ctx.stroke();
    for (let i = -12; i <= 12; i += 12) {
      ctx.beginPath();
      ctx.moveTo(-28, i); ctx.lineTo(-21, i);
      ctx.moveTo(21, i); ctx.lineTo(28, i);
      ctx.moveTo(i, -28); ctx.lineTo(i, -21);
      ctx.moveTo(i, 21); ctx.lineTo(i, 28);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.55 + 0.45 * pulse;
    roundRect(ctx, -8, -8, 16, 16, 4); ctx.stroke();
  } else if (iconName === 'gpu') {
    roundRect(ctx, -24, -20, 48, 40, 7); ctx.stroke();
    for (let i = -14; i <= 14; i += 14) {
      ctx.beginPath();
      ctx.moveTo(-31, i); ctx.lineTo(-25, i);
      ctx.moveTo(25, i); ctx.lineTo(31, i);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(-7, 0, 9 + Math.sin(a), 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, -9); ctx.lineTo(-7, 9); ctx.moveTo(-16, 0); ctx.lineTo(2, 0); ctx.stroke();
    [4, 12].forEach((x0, i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a - i));
      roundRect(ctx, x0, -10, 7, 20, 2); ctx.stroke();
    });
  } else if (iconName === 'server') {
    [-16, 0, 16].forEach((dy, i) => {
      ctx.globalAlpha = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(a - i));
      roundRect(ctx, -27, dy - 7, 54, 14, 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-17, dy); ctx.lineTo(6, dy); ctx.stroke();
      ctx.beginPath(); ctx.arc(17, dy, 2.5, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'edge-device') {
    roundRect(ctx, -18, -29, 36, 58, 8); ctx.stroke();
    roundRect(ctx, -8, -9, 16, 16, 4); ctx.stroke();
    [-4, 4].forEach((d) => {
      ctx.beginPath(); ctx.moveTo(-14, d); ctx.lineTo(-9, d); ctx.moveTo(9, d); ctx.lineTo(14, d); ctx.stroke();
    });
    [20, 27].forEach((r, i) => {
      ctx.globalAlpha = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(0, -3, r, -0.95, -0.22); ctx.stroke();
    });
  } else if (iconName === 'router') {
    const glow = 0.5 + 0.5 * Math.sin(a);
    roundRect(ctx, -26, 5, 52, 18, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16, 5); ctx.lineTo(-24, -18); ctx.moveTo(16, 5); ctx.lineTo(24, -18); ctx.stroke();
    [10, 18, 26].forEach((r, i) => {
      ctx.globalAlpha = 0.22 + 0.55 * clamp(glow * 1.8 - i * 0.35, 0, 1);
      ctx.beginPath(); ctx.arc(0, -9, r, -2.35, -0.8); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(-15, 14, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'lock') {
    ctx.beginPath(); ctx.arc(0, -7, 15, Math.PI, 0); ctx.stroke();
    roundRect(ctx, -22, -4, 44, 30, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 17); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 6, 3, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'ear') {
    ctx.beginPath();
    ctx.moveTo(7, 26);
    ctx.quadraticCurveTo(-8, 18, -5, 3);
    ctx.quadraticCurveTo(-1, -19, 15, -18);
    ctx.quadraticCurveTo(29, -17, 28, -1);
    ctx.quadraticCurveTo(27, 10, 15, 14);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(13, 0, 8, -1.4, 2.1); ctx.stroke();
    [16, 25].forEach((r, i) => {
      ctx.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(-14, 0, r, -0.7, 0.7); ctx.stroke();
    });
  } else if (iconName === 'video') {
    roundRect(ctx, -28, -20, 56, 40, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(13, 0); ctx.lineTo(-6, 10); ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 0.35 + 0.65 * pulse;
    ctx.beginPath(); ctx.moveTo(-20, 27); ctx.lineTo(20, 27); ctx.stroke();
  } else if (iconName === 'camera') {
    roundRect(ctx, -28, -17, 56, 34, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, -17); ctx.lineTo(-9, -27); ctx.lineTo(9, -27); ctx.lineTo(14, -17); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 11 + Math.sin(a), 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.5 + 0.5 * pulse;
    ctx.beginPath(); ctx.arc(19, -8, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'target') {
    [25, 15, 5].forEach((r, i) => {
      ctx.globalAlpha = 0.45 + i * 0.2;
      ctx.beginPath(); ctx.arc(0, 0, r + (i === 0 ? Math.sin(a) : 0), 0, Math.PI * 2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-22, 0); ctx.moveTo(22, 0); ctx.lineTo(30, 0); ctx.moveTo(0, -30); ctx.lineTo(0, -22); ctx.moveTo(0, 22); ctx.lineTo(0, 30); ctx.stroke();
  } else if (iconName === 'branch') {
    const pts = [[-23, -17], [-23, 17], [23, 0]];
    ctx.beginPath();
    ctx.moveTo(-13, -17); ctx.quadraticCurveTo(0, -17, 6, -6); ctx.lineTo(14, 0);
    ctx.moveTo(-13, 17); ctx.quadraticCurveTo(0, 17, 6, 6); ctx.lineTo(14, 0);
    ctx.stroke();
    pts.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, dy, 6, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'filter') {
    ctx.beginPath();
    ctx.moveTo(-26, -22); ctx.lineTo(26, -22); ctx.lineTo(8, 0); ctx.lineTo(8, 23); ctx.lineTo(-8, 23); ctx.lineTo(-8, 0); ctx.closePath();
    ctx.stroke();
    ctx.globalAlpha = 0.55 + 0.45 * pulse;
    ctx.beginPath(); ctx.moveTo(-15, -8); ctx.lineTo(15, -8); ctx.stroke();
  } else if (iconName === 'phone') {
    roundRect(ctx, -16, -29, 32, 58, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, 19); ctx.lineTo(7, 19); ctx.stroke();
    ctx.globalAlpha = 0.5 + 0.5 * pulse;
    ctx.beginPath(); ctx.arc(0, -5, 10, 0, Math.PI * 2); ctx.stroke();
  } else if (iconName === 'room') {
    roundRect(ctx, -27, -9, 54, 22, 11); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18, 13); ctx.lineTo(-22, 25);
    ctx.moveTo(18, 13); ctx.lineTo(22, 25);
    ctx.moveTo(-18, -9); ctx.lineTo(-22, -21);
    ctx.moveTo(18, -9); ctx.lineTo(22, -21);
    ctx.stroke();
    [[0, -25], [-30, 2], [30, 2]].forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, dy, 4.5, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'speaker') {
    roundRect(ctx, -27, -13, 15, 26, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(8, -24); ctx.lineTo(8, 24); ctx.lineTo(-12, 12); ctx.stroke();
    [13, 22].forEach((r, i) => {
      ctx.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(8, 0, r, -0.8, 0.8); ctx.stroke();
    });
  } else if (iconName === 'subtitle') {
    roundRect(ctx, -30, -21, 60, 42, 8); ctx.stroke();
    [-7, 7].forEach((dy, i) => {
      const reveal = clamp(wave * 3 - i, 0, 1);
      ctx.beginPath(); ctx.moveTo(-18, dy); ctx.lineTo(-18 + 36 * reveal, dy); ctx.stroke();
    });
  } else if (iconName === 'sliders') {
    [-17, 0, 17].forEach((dx, i) => {
      ctx.beginPath(); ctx.moveTo(dx, -25); ctx.lineTo(dx, 25); ctx.stroke();
      const y = [-8, 9, -1][i] + Math.sin(a + i) * 2;
      ctx.beginPath(); ctx.arc(dx, y, 6, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'network') {
    const pts = [[-22, -14], [20, -18], [0, 4], [-16, 22], [23, 18]];
    ctx.beginPath();
    [[0, 2], [1, 2], [2, 3], [2, 4], [3, 4]].forEach(([aIdx, bIdx]) => {
      ctx.moveTo(pts[aIdx][0], pts[aIdx][1]); ctx.lineTo(pts[bIdx][0], pts[bIdx][1]);
    });
    ctx.stroke();
    pts.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'sensor') {
    roundRect(ctx, -19, -19, 38, 38, 9); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.42 + 0.58 * pulse;
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    [21, 29].forEach((r, i) => {
      ctx.globalAlpha = 0.22 + 0.5 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(0, 0, r, -0.55, 0.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r, Math.PI - 0.55, Math.PI + 0.55); ctx.stroke();
    });
  } else if (iconName === 'merge') {
    ctx.beginPath();
    ctx.moveTo(-22, -20); ctx.quadraticCurveTo(-20, 5, 0, 5); ctx.quadraticCurveTo(20, 5, 22, 22);
    ctx.moveTo(22, -20); ctx.quadraticCurveTo(20, 5, 0, 5);
    ctx.stroke();
    const d = 18 * (1 - wave);
    [-1, 1].forEach((side) => {
      ctx.beginPath(); ctx.arc(side * d, -12 + wave * 17, 4, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'music') {
    const bob = Math.sin(a) * 3;
    ctx.beginPath(); ctx.moveTo(-5, -20 + bob); ctx.lineTo(-5, 13 + bob); ctx.lineTo(18, 7 + bob); ctx.lineTo(18, -25 + bob); ctx.lineTo(-5, -18 + bob); ctx.stroke();
    ctx.beginPath(); ctx.arc(-12, 16 + bob, 8, 0, Math.PI * 2); ctx.arc(11, 10 + bob, 8, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'mask') {
    const slide = 5 * Math.sin(a);
    roundRect(ctx, -26, -17, 52, 34, 14); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-9 + slide, -2, 7, 0, Math.PI * 2); ctx.arc(9 + slide, -2, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (iconName === 'latency') {
    ctx.beginPath(); ctx.arc(-10, -3, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(-1 + 4 * Math.sin(a), -13); ctx.moveTo(-10, -3); ctx.lineTo(-10, -17); ctx.stroke();
    ctx.beginPath();
    for (let i = -30; i <= 30; i += 6) {
      const y0 = 21 - (i > -8 && i < 18 ? 10 * (0.5 + 0.5 * Math.sin(a + i)) : 0);
      i === -30 ? ctx.moveTo(i, y0) : ctx.lineTo(i, y0);
    }
    ctx.stroke();
  } else {
    [-1, 0, 1].forEach((k, i) => {
      ctx.globalAlpha = 0.5 + i * 0.22;
      ctx.beginPath();
      ctx.moveTo(0, -19 + k * 10); ctx.lineTo(22, -7 + k * 10);
      ctx.lineTo(0, 5 + k * 10); ctx.lineTo(-22, -7 + k * 10);
      ctx.closePath(); ctx.stroke();
    });
  }

  ctx.restore();
}

module.exports = {
  ICON_NAMES,
  FALLBACK_ICON_NAMES,
  SOFT_ICON_NAMES,
  ICON_ALIASES,
  VISUAL_COLORS,
  fallbackIconFor,
  matchSemanticIcon,
  semanticIconFor,
  resolveIconName,
  drawCanvasIcon
};
