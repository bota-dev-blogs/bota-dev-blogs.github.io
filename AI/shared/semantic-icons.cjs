const ICON_NAMES = [
  'chat-bubbles', 'agent', 'schema', 'graph', 'microphone', 'waveform', 'noise',
  'diarization', 'codec', 'audio-token', 'stream', 'prosody', 'emotion', 'voiceprint',
  'alignment', 'interruption', 'phoneme', 'language',
  'shield', 'gate', 'layers', 'context', 'globe', 'translate', 'document', 'clock',
  'event', 'heartbeat', 'database', 'search', 'check', 'alert', 'miss', 'gear', 'link', 'headphones',
  'idea', 'phone', 'room', 'speaker', 'subtitle', 'sliders', 'network',
  'bot', 'cloud', 'chip', 'lock', 'ear', 'video', 'target', 'branch', 'bluetooth', 'wifi',
  'cellular', 'api', 'sdk', 'wearable', 'upload', 'function-call',
  'transformer', 'attention', 'memory', 'retrieval', 'reasoning', 'confidence',
  'workflow', 'guardrail', 'battery', 'storage', 'firmware', 'provisioning',
  'sync', 'webhook', 'websocket', 'credential', 'telemetry', 'version', 'audit',
  'queue', 'retry', 'checksum',
  'filter', 'merge', 'music', 'mask', 'person', 'asr', 'tts', 'model', 'omni',
  'embedding', 'dataset', 'server', 'gpu', 'edge-device', 'fleet', 'router',
  'sensor', 'camera', 'latency'
];

const FALLBACK_ICON_NAMES = [
  'document', 'layers', 'dataset', 'search', 'waveform', 'gate', 'target',
  'filter', 'clock', 'network', 'model', 'server', 'check', 'branch', 'gear'
];

const CANVAS_ICON_MOTION = Object.freeze({
  scaleAmplitude: 0.04,
  driftPx: 1.6
});

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
  ble: 'bluetooth',
  '4g': 'cellular',
  'mobile-network': 'cellular',
  'function_call': 'function-call',
  ser: 'emotion',
  'speaker-id': 'voiceprint',
  'speaker-identification': 'voiceprint',
  'speaker-diarization': 'diarization',
  'audio-codec': 'codec',
  'speech-token': 'audio-token',
  'barge-in': 'interruption',
  reconnect: 'retry',
  'web-socket': 'websocket',
  auth: 'credential',
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
  noise: '#c84550',
  diarization: '#477bd1',
  codec: '#805ac4',
  'audio-token': '#6f58c9',
  stream: '#2d76d6',
  prosody: '#d85f91',
  emotion: '#d95672',
  voiceprint: '#7656c8',
  alignment: '#35a65b',
  interruption: '#df2f35',
  phoneme: '#e2962d',
  language: '#3c9b78',
  shield: '#4d8d68',
  gate: '#2b8f82',
  layers: '#e2962d',
  context: '#d37b26',
  globe: '#3c9b78',
  translate: '#477bd1',
  document: '#1769c2',
  clock: '#ee6688',
  event: '#e07d34',
  heartbeat: '#d95672',
  database: '#7354c7',
  search: '#2d76d6',
  check: '#35a65b',
  alert: '#df2f35',
  miss: '#c84550',
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
  bluetooth: '#3b73c4',
  wifi: '#2d76d6',
  cellular: '#3e8c9b',
  api: '#557bd8',
  sdk: '#6f58c9',
  wearable: '#2b8f82',
  upload: '#e2962d',
  'function-call': '#805ac4',
  transformer: '#7354c7',
  attention: '#6f58c9',
  memory: '#d37b26',
  retrieval: '#2d76d6',
  reasoning: '#805ac4',
  confidence: '#e99b1c',
  workflow: '#2b8f82',
  guardrail: '#4d8d68',
  battery: '#35a65b',
  storage: '#557bd8',
  firmware: '#6f67bc',
  provisioning: '#3e8c9b',
  sync: '#2f9f9a',
  webhook: '#e07d34',
  websocket: '#248fc4',
  credential: '#4d8d68',
  telemetry: '#3e8c9b',
  version: '#d37b26',
  audit: '#1769c2',
  queue: '#997143',
  retry: '#e2962d',
  checksum: '#35a65b',
  filter: '#805ac4',
  merge: '#35a65b',
  music: '#d85f91',
  mask: '#6f67bc',
  asr: '#7656c8',
  tts: '#d85f91',
  model: '#7354c7',
  omni: '#5b67c8',
  embedding: '#6f58c9',
  dataset: '#1769c2',
  server: '#557bd8',
  gpu: '#805ac4',
  'edge-device': '#2b8f82',
  fleet: '#3e8c9b',
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
    [/false reject|missed detection|missed trigger|missed wake/, 'miss'],
    [/function call|tool call|external action|invoke tool/, 'function-call'],
    [/background noise|noise suppression|denois|noisy recording|noise floor/, 'noise'],
    [/speaker diar|diarization|speaker turns|who spoke/, 'diarization'],
    [/codec|compression|compressed audio|bitrate/, 'codec'],
    [/audio token|speech token|codec token|discrete audio token/, 'audio-token'],
    [/token stream|streaming output|streaming response|streaming transport|chunk stream|streaming generation/, 'stream'],
    [/prosody|pitch contour|intonation|speaking rate|rhythm of speech/, 'prosody'],
    [/emotion|affect|arousal|valence|laughter|acoustic emotion/, 'emotion'],
    [/voiceprint|voice identity|speaker identity|speaker embedding|familiar speaker/, 'voiceprint'],
    [/alignment|timestamp alignment|time[- ]aligned|forced alignment/, 'alignment'],
    [/interruption|barge[- ]?in|turn[- ]?taking|interrupt/, 'interruption'],
    [/phoneme|phonology|pronunciation|vowel|consonant|g2p/, 'phoneme'],
    [/language id|language identification|spoken language|language coverage|low[- ]resource language/, 'language'],
    [/cross[- ]attention|self[- ]attention|attention map|attention weights/, 'attention'],
    [/transformer|attention block|encoder[- ]decoder block/, 'transformer'],
    [/working memory|long[- ]term memory|context window|memory layer|memory store/, 'memory'],
    [/retrieval|\brag\b|evidence retrieval|vector search|retrieve evidence/, 'retrieval'],
    [/reasoning|chain of thought|planning step|inference trace/, 'reasoning'],
    [/confidence|uncertainty|confidence score|confidence estimate/, 'confidence'],
    [/workflow|workflow object|business workflow|operating workflow|next action/, 'workflow'],
    [/guardrail|guardrails|policy boundary|safety boundary/, 'guardrail'],
    [/battery|power budget|power state|battery life|energy budget/, 'battery'],
    [/local storage|object storage|storage layer|stored audio|storage credential/, 'storage'],
    [/firmware|ota update|device software update/, 'firmware'],
    [/provisioning|provision|pairing grant|device binding|network credentials/, 'provisioning'],
    [/sync|synchroni[sz]|resumable transfer/, 'sync'],
    [/webhook|web hook/, 'webhook'],
    [/websocket|web socket|ws connection/, 'websocket'],
    [/credential|device token|api key|access token|secret/, 'credential'],
    [/telemetry|device health|device status|health signal/, 'telemetry'],
    [/version|versioned|schema version|release/, 'version'],
    [/audit|audit trail|audit log|review history/, 'audit'],
    [/queue|upload queue|retry queue|backlog/, 'queue'],
    [/retry|retries|retryable|backoff/, 'retry'],
    [/checksum|hash|integrity check|sha[- ]?/, 'checksum'],
    [/bluetooth|\bble\b|nearby radio|radio pairing/, 'bluetooth'],
    [/wi-?fi|wireless lan|wireless network|access point/, 'wifi'],
    [/cellular|\b4g\b|\b5g\b|mobile network/, 'cellular'],
    [/developer api|recording api|audio api|api endpoint|rest api/, 'api'],
    [/mobile sdk|react native sdk|developer kit|client sdk/, 'sdk'],
    [/wearable|body-worn|worn device|lapel device|pin device/, 'wearable'],
    [/upload|pre[- ]?signed|put audio|transfer audio|resumable transfer/, 'upload'],
    [/heartbeat|liveness/, 'heartbeat'],
    [/webhook event|application event|lifecycle event|event stream/, 'event'],
    [/device fleet|fleet operations|fleet management/, 'fleet'],
    [/omni speech|omni model|multimodal audio model/, 'omni'],
    [/context object|versioned context|agent context|session context|governed context/, 'context'],
    [/wake word|hotword|always[- ]on|listener|listening|voice trigger/, 'ear'],
    [/automatic speech recognition|\basr\b|speech[- ]?to[- ]?text|speech recognition|transcrib|transcription/, 'asr'],
    [/text[- ]?to[- ]?speech|\btts\b|speech synthesis|synthesi[sz]ed speech|voice generation/, 'tts'],
    [/affect encoder|emotion encoder|emotion model|emotion ssl|ser model/, 'model'],
    [/\bser\b|speech emotion recognition|emotion recognition|paralinguistic|affective computing/, 'emotion'],
    [/microphone|mic input|audio capture|voice capture|source speech/, 'microphone'],
    [/raw audio|speech audio|audio stream|streaming audio|audio chunks|waveform|signal/, 'waveform'],
    [/vad|voice activity|speech segment|utterance/, 'microphone'],
    [/acoustic|waveform|signal shape|raw signal/, 'waveform'],
    [/speaker label|speaker channel|speaker track|speaker panel/, 'speaker'],
    [/caption|subtitle|transcript|timed text|segment text/, 'subtitle'],
    [/phone|mobile|handset|app/, 'phone'],
    [/meeting room|conference room|in[- ]person|physical room|room capture|tabletop/, 'room'],
    [/voice agent|agent system|agentic|planner|tool use|tool-using assistant/, 'agent'],
    [/bot joins|meeting bot|assistant joins|copilot|otter/, 'bot'],
    [/human|user|operator|participant|customer|speaker panel/, 'person'],
    [/camera|webcam|vision capture|frame capture/, 'camera'],
    [/router|network adapter/, 'router'],
    [/cloud|remote service|web stream|online stream/, 'cloud'],
    [/on[- ]device|edge device|edge ai|embedded|tinyml|microcontroller|local model|mobile inference/, 'edge-device'],
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
  const scaleAmplitude = options.breath ?? options.scaleAmplitude ?? CANVAS_ICON_MOTION.scaleAmplitude;
  const driftPx = options.driftPx ?? CANVAS_ICON_MOTION.driftPx;
  const scale = 1 + scaleAmplitude * Math.sin(a);

  ctx.save();
  ctx.translate(x, y + driftPx * Math.cos(a));
  ctx.scale(scale, scale);
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
  } else if (iconName === 'noise') {
    ctx.beginPath();
    for (let i = -27; i <= 27; i += 3) {
      const yy = Math.sin(i * 1.7 + a * 2.2) * (5 + 8 * pulse);
      i === -27 ? ctx.moveTo(i, yy) : ctx.lineTo(i, yy);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.55 + 0.45 * pulse;
    ctx.beginPath(); ctx.moveTo(-24, 23); ctx.lineTo(24, -23); ctx.stroke();
  } else if (iconName === 'diarization') {
    [-15, 15].forEach((dx, i) => {
      ctx.globalAlpha = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, -12, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(dx, 15, 13, Math.PI, 0); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(0, 25); ctx.stroke();
  } else if (iconName === 'codec') {
    ctx.beginPath(); ctx.moveTo(-29, 0); ctx.lineTo(-18, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, 14); ctx.lineTo(0, 0); ctx.stroke();
    roundRect(ctx, -4, -20, 16, 40, 5); ctx.stroke();
    [15, 22, 29].forEach((dx, i) => {
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(a - i));
      roundRect(ctx, dx - 2, -8 + i * 4, 5, 16 - i * 3, 2); ctx.stroke();
    });
  } else if (iconName === 'audio-token') {
    [-22, -8, 6, 20].forEach((dx, i) => {
      const lift = i === Math.floor(wave * 4) ? -4 : 0;
      ctx.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(a + i));
      roundRect(ctx, dx - 5, -10 + lift, 10, 20 - lift, 3); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(-27, 17); ctx.lineTo(25, 17); ctx.stroke();
  } else if (iconName === 'stream') {
    ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(28, 0); ctx.stroke();
    [-20, -7, 7, 20].forEach((dx, i) => {
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(a * 1.4 + i));
      ctx.beginPath(); ctx.arc(dx, Math.sin(a * 1.4 + i) * 5, 5, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'prosody') {
    ctx.beginPath();
    for (let i = -26; i <= 26; i += 4) {
      const yy = Math.sin(i * 0.28 + a) * (5 + 7 * (0.5 + 0.5 * Math.sin(i * 0.11)));
      i === -26 ? ctx.moveTo(i, yy + 9) : ctx.lineTo(i, yy + 9);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.55 + 0.45 * pulse;
    ctx.beginPath(); ctx.moveTo(-25, 14); ctx.quadraticCurveTo(-5, -22, 26, -8); ctx.stroke();
  } else if (iconName === 'emotion') {
    ctx.beginPath();
    ctx.moveTo(-23, -7); ctx.bezierCurveTo(-15, -20, -3, -9, 0, -1);
    ctx.bezierCurveTo(3, -9, 15, -20, 23, -7); ctx.bezierCurveTo(26, 5, 10, 17, 0, 25);
    ctx.bezierCurveTo(-10, 17, -26, 5, -23, -7); ctx.stroke();
    ctx.globalAlpha = 0.5 + 0.5 * pulse;
    ctx.beginPath(); ctx.moveTo(-12, 3); ctx.lineTo(-5, -1); ctx.lineTo(2, 5); ctx.lineTo(10, -3); ctx.stroke();
  } else if (iconName === 'voiceprint') {
    [8, 14, 20, 26].forEach((r, i) => {
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(0, 0, r, -1.15, 1.15); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r, Math.PI - 1.15, Math.PI + 1.15); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, 5); ctx.stroke();
  } else if (iconName === 'alignment') {
    [-12, 12].forEach((dy, i) => {
      ctx.globalAlpha = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.moveTo(-27, dy); ctx.lineTo(27, dy); ctx.stroke();
      [-18, -4, 11, 23].forEach((dx) => {
        ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill();
      });
    });
    ctx.globalAlpha = 0.7;
    [-18, -4, 11, 23].forEach((dx) => { ctx.beginPath(); ctx.moveTo(dx, -9); ctx.lineTo(dx, 9); ctx.stroke(); });
  } else if (iconName === 'interruption') {
    ctx.beginPath(); ctx.moveTo(-28, -12); ctx.lineTo(-20, -12); ctx.lineTo(-15, -22); ctx.lineTo(-7, -2); ctx.lineTo(-2, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, 12); ctx.lineTo(7, 12); ctx.lineTo(14, 2); ctx.lineTo(20, 20); ctx.lineTo(28, 12); ctx.stroke();
    ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.moveTo(-2, -25); ctx.lineTo(2, 25); ctx.stroke();
  } else if (iconName === 'phoneme') {
    roundRect(ctx, -28, -13, 56, 26, 13); ctx.stroke();
    ctx.beginPath(); ctx.arc(-10, -1, 3, 0, Math.PI * 2); ctx.arc(0, 2, 3, 0, Math.PI * 2); ctx.arc(10, -1, 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.5 + 0.5 * pulse;
    ctx.beginPath(); ctx.moveTo(-18, 18); ctx.lineTo(-8, 24); ctx.lineTo(8, 24); ctx.lineTo(18, 18); ctx.stroke();
  } else if (iconName === 'language') {
    ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 10 + 2 * Math.sin(a), 23, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-21, 0); ctx.lineTo(21, 0); ctx.stroke();
    roundRect(ctx, -29, -27, 18, 13, 5); ctx.stroke();
    roundRect(ctx, 11, 14, 18, 13, 5); ctx.stroke();
  } else if (iconName === 'transformer') {
    [-19, 0, 19].forEach((dy, i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      roundRect(ctx, -18, dy - 6, 36, 12, 4); ctx.stroke();
    });
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(-25, -19); ctx.lineTo(25, 19); ctx.moveTo(25, -19); ctx.lineTo(-25, 19); ctx.stroke();
  } else if (iconName === 'attention') {
    const pts = [[-22, -13], [0, -20], [21, -9], [-12, 16], [14, 17]];
    ctx.beginPath(); pts.forEach(([dx, dy]) => { ctx.moveTo(0, 0); ctx.lineTo(dx, dy); }); ctx.stroke();
    pts.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, dy, 4.5, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.stroke();
  } else if (iconName === 'memory') {
    [-12, 0, 12].forEach((dy, i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a - i));
      roundRect(ctx, -25 + i * 3, dy - 6, 50 - i * 6, 12, 4); ctx.stroke();
    });
  } else if (iconName === 'retrieval') {
    ctx.beginPath(); ctx.ellipse(-5, -13, 18, 7, 0, 0, Math.PI * 2); ctx.moveTo(-23, -13); ctx.lineTo(-23, 5); ctx.ellipse(-5, 5, 18, 7, 0, 0, Math.PI); ctx.moveTo(13, -13); ctx.lineTo(13, 5); ctx.stroke();
    ctx.beginPath(); ctx.arc(15, 12, 9, 0, Math.PI * 2); ctx.stroke(); ctx.moveTo(21, 18); ctx.lineTo(28, 25); ctx.stroke();
  } else if (iconName === 'reasoning') {
    ctx.beginPath(); ctx.moveTo(-23, -14); ctx.quadraticCurveTo(-5, -14, 0, 0); ctx.quadraticCurveTo(5, 14, 23, 14); ctx.stroke();
    [-23, 0, 23].forEach((dx, i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, i === 1 ? 0 : i === 0 ? -14 : 14, 5, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'confidence') {
    ctx.beginPath(); ctx.arc(0, 8, 24, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(15 * Math.cos(-Math.PI + pulse * Math.PI), 8 + 15 * Math.sin(-Math.PI + pulse * Math.PI)); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 8, 4, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'workflow') {
    const boxes = [[-25, -14], [0, 14], [25, -14]];
    ctx.beginPath(); ctx.moveTo(-15, -14); ctx.lineTo(-10, -14); ctx.moveTo(10, 14); ctx.lineTo(15, 14); ctx.stroke();
    boxes.forEach(([dx, dy], i) => { ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i)); roundRect(ctx, dx - 7, dy - 7, 14, 14, 3); ctx.stroke(); });
  } else if (iconName === 'guardrail') {
    ctx.beginPath(); ctx.moveTo(-22, -25); ctx.lineTo(-22, 25); ctx.moveTo(22, -25); ctx.lineTo(22, 25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16, 17); ctx.quadraticCurveTo(0, -17, 16, 17); ctx.stroke();
    ctx.globalAlpha = 0.45 + 0.55 * pulse; ctx.beginPath(); ctx.arc(0, -3, 4, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'battery') {
    roundRect(ctx, -26, -17, 48, 34, 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(22, -7); ctx.lineTo(28, -7); ctx.lineTo(28, 7); ctx.lineTo(22, 7); ctx.stroke();
    ctx.globalAlpha = 0.4 + 0.6 * pulse; roundRect(ctx, -20, -10, 28 * pulse, 20, 3); ctx.stroke();
  } else if (iconName === 'storage') {
    roundRect(ctx, -26, -18, 52, 36, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-17, -3); ctx.lineTo(17, -3); ctx.moveTo(-17, 7); ctx.lineTo(17, 7); ctx.stroke();
    ctx.globalAlpha = 0.45 + 0.55 * pulse; ctx.beginPath(); ctx.arc(17, -11, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'firmware') {
    roundRect(ctx, -17, -17, 34, 34, 5); ctx.stroke();
    for (let i = -11; i <= 11; i += 11) { ctx.beginPath(); ctx.moveTo(-25, i); ctx.lineTo(-17, i); ctx.moveTo(17, i); ctx.lineTo(25, i); ctx.moveTo(i, -25); ctx.lineTo(i, -17); ctx.moveTo(i, 17); ctx.lineTo(i, 25); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
  } else if (iconName === 'provisioning') {
    roundRect(ctx, -25, -19, 28, 38, 6); ctx.stroke();
    ctx.beginPath(); ctx.arc(11, -1, 10, Math.PI * 0.25, Math.PI * 1.75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(16, 8); ctx.lineTo(25, 17); ctx.lineTo(29, 13); ctx.stroke();
    ctx.globalAlpha = 0.5 + 0.5 * pulse; ctx.beginPath(); ctx.arc(-11, -1, 3, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'sync') {
    ctx.beginPath(); ctx.arc(0, 0, 22, -2.5, 0.35); ctx.stroke(); ctx.moveTo(15, -17); ctx.lineTo(24, -15); ctx.lineTo(21, -6);
    ctx.arc(0, 0, 22, 0.65, 3.5); ctx.stroke(); ctx.moveTo(-15, 17); ctx.lineTo(-24, 15); ctx.lineTo(-21, 6); ctx.stroke();
  } else if (iconName === 'webhook') {
    ctx.beginPath(); ctx.moveTo(-22, -16); ctx.quadraticCurveTo(-6, -16, -6, 0); ctx.quadraticCurveTo(-6, 16, 10, 16); ctx.lineTo(21, 16); ctx.stroke();
    ctx.beginPath(); ctx.arc(21, 16, 4, 0, Math.PI * 2); ctx.fill();
    [-12, 0, 12].forEach((dy, i) => { ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(a + i)); ctx.beginPath(); ctx.moveTo(6, dy - 3); ctx.lineTo(12, dy - 3); ctx.stroke(); });
  } else if (iconName === 'websocket') {
    ctx.beginPath(); ctx.moveTo(-27, -12); ctx.lineTo(-13, -12); ctx.lineTo(-7, -20); ctx.lineTo(2, -4); ctx.lineTo(10, -12); ctx.lineTo(27, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-27, 12); ctx.lineTo(-10, 12); ctx.lineTo(-2, 4); ctx.lineTo(7, 20); ctx.lineTo(13, 12); ctx.lineTo(27, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-27, -12); ctx.lineTo(-20, -17); ctx.moveTo(27, 12); ctx.lineTo(20, 17); ctx.stroke();
  } else if (iconName === 'credential') {
    roundRect(ctx, -27, -17, 54, 34, 6); ctx.stroke();
    ctx.beginPath(); ctx.arc(-10, 0, 6, 0, Math.PI * 2); ctx.stroke(); ctx.moveTo(-4, 0); ctx.lineTo(10, 0); ctx.lineTo(14, 5); ctx.stroke();
    ctx.globalAlpha = 0.5 + 0.5 * pulse; ctx.beginPath(); ctx.arc(17, -8, 2.5, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'telemetry') {
    roundRect(ctx, -27, -20, 54, 40, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-19, 9); ctx.lineTo(-10, 2); ctx.lineTo(-3, 6); ctx.lineTo(7, -11); ctx.lineTo(18, -3); ctx.stroke();
    ctx.globalAlpha = 0.45 + 0.55 * pulse; ctx.beginPath(); ctx.arc(7, -11, 4, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'version') {
    roundRect(ctx, -22, -24, 34, 36, 5); ctx.stroke(); roundRect(ctx, -12, -12, 34, 36, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(3, -12); ctx.moveTo(-4, 0); ctx.lineTo(13, 0); ctx.stroke();
    ctx.globalAlpha = 0.55 + 0.45 * pulse; ctx.beginPath(); ctx.arc(18, 14, 4, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'audit') {
    ctx.beginPath(); ctx.moveTo(-22, -25); ctx.lineTo(8, -25); ctx.lineTo(20, -13); ctx.lineTo(20, 25); ctx.lineTo(-22, 25); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-13, -5); ctx.lineTo(6, -5); ctx.moveTo(-13, 5); ctx.lineTo(4, 5); ctx.stroke();
    ctx.beginPath(); ctx.arc(8, 9, 8, 0, Math.PI * 2); ctx.stroke(); ctx.moveTo(14, 15); ctx.lineTo(21, 22); ctx.stroke();
  } else if (iconName === 'queue') {
    [-16, 0, 16].forEach((dy, i) => { ctx.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(a - i)); roundRect(ctx, -22 + i * 4, dy - 5, 44 - i * 8, 10, 4); ctx.stroke(); });
  } else if (iconName === 'retry') {
    ctx.beginPath(); ctx.arc(0, 0, 23, -2.5, 0.8); ctx.stroke(); ctx.moveTo(16, -17); ctx.lineTo(24, -16); ctx.lineTo(21, -8); ctx.stroke();
    ctx.globalAlpha = 0.5 + 0.5 * pulse; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'checksum') {
    for (let x0 = -18; x0 <= 18; x0 += 12) { ctx.beginPath(); ctx.moveTo(x0, -18); ctx.lineTo(x0, 18); ctx.stroke(); }
    for (let y0 = -18; y0 <= 18; y0 += 12) { ctx.beginPath(); ctx.moveTo(-18, y0); ctx.lineTo(18, y0); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-12, 1); ctx.lineTo(-4, 9); ctx.lineTo(13, -10); ctx.stroke();
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
  } else if (iconName === 'context') {
    roundRect(ctx, -25, -20, 38, 28, 7); ctx.stroke();
    roundRect(ctx, -13, -7, 38, 28, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, 7, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(6, -2); ctx.lineTo(6, -11); ctx.stroke();
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
  } else if (iconName === 'event') {
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -23); ctx.lineTo(0, -15); ctx.moveTo(0, 15); ctx.lineTo(0, 23); ctx.moveTo(-23, 0); ctx.lineTo(-15, 0); ctx.moveTo(15, 0); ctx.lineTo(23, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-13, -13); ctx.lineTo(-8, -8); ctx.moveTo(13, -13); ctx.lineTo(8, -8); ctx.moveTo(-13, 13); ctx.lineTo(-8, 8); ctx.moveTo(13, 13); ctx.lineTo(8, 8); ctx.stroke();
  } else if (iconName === 'heartbeat') {
    ctx.beginPath(); ctx.moveTo(-28, 2); ctx.lineTo(-17, 2); ctx.lineTo(-10, -13); ctx.lineTo(0, 18); ctx.lineTo(10, -7); ctx.lineTo(16, 2); ctx.lineTo(28, 2); ctx.stroke();
    ctx.globalAlpha = 0.45 + 0.55 * pulse;
    ctx.beginPath(); ctx.arc(0, 18, 3.5, 0, Math.PI * 2); ctx.fill();
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
  } else if (iconName === 'miss') {
    ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16, -16); ctx.lineTo(16, 16); ctx.stroke();
    ctx.globalAlpha = 0.45 + 0.55 * pulse;
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
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
  } else if (iconName === 'omni') {
    const pts = [[0, -19], [19, 0], [0, 19], [-19, 0]];
    ctx.beginPath(); pts.forEach(([dx, dy]) => { ctx.moveTo(0, 0); ctx.lineTo(dx, dy); }); ctx.stroke();
    roundRect(ctx, -9, -9, 18, 18, 5); ctx.stroke();
    pts.forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
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
  } else if (iconName === 'fleet') {
    const devices = [[-19, 8], [0, -10], [19, 8]];
    ctx.beginPath(); ctx.moveTo(-19, 8); ctx.lineTo(0, -10); ctx.lineTo(19, 8); ctx.stroke();
    devices.forEach(([dx, dy], i) => {
      roundRect(ctx, dx - 9, dy - 8, 18, 16, 4); ctx.stroke();
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, dy, 2.5, 0, Math.PI * 2); ctx.fill();
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
  } else if (iconName === 'bluetooth') {
    const sway = Math.sin(a) * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -27); ctx.lineTo(0, 27);
    ctx.moveTo(0, -27); ctx.lineTo(15 + sway, -14); ctx.lineTo(0, 0); ctx.lineTo(15 - sway, 14); ctx.lineTo(0, 27);
    ctx.moveTo(-16, -14); ctx.lineTo(15 + sway, 14);
    ctx.moveTo(-16, 14); ctx.lineTo(15 - sway, -14);
    ctx.stroke();
  } else if (iconName === 'wifi') {
    [29, 20, 11].forEach((r, i) => {
      ctx.globalAlpha = 0.3 + 0.7 * clamp(pulse * 2.4 - i * 0.42, 0, 1);
      ctx.beginPath(); ctx.arc(0, 18, r, -2.36, -0.78); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(0, 18, 4, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'cellular') {
    ctx.beginPath(); ctx.moveTo(0, -25); ctx.lineTo(0, 25); ctx.moveTo(-11, 25); ctx.lineTo(0, 5); ctx.lineTo(11, 25); ctx.stroke();
    [13, 23].forEach((r, i) => {
      ctx.globalAlpha = 0.3 + 0.6 * (0.5 + 0.5 * Math.sin(a - i));
      ctx.beginPath(); ctx.arc(0, -16, r, -0.7, 0.7); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -16, r, Math.PI - 0.7, Math.PI + 0.7); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(0, -16, 4, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'api') {
    roundRect(ctx, -28, -18, 20, 36, 6); ctx.stroke();
    roundRect(ctx, 8, -18, 20, 36, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.stroke();
    [-9, 9].forEach((dy, i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(-18, dy, 3.2, 0, Math.PI * 2); ctx.arc(18, -dy, 3.2, 0, Math.PI * 2); ctx.fill();
    });
  } else if (iconName === 'sdk') {
    roundRect(ctx, -25, -22, 50, 44, 8); ctx.stroke();
    [[-13, -9], [5, -9], [-13, 9], [5, 9]].forEach(([dx, dy], i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i * 0.7));
      roundRect(ctx, dx - 5, dy - 5, 10, 10, 2); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(-31, -9); ctx.lineTo(-25, -9); ctx.moveTo(25, 9); ctx.lineTo(31, 9); ctx.stroke();
  } else if (iconName === 'wearable') {
    roundRect(ctx, -11, -29, 22, 58, 8); ctx.stroke();
    roundRect(ctx, -19, -17, 38, 34, 10); ctx.stroke();
    ctx.globalAlpha = 0.45 + 0.55 * pulse;
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 2.8, 0, Math.PI * 2); ctx.fill();
  } else if (iconName === 'upload') {
    ctx.beginPath(); ctx.moveTo(-25, 8); ctx.lineTo(-25, 24); ctx.lineTo(25, 24); ctx.lineTo(25, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(0, -24); ctx.moveTo(-11, -13); ctx.lineTo(0, -24); ctx.lineTo(11, -13); ctx.stroke();
    ctx.globalAlpha = 0.4 + 0.6 * pulse;
    ctx.beginPath(); ctx.moveTo(-16, 14); ctx.lineTo(16, 14); ctx.stroke();
  } else if (iconName === 'function-call') {
    roundRect(ctx, -11, -11, 22, 22, 6); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-28, 0); ctx.lineTo(-11, 0); ctx.moveTo(11, 0); ctx.lineTo(28, 0);
    ctx.moveTo(20, -8); ctx.lineTo(28, 0); ctx.lineTo(20, 8);
    ctx.stroke();
    [-28, 0].forEach((dx, i) => {
      ctx.globalAlpha = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(a + i));
      ctx.beginPath(); ctx.arc(dx, 0, i ? 4 : 3.5, 0, Math.PI * 2); ctx.fill();
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
  CANVAS_ICON_MOTION,
  ICON_ALIASES,
  VISUAL_COLORS,
  fallbackIconFor,
  matchSemanticIcon,
  semanticIconFor,
  resolveIconName,
  drawCanvasIcon
};
