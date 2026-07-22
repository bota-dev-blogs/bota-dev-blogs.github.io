function matchCase(replacement, sample) {
  if (sample === sample.toUpperCase()) return replacement.toUpperCase();
  if (sample[0] === sample[0].toUpperCase()) return replacement.replace(/\b[a-z]/g, (char) => char.toUpperCase());
  return replacement;
}

function sanitizeText(value) {
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
  const exact = [
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
  text = text.replace(/\s+/g, ' ').trim();
  for (const [pattern, replacement] of exact) if (pattern.test(text)) return replacement;
  return text;
}

function sanitizeDiagram(value) {
  if (Array.isArray(value)) return value.map(sanitizeDiagram);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, sanitizeDiagram(child)]));
  }
  return sanitizeText(value);
}

if (require.main === module) {
  const [, , inputPath, outputPath = inputPath] = process.argv;
  if (!inputPath) {
    console.error('Usage: node src/sanitize-diagram.js diagram.json [output.json]');
    process.exit(1);
  }
  const diagram = JSON.parse(require('fs').readFileSync(inputPath, 'utf8'));
  require('fs').writeFileSync(outputPath, `${JSON.stringify(sanitizeDiagram(diagram), null, 2)}\n`);
}

module.exports = { sanitizeDiagram, sanitizeText };
