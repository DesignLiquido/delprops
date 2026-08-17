// Ajusta ./dist/package.json apos copia do package.json raiz.
// Motivo: release-it publica com cwd=./dist (npm.publishPath), entao
// caminhos como "dist/index.js" ou "files": ["dist/", "bin/"] (corretos
// na raiz) ficam errados dentro de ./dist e resultam em pacote vazio.
const fs = require('fs');
const path = require('path');

const caminhoPacoteDist = path.join(__dirname, '..', 'dist', 'package.json');
const pacote = JSON.parse(fs.readFileSync(caminhoPacoteDist, 'utf-8'));

pacote.main = pacote.main.replace(/^dist\//, '');
pacote.types = pacote.types.replace(/^dist\//, '');
// bin ja aponta para "./bin/delprops.js", correto pois bin/ e copiado
// para dentro de ./dist pelo hook after:bump.
pacote.files = ['**/*.js', '**/*.d.ts', '**/*.js.map', 'bin/', 'README.md'];

fs.writeFileSync(caminhoPacoteDist, JSON.stringify(pacote, null, 4) + '\n');
