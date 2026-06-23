const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(
  '/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/atividades',
  path.join(__dirname, 'src/components/atividades')
);

copyDir(
  '/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/src/components/aluno',
  path.join(__dirname, 'src/components/aluno')
);

console.log('Copy completed!');
