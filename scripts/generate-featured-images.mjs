import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const posts = [
  {
    slug: "realtime-speech-ai-control-stack",
    file: "src/content/blog/realtime-speech-ai-control-stack.mdx",
    theme: "control",
    alt: "Futuristic control room showing realtime speech AI as a layered control stack",
    prompt: [
      "16:9 featured image for an English technology research blog titled Realtime Speech AI Is Becoming a Control Stack.",
      "Scene: a futuristic orbital control room with a robot operator, holographic audio waveform entering layered transparent AI modules: ASR transcript grid, audio reasoning core, realtime speech loop, secure tool gateway.",
      "Mood: science fiction, machine intelligence, productivity systems, cosmic starfield, precise luminous circuitry, blue cyan violet accents.",
      "Composition: cinematic editorial hero image, strong central depth, clean negative space for title overlay, no readable text, no logos, no brands, no watermark."
    ].join(" ")
  },
  {
    slug: "emotion-aware-asr-research-digest",
    file: "src/content/blog/emotion-aware-asr-research-digest.mdx",
    theme: "emotion",
    alt: "Futuristic AI laboratory visualizing emotion-aware ASR signals and speech emotion recognition",
    prompt: [
      "16:9 featured image for an English research digest about emotion-aware ASR and speech emotion recognition.",
      "Scene: advanced AI lab inside a spacecraft observatory, speech waveforms split into transcript tokens, prosody curves, arousal and valence constellations, an elegant humanoid robot analyzing acoustic emotion signals.",
      "Mood: futuristic, scientific, empathetic machine intelligence, cosmic neural map, clean high-tech instrumentation.",
      "Composition: premium editorial cover, luminous cyan magenta gold accents, no readable text, no labels, no logos, no watermark."
    ].join(" ")
  },
  {
    slug: "wake-words-intent-gates-voice-assistants",
    file: "src/content/blog/wake-words-intent-gates-voice-assistants.mdx",
    theme: "wake",
    alt: "Futuristic voice assistant intent gate with wake word detection and edge AI devices",
    prompt: [
      "16:9 featured image for an English research blog about wake word detection becoming intent gating for voice assistants.",
      "Scene: a constellation of edge AI devices and small robots listening in a starship home, audio ripples pass through glowing security gates, confidence thresholds, and intent filters before reaching a central assistant core.",
      "Mood: futuristic edge AI, secure voice interface, space-age smart home, productivity and privacy.",
      "Composition: clean high-tech editorial hero, layered gates and waveforms, cosmic background, no readable text, no logos, no brands, no watermark."
    ].join(" ")
  },
  {
    slug: "from-chinese-to-english-and-a-detour-into-moroccan-arabic",
    file: "src/content/blog/from-chinese-to-english-and-a-detour-into-moroccan-arabic.mdx",
    theme: "localization",
    alt: "Futuristic AI video localization pipeline from Chinese to English and Moroccan Arabic",
    prompt: [
      "16:9 featured image for an English blog about AI video localization from Chinese to English and Moroccan Arabic Darija.",
      "Scene: a futuristic multilingual media production deck orbiting Earth, holographic video timeline, cloned voice waveform, language streams branching across Asia, Europe, and North Africa, robotic production assistants synchronizing subtitles and speech.",
      "Mood: cinematic, technological, global, interstellar localization studio, productive AI machines.",
      "Composition: refined editorial cover, no readable text, no country flags, no logos, no brands, no watermark."
    ].join(" ")
  },
  {
    slug: "how-otter.ai-handles-in-person-meetings",
    file: "src/content/blog/how-otter.ai-handles-in-person-meetings.mdx",
    theme: "meeting",
    alt: "Futuristic meeting room AI capture system with robots and spatial microphones",
    prompt: [
      "16:9 featured image for an English product analysis blog about in-person meeting transcription and meeting room AI capture.",
      "Scene: futuristic glass conference room aboard a space station, tabletop spatial microphone array, holographic speaker diarization rings, meeting notes forming as abstract light panels, quiet robot assistant observing the room.",
      "Mood: productivity, meeting intelligence, hardware AI, sleek future workplace, cosmic city outside the window.",
      "Composition: premium editorial hero image, realistic high-tech style, no readable text, no logos, no brands, no watermark."
    ].join(" ")
  }
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const entries = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equals = trimmed.indexOf("=");
    if (equals < 0) continue;
    const key = trimmed.slice(0, equals).trim();
    const value = trimmed.slice(equals + 1).trim().replace(/^['"]|['"]$/g, "");
    entries[key] = value;
  }
  return entries;
}

const env = {
  ...loadEnvFile(path.join(rootDir, ".env")),
  ...loadEnvFile(path.join(rootDir, "AI", "ai-gif-pipeline-1", ".env")),
  ...loadEnvFile(path.join(rootDir, "AI", "ai-gif-pipeline-2", ".env")),
  ...loadEnvFile(path.join(rootDir, "AI", "ai-gif-pipeline-3", ".env")),
  ...loadEnvFile(path.join(rootDir, "scripts", ".env")),
  ...process.env
};

const allowLocalFallback = process.argv.includes("--allow-local-fallback");
const requestTimeoutMs = Number(env.OPENAI_IMAGE_TIMEOUT_MS || 180000);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function imageModels() {
  const envImageModel = env.OPENAI_IMAGE_MODEL || (/^gpt-image-/i.test(env.OPENAI_MODEL || "") ? env.OPENAI_MODEL : "");
  return unique([
    envImageModel,
    "gpt-image-2"
  ]);
}

function apiBaseUrls() {
  const raw = env.OPENAI_IMAGE_URL || env.OPENAI_IMAGE_BASE_URL || env.OPENAI_BASE_URL || env.OPENAI_URL || "https://api.openai.com/v1";
  const normalized = raw.replace(/\/$/, "");
  return unique([
    normalized,
    normalized.endsWith("/v1") ? "" : `${normalized}/v1`
  ]);
}

function displayBaseUrl(baseUrl) {
  try {
    const parsed = new URL(baseUrl);
    const pathLabel = parsed.pathname === "/v1" ? "/v1" : parsed.pathname && parsed.pathname !== "/" ? "/..." : "";
    return `${parsed.protocol}//${parsed.host}${pathLabel}`;
  } catch {
    return "<invalid-url>";
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (error) {
    const code = error?.cause?.code || error?.code || "";
    const hint = code ? ` (${code})` : "";
    const message = error?.name === "AbortError"
      ? `request timed out after ${requestTimeoutMs}ms`
      : `network request failed${hint}: ${error.message}`;
    throw new Error(message);
  } finally {
    clearTimeout(timer);
  }
}

async function readImageFromUrl(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`image download failed: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function requestImage({ baseUrl, model, prompt }) {
  const response = await fetchWithTimeout(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      prompt,
      size: "1536x1024",
      quality: "high",
      output_format: "png",
      background: "opaque",
      n: 1
    })
  });
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "unknown content-type";
  if (!/json/i.test(contentType)) {
    const preview = text.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(`expected JSON from Image API, got ${response.status} ${contentType}: ${preview}`);
  }
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`invalid JSON from Image API: ${text.slice(0, 180)}`);
  }
  if (!response.ok) {
    const message = payload?.error?.message || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  const item = payload.data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
  if (item?.url) return readImageFromUrl(item.url);
  throw new Error("image response did not include b64_json or url");
}

async function generateWithFallback(prompt) {
  const failures = [];
  for (const baseUrl of apiBaseUrls()) {
    for (const model of imageModels()) {
      try {
        const buffer = await requestImage({ baseUrl, model, prompt });
        return { baseUrl, model, buffer };
      } catch (error) {
        failures.push(`${displayBaseUrl(baseUrl)} ${model}: ${error.message}`);
        if (error.status === 401 || error.status === 403) break;
      }
    }
  }
  throw new Error(`All image models failed.\n${failures.join("\n")}`);
}

function cropToFeatured(rawPath, finalPath) {
  const result = spawnSync("ffmpeg", [
    "-y",
    "-i",
    rawPath,
    "-vf",
    "crop=1536:864:0:80",
    finalPath
  ], { stdio: "pipe" });
  if (result.status === 0) return;
  fs.copyFileSync(rawPath, finalPath);
}

function updateCover(post) {
  const filePath = path.join(rootDir, post.file);
  const raw = fs.readFileSync(filePath, "utf8");
  const next = raw.replace(
    /cover:\n  src: "([^"]+)"\n  alt: "([^"]+)"\n  width: [0-9]+\n  height: [0-9]+\n  fit: "([^"]+)"/,
    [
      "cover:",
      `  src: "/media/${post.slug}/featured.png"`,
      `  alt: "${post.alt}"`,
      "  width: 1536",
      "  height: 864",
      '  fit: "cover"'
    ].join("\n")
  );
  if (next === raw) throw new Error(`Could not update cover block in ${post.file}`);
  fs.writeFileSync(filePath, next);
}

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hash(value) {
  let h = 2166136261;
  for (const char of String(value)) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function stars(seed, count = 95) {
  const random = mulberry32(hash(seed));
  return Array.from({ length: count }, (_, index) => {
    const x = Math.round(random() * 1536);
    const y = Math.round(random() * 864);
    const r = (0.7 + random() * 2.6).toFixed(2);
    const a = (0.22 + random() * 0.72).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#f7fbff" opacity="${a}"/>`;
  }).join("\n");
}

function waveform(y, color, opacity = 0.75, phase = 0) {
  const points = [];
  for (let x = 0; x <= 1536; x += 24) {
    const yy = y + Math.sin(x / 74 + phase) * 26 + Math.sin(x / 33 + phase * 0.4) * 8;
    points.push(`${x},${yy.toFixed(1)}`);
  }
  return `<polyline points="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity="${opacity}"/>`;
}

function robot(x, y, scale = 1, color = "#dff8ff", accent = "#7ce7ff") {
  return `
    <g transform="translate(${x} ${y}) scale(${scale})" opacity="0.9">
      <rect x="-62" y="-80" width="124" height="108" rx="34" fill="rgba(223,248,255,0.12)" stroke="${color}" stroke-width="4"/>
      <rect x="-42" y="-42" width="84" height="34" rx="17" fill="rgba(8,18,44,0.85)" stroke="${accent}" stroke-width="3"/>
      <circle cx="-21" cy="-25" r="6" fill="${accent}"/>
      <circle cx="21" cy="-25" r="6" fill="${accent}"/>
      <path d="M -22 5 Q 0 20 22 5" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <path d="M 0 -80 V -115" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="0" cy="-122" r="9" fill="${accent}"/>
      <path d="M -46 28 C -74 62 -80 102 -72 150 M 46 28 C 74 62 80 102 72 150" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
    </g>`;
}

function moduleBox(x, y, w, h, stroke, fill = "rgba(255,255,255,0.055)") {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <rect x="${x + 20}" y="${y + 22}" width="${w - 40}" height="8" rx="4" fill="${stroke}" opacity=".5"/>
      <rect x="${x + 20}" y="${y + 48}" width="${w - 86}" height="6" rx="3" fill="#ffffff" opacity=".24"/>
      <rect x="${x + 20}" y="${y + 70}" width="${w - 58}" height="6" rx="3" fill="#ffffff" opacity=".18"/>
    </g>`;
}

function gates(x, y, count, color) {
  return Array.from({ length: count }, (_, i) => {
    const dx = i * 116;
    return `<g transform="translate(${x + dx} ${y})">
      <rect x="-34" y="-92" width="68" height="184" rx="34" fill="rgba(255,255,255,.035)" stroke="${color}" stroke-width="4"/>
      <circle cx="0" cy="-44" r="8" fill="${color}" opacity=".85"/>
      <circle cx="0" cy="0" r="8" fill="${color}" opacity=".65"/>
      <circle cx="0" cy="44" r="8" fill="${color}" opacity=".45"/>
    </g>`;
  }).join("\n");
}

function arcs(cx, cy, color) {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="410" ry="146" fill="none" stroke="${color}" stroke-width="3" opacity=".42"/>
    <ellipse cx="${cx}" cy="${cy}" rx="300" ry="104" fill="none" stroke="#ffffff" stroke-width="2" opacity=".16"/>
    <ellipse cx="${cx}" cy="${cy}" rx="512" ry="190" fill="none" stroke="${color}" stroke-width="2" opacity=".24"/>`;
}

function coverSvg(post) {
  const palette = {
    control: ["#0b102a", "#111d4a", "#6ff3ff", "#a874ff", "#f6c55d"],
    emotion: ["#130b2a", "#12264b", "#ff71b8", "#65f3ff", "#f6c55d"],
    wake: ["#06192a", "#102c44", "#7bf4c9", "#75a7ff", "#f7cc62"],
    localization: ["#0a1230", "#172247", "#64f2ff", "#ff8ccb", "#ffd36b"],
    meeting: ["#081622", "#152b3f", "#85e8ff", "#7ff0b1", "#c49cff"]
  }[post.theme];
  const [bg1, bg2, c1, c2, c3] = palette;
  const common = `
    <defs>
      <radialGradient id="nebula" cx="50%" cy="38%" r="75%">
        <stop offset="0%" stop-color="${c2}" stop-opacity=".34"/>
        <stop offset="38%" stop-color="${bg2}" stop-opacity=".88"/>
        <stop offset="100%" stop-color="${bg1}"/>
      </radialGradient>
      <linearGradient id="horizon" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${c1}" stop-opacity=".88"/>
        <stop offset="52%" stop-color="${c2}" stop-opacity=".75"/>
        <stop offset="100%" stop-color="${c3}" stop-opacity=".72"/>
      </linearGradient>
      <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="10" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
        <path d="M 42 0 H 0 V 42" fill="none" stroke="#ffffff" stroke-width="1" opacity=".08"/>
      </pattern>
    </defs>
    <rect width="1536" height="864" fill="url(#nebula)"/>
    <rect width="1536" height="864" fill="url(#grid)" opacity=".55"/>
    <g>${stars(post.slug)}</g>
    <circle cx="1220" cy="144" r="160" fill="${c1}" opacity=".11" filter="url(#glow)"/>
    <circle cx="220" cy="712" r="220" fill="${c2}" opacity=".10" filter="url(#glow)"/>
  `;

  const scene = {
    control: `
      ${waveform(438, c1, .75, 0.3)}
      ${moduleBox(235, 244, 228, 170, c1)}
      ${moduleBox(534, 214, 240, 196, c2)}
      ${moduleBox(846, 248, 238, 170, c3)}
      ${gates(1110, 410, 2, c1)}
      <path d="M 462 328 C 560 274 650 302 760 313 S 935 342 1044 330" fill="none" stroke="url(#horizon)" stroke-width="8" opacity=".68" filter="url(#glow)"/>
      ${robot(760, 610, 1.05, "#ecfbff", c1)}
      ${arcs(766, 610, c2)}
    `,
    emotion: `
      ${waveform(514, c1, .72, 1.6)}
      ${waveform(560, c2, .42, 2.4)}
      ${robot(376, 580, .95, "#fff3fb", c2)}
      <g filter="url(#glow)">
        <circle cx="870" cy="388" r="142" fill="none" stroke="${c1}" stroke-width="6" opacity=".62"/>
        <path d="M 760 388 C 800 308 858 494 910 364 S 1000 382 1038 314" fill="none" stroke="${c2}" stroke-width="7"/>
        <circle cx="760" cy="388" r="10" fill="${c3}"/><circle cx="910" cy="364" r="10" fill="${c3}"/><circle cx="1038" cy="314" r="10" fill="${c3}"/>
      </g>
      ${moduleBox(1034, 508, 260, 150, c2, "rgba(255,255,255,.045)")}
      ${arcs(870, 388, c1)}
    `,
    wake: `
      ${waveform(432, c1, .7, .8)}
      ${gates(510, 420, 4, c1)}
      <g filter="url(#glow)">
        <circle cx="260" cy="522" r="74" fill="rgba(255,255,255,.05)" stroke="${c2}" stroke-width="5"/>
        <circle cx="260" cy="522" r="22" fill="${c2}" opacity=".7"/>
        <circle cx="1160" cy="522" r="92" fill="rgba(255,255,255,.05)" stroke="${c3}" stroke-width="5"/>
        <path d="M 1160 470 V 574 M 1108 522 H 1212" stroke="${c3}" stroke-width="5" opacity=".55"/>
      </g>
      ${robot(760, 650, .72, "#ebfff9", c1)}
    `,
    localization: `
      ${arcs(768, 424, c1)}
      <g filter="url(#glow)">
        <circle cx="768" cy="424" r="210" fill="rgba(255,255,255,.035)" stroke="${c1}" stroke-width="5"/>
        <path d="M 560 426 C 660 352 770 346 982 390 M 580 500 C 712 560 850 548 972 480" fill="none" stroke="${c2}" stroke-width="6"/>
        <path d="M 320 610 H 650 C 756 610 804 548 888 500 C 984 444 1098 436 1228 458" fill="none" stroke="url(#horizon)" stroke-width="8" opacity=".72"/>
      </g>
      ${moduleBox(192, 250, 286, 158, c1)}
      ${moduleBox(1036, 540, 286, 158, c2)}
      ${robot(768, 686, .72, "#edfaff", c3)}
    `,
    meeting: `
      <path d="M 286 624 L 1250 624 L 1114 408 L 430 408 Z" fill="rgba(255,255,255,.055)" stroke="${c1}" stroke-width="4"/>
      <ellipse cx="768" cy="520" rx="230" ry="62" fill="rgba(255,255,255,.08)" stroke="${c2}" stroke-width="4"/>
      <circle cx="768" cy="512" r="42" fill="rgba(255,255,255,.06)" stroke="${c1}" stroke-width="5" filter="url(#glow)"/>
      <g>${[526, 642, 894, 1010].map((x, i) => `<circle cx="${x}" cy="${430 + (i % 2) * 48}" r="44" fill="rgba(255,255,255,.05)" stroke="${i % 2 ? c2 : c3}" stroke-width="4"/>`).join("")}</g>
      ${waveform(328, c1, .55, 2.1)}
      ${robot(1240, 512, .68, "#eafeff", c2)}
    `
  }[post.theme];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="864" viewBox="0 0 1536 864">
    ${common}
    <g>${scene}</g>
    <rect x="48" y="48" width="1440" height="768" rx="44" fill="none" stroke="#ffffff" stroke-width="2" opacity=".12"/>
    <rect x="0" y="0" width="1536" height="864" fill="url(#horizon)" opacity=".08"/>
  </svg>`;
}

function renderSvgToPng(svgPath, pngPath) {
  const result = spawnSync("rsvg-convert", [
    "-w",
    "1536",
    "-h",
    "864",
    "-o",
    pngPath,
    svgPath
  ], { stdio: "pipe" });
  if (result.status !== 0) throw new Error(`rsvg-convert failed for ${svgPath}`);
}

function writeLocalFallback(post, outDir) {
  const svgPath = path.join(outDir, "featured.svg");
  const pngPath = path.join(outDir, "featured.png");
  fs.writeFileSync(svgPath, coverSvg(post));
  renderSvgToPng(svgPath, pngPath);
  updateCover(post);
  console.log(`Wrote local fallback public/media/${post.slug}/featured.png`);
}

async function main() {
  for (const post of posts) {
    const outDir = path.join(rootDir, "public", "media", post.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const rawPath = path.join(outDir, "featured-raw.png");
    const finalPath = path.join(outDir, "featured.png");

    if (!env.OPENAI_API_KEY) {
      if (!allowLocalFallback) throw new Error("Missing OPENAI_API_KEY in shell, scripts/.env, root .env, or pipeline .env files.");
      writeLocalFallback(post, outDir);
      continue;
    }

    try {
      console.log(`Generating ${post.slug}...`);
      const result = await generateWithFallback(post.prompt);
      fs.writeFileSync(rawPath, result.buffer);
      cropToFeatured(rawPath, finalPath);
      fs.rmSync(rawPath, { force: true });
      fs.rmSync(path.join(outDir, "featured.svg"), { force: true });
      updateCover(post);
      console.log(`Wrote public/media/${post.slug}/featured.png using ${result.model}`);
    } catch (error) {
      if (!allowLocalFallback) throw error;
      console.warn(`OpenAI image generation failed for ${post.slug}: ${error.message}`);
      writeLocalFallback(post, outDir);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
