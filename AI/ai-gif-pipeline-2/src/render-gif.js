const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { layoutDiagram } = require('./layout-diagram');

const [, , diagramPath = 'diagram.json', htmlPath = 'public/diagram.html', framesDir = 'frames', outputPath = 'output.gif'] = process.argv;
const diagram = layoutDiagram(JSON.parse(fs.readFileSync(diagramPath, 'utf8')));
const absoluteHtml = path.resolve(htmlPath);
const absoluteFrames = path.resolve(framesDir);
fs.rmSync(absoluteFrames, { recursive: true, force: true });
fs.mkdirSync(absoluteFrames, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: diagram.width, height: diagram.height }, deviceScaleFactor: 1 });
  await page.goto(`file://${absoluteHtml}`);
  await page.waitForFunction(() => document.fonts?.status !== 'loading');

  const totalFrames = Math.ceil(diagram.duration * diagram.fps);
  for (let frame = 0; frame < totalFrames; frame += 1) {
    await page.evaluate((time) => window.setDiagramTime(time), frame / diagram.fps);
    await page.screenshot({ path: path.join(absoluteFrames, `frame-${String(frame).padStart(5, '0')}.png`) });
  }
  await browser.close();

  const palette = `${absoluteFrames}/palette.png`;
  execFileSync('ffmpeg', ['-y', '-framerate', String(diagram.fps), '-i', `${absoluteFrames}/frame-%05d.png`, '-vf', 'palettegen=max_colors=128', palette], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-framerate', String(diagram.fps), '-i', `${absoluteFrames}/frame-%05d.png`, '-i', palette, '-lavfi', 'paletteuse=dither=sierra2_4a', '-loop', '0', outputPath], { stdio: 'inherit' });
  fs.rmSync(palette, { force: true });
  console.log(`Wrote ${outputPath}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
