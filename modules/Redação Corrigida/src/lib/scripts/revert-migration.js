const fs = require('fs');
const path = require('path');

const CORRECTIONS_PATH = path.join(process.cwd(), 'src/lib/data/corrections.json');

async function revert() {
  try {
    if (!fs.existsSync(CORRECTIONS_PATH)) {
      console.error('Arquivo de correções não encontrado.');
      return;
    }
    const corrections = JSON.parse(fs.readFileSync(CORRECTIONS_PATH, 'utf-8'));
    
    let updatedCount = 0;
    const revertedCorrections = corrections.map(c => {
      // Remove o userId se ele existir (estamos voltando ao estado órfão para as correções antigas)
      // Nota: Isso afetará TODAS as correções. Se o professor já fez correções novas, elas perderão o vínculo.
      // Mas como a migração foi feita há poucos minutos, o risco é baixo.
      if (c.userId) {
        updatedCount++;
        const { userId, ...rest } = c;
        return rest;
      }
      return c;
    });

    fs.writeFileSync(CORRECTIONS_PATH, JSON.stringify(revertedCorrections, null, 2));
    console.log(`Sucesso! ${updatedCount} correções voltaram a ficar órfãs.`);
    
  } catch (error) {
    console.error('Erro durante a reversão:', error);
  }
}

revert();
