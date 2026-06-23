export function cleanPdfText(text) {
  if (!text) return '';

  const rawLines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(l => l.trim());

  const paragraphs = [];
  let current = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    if (line === '') {
      if (current.length === 0) continue;

      const prev = current[current.length - 1];
      const next = rawLines.slice(i + 1).find(l => l !== '') || '';

      const endsWithPunct  = /[.!?""»]$/.test(prev);
      const nextIsNumbered = /^\d+[.)]\s/.test(next);

      if (endsWithPunct || nextIsNumbered) {
        paragraphs.push(joinLines(current));
        current = [];
      }
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) paragraphs.push(joinLines(current));

  return paragraphs.filter(p => p).join('\n\n');
}

function joinLines(lines) {
  let result = '';
  for (let i = 0; i < lines.length; i++) {
    if (i === 0) { result = lines[i]; continue; }
    if (result.endsWith('-')) {
      result = result.slice(0, -1) + lines[i];
    } else {
      result = result + ' ' + lines[i];
    }
  }
  return result.replace(/\s+/g, ' ').trim();
}
