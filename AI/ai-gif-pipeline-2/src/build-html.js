const fs = require('fs');
const path = require('path');
const { layoutDiagram } = require('./layout-diagram');

const [, , diagramPath = 'diagram.json', outputPath = 'public/diagram.html'] = process.argv;
const diagram = layoutDiagram(JSON.parse(fs.readFileSync(diagramPath, 'utf8')));
const template = fs.readFileSync(path.join(__dirname, '..', 'templates', 'diagram.html'), 'utf8');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, template.replace('/*__DIAGRAM_JSON__*/', JSON.stringify(diagram)));
console.log(`Wrote ${outputPath}`);
