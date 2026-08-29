/**
 * RF-02: PDF Parser Module (Rewritten for actual PDF structure)
 * Handles: "Grade Horária - DIA" header format with class columns
 *
 * Output: array of raw rows with fields:
 *   turma, periodo, dia, horario, areaId, disciplinaOriginal,
 *   professorOriginal, sala, observacoes
 */

class PDFParser {
  constructor(config = {}) {
    this.pdfjs = config.pdfjsLib || (typeof window !== 'undefined' ? window.pdfjsLib : null);
    this.debug = config.debug || false;
    this.minTableRows = config.minTableRows || 3;
    this.maxPages = config.maxPages || 20;

    // Days of week patterns
    this.daysOfWeek = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

    // Time slot patterns (with ordinal numbers)
    this.timeSlots = [
      { pattern: 'AULA 1', order: 1 },
      { pattern: 'AULA 2', order: 2 },
      { pattern: 'AULA 3', order: 3 },
      { pattern: 'INTERVALO', order: 3.5 },
      { pattern: 'AULA 4', order: 4 },
      { pattern: 'AULA 5', order: 5 },
      { pattern: 'AULA 6', order: 6 },
      { pattern: 'ALMOÇO', order: 6.5 },
      { pattern: 'AULA 7', order: 7 },
      { pattern: 'AULA 8', order: 8 },
      { pattern: 'AULA 9', order: 9 },
      { pattern: 'AULA 10', order: 10 }
    ];

    // Class pattern for detection
    this.classPattern = /(\d[º°]\s*(?:ANO|ano)\s*[-–]\s*\d{2,3})/i;
  }

  /**
   * Main entry point: parse PDF file → array of raw rows
   * CRITICAL FIX: Process each page SEPARATELY to avoid mixing
   * data from different days (one page = one day in Grade Horária PDFs)
   */
  async parseFile(pdfFile) {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await this.pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = Math.min(pdf.numPages, this.maxPages);

    if (this.debug) console.log(`[PDFParser] Processing ${numPages} pages SEPARATELY (Grade Horária format)...`);

    const allRows = [];

    // Process each page INDEPENDENTLY (each page = one day)
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageItems = [];
      for (const item of textContent.items) {
        if (item.str && item.str.trim()) {
          pageItems.push({
            text: item.str.trim(),
            x: Math.round(item.transform[4]),
            y: Math.round(item.transform[5]),
            page: pageNum
          });
        }
      }

      if (pageItems.length === 0) {
        if (this.debug) console.log(`[PDFParser] Page ${pageNum}: empty, skipping`);
        continue;
      }

      if (this.debug) {
        console.log(`[PDFParser] === Page ${pageNum}: ${pageItems.length} items ===`);
      }

      // Parse this page's Grade Horária structure
      const pageRows = this._parseGradeHoraria(pageItems);
      allRows.push(...pageRows);

      if (this.debug) {
        console.log(`[PDFParser] Page ${pageNum}: extracted ${pageRows.length} rows`);
      }
    }

    if (allRows.length < this.minTableRows) {
      throw new Error(
        `Nenhuma tabela detectada no PDF — apenas ${allRows.length} linhas válidas encontradas. ` +
        `Verifique se o PDF contém uma tabela legível.`
      );
    }

    if (this.debug) console.log(`[PDFParser] Total extracted across all pages: ${allRows.length} rows`);
    return allRows;
  }

  /**
   * Parse "Grade Horária" structure:
   * - "Grade Horária - DIA" headers mark day changes
   * - Class headers (1º ANO - 101, etc) in a row
   * - AULA X followed by data rows (professor, discipline, room) below
   *
   * KEY FIX: Professor, Discipline, Room are in DIFFERENT Y-groups
   * Must collect multiple Y-groups after AULA marker for complete row
   */
  _parseGradeHoraria(items) {
    const rows = [];

    // Group by Y coordinate to find rows
    const yGroups = this._groupByY(items);
    const sortedYs = Array.from(yGroups.entries()).sort((a, b) => b[0] - a[0]);

    if (this.debug) {
      console.log(`[PDFParser] Y-grouping: ${sortedYs.length} groups found`);
      console.log(`[PDFParser] Sample groups:`);
      sortedYs.slice(0, 10).forEach(([y, grp]) => {
        console.log(`  Y=${y}: ${grp.map(i => i.text).join(' | ').substring(0, 80)}`);
      });
    }

    // Find class headers (row with multiple classes)
    const classHeaderY = this._findClassHeaderRow(sortedYs);
    if (!classHeaderY) {
      if (this.debug) console.log(`[PDFParser] No class header row found!`);
      return [];
    }

    const classItems = yGroups.get(classHeaderY);
    classItems.sort((a, b) => a.x - b.x);
    const classColumns = classItems
      .filter(item => this.classPattern.test(item.text))
      .map(item => ({ turma: item.text, x: item.x }));

    if (this.debug) {
      console.log(`[PDFParser] Class header at Y=${classHeaderY}: ${classColumns.length} classes`);
      console.log(`[PDFParser] Classes: ${classColumns.map(c => c.turma).join(', ')}`);
    }

    // Create index for faster Y-group lookup
    const yGroupsMap = new Map(sortedYs);
    const ySorted = sortedYs.map(([y, _]) => y);

    // Process rows: look for day markers and data
    let currentDay = '';
    let currentHour = '';
    let currentHourOrder = 0;

    for (let i = 0; i < sortedYs.length; i++) {
      const [y, itemsInLine] = sortedYs[i];

      if (y === classHeaderY) continue; // Skip class header row

      const texts = itemsInLine.map(i => i.text);
      const fullText = texts.join(' ').toLowerCase();

      // Check if this is a day header ("Grade Horária - SEGUNDA")
      const dayMatch = this._detectDayFromHeader(fullText);
      if (dayMatch) {
        currentDay = dayMatch;
        if (this.debug) console.log(`[PDFParser] Day found: ${currentDay}`);
        continue;
      }

      // Check if this is a time slot marker (AULA 1, AULA 2, etc)
      const timeMatch = this._detectTimeSlot(fullText);
      if (timeMatch) {
        currentHour = timeMatch.pattern;
        currentHourOrder = timeMatch.order;
        if (this.debug) console.log(`[PDFParser] Time slot: ${currentHour}`);

        // After AULA marker, collect the next 2-3 Y-groups for data rows
        if (currentDay && i + 1 < sortedYs.length) {
          const dataYGroups = sortedYs.slice(i + 1, Math.min(i + 4, sortedYs.length));
          this._extractDataRowsFromGroups(
            dataYGroups,
            classColumns,
            currentDay,
            currentHour,
            currentHourOrder,
            rows
          );
        }
        continue;
      }
    }

    return rows;
  }

  /**
   * Extract data from multiple Y-groups after an AULA marker
   * Intelligently identifies which Y-group contains professor, discipline, room
   * based on content matching (not just position)
   */
  _extractDataRowsFromGroups(yGroups, classColumns, day, hour, hourOrder, outputRows) {
    // Calculate column width based on class spacing for adaptive tolerance
    const colTolerance = this._calculateColumnTolerance(classColumns);

    // For each class column, try to find corresponding data across Y-groups
    for (const classCol of classColumns) {
      const candidates = [];

      // Collect items for this class column from each Y-group
      for (const [y, itemsInLine] of yGroups) {
        const columnItems = itemsInLine.filter(item =>
          Math.abs(item.x - classCol.x) < colTolerance
        ).sort((a, b) => Math.abs(a.x - classCol.x) - Math.abs(b.x - classCol.x));

        if (columnItems.length > 0) {
          const text = columnItems[0].text;
          // Skip time markers and empty cells
          if (text && !text.match(/AULA|INTERVALO|ALMOÇO|^(\d{1,2}):(\d{2})|^-$|^\s*$/)) {
            candidates.push({
              text,
              y,
              isTimeRange: /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/.test(text)
            });
          }
        }
      }

      // Filter out time ranges (informative only)
      const data = candidates.filter(c => !c.isTimeRange);

      // Smart classification: identify professor and discipline by content
      let professor = '';
      let discipline = '';
      let sala = '';

      // Common discipline keywords (Portuguese)
      const discKeywords = /matemática|português|inglês|geografia|história|biologia|química|física|sociologia|filosofia|artes|educação|eletiva|aproveitamento|aprofundamento|aprof\./i;

      for (const item of data) {
        if (discKeywords.test(item.text)) {
          discipline = item.text;
        } else if (item.text.length >= 3 && !professor) {
          // Assume first non-discipline item is professor
          professor = item.text;
        }
      }

      // If we couldn't identify, use positional fallback
      if (!discipline && data.length > 0) {
        discipline = data[0].text;
      }
      if (!professor && data.length > 1) {
        professor = data[1].text;
      }

      // Create row if we have at least professor and discipline
      if (professor && discipline && discipline.length > 2) {
        const row = {
          turma: classCol.turma,
          periodo: this._getPeriodo(hourOrder),
          dia: day,
          horario: Math.round(hourOrder),
          areaId: this._detectArea(discipline),
          disciplinaOriginal: discipline,
          professorOriginal: professor,
          sala: sala,
          observacoes: ''
        };
        outputRows.push(row);

        if (this.debug) {
          console.log(`[PDFParser] Row: ${classCol.turma} | ${day} | ${hour} | ${professor} | ${discipline} | ${sala}`);
        }
      }
    }
  }

  /**
   * Calculate adaptive column tolerance based on spacing between class columns
   * Uses half the minimum distance between adjacent columns to avoid overlap
   */
  _calculateColumnTolerance(classColumns) {
    if (classColumns.length < 2) return 40; // Default fallback

    const sorted = [...classColumns].sort((a, b) => a.x - b.x);
    let minGap = Infinity;
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].x - sorted[i - 1].x;
      if (gap > 0 && gap < minGap) minGap = gap;
    }

    // Use 40% of minimum gap to avoid bleeding into adjacent columns
    const tolerance = Math.max(15, Math.floor(minGap * 0.4));
    if (this.debug) console.log(`[PDFParser] Column tolerance: ±${tolerance}px (gap=${minGap}px)`);
    return tolerance;
  }

  /**
   * Find the Y coordinate of the class header row
   */
  _findClassHeaderRow(yGroups) {
    for (const [y, items] of yGroups) {
      const classMatches = items.filter(item => this.classPattern.test(item.text));
      if (classMatches.length >= 2) {
        return y;
      }
    }
    return null;
  }

  /**
   * Detect day from "Grade Horária - SEGUNDA" style header
   */
  _detectDayFromHeader(text) {
    // Look for "grade horária" followed by a day
    if (text.includes('grade horária')) {
      for (const day of this.daysOfWeek) {
        if (text.includes(day)) {
          return day.charAt(0).toUpperCase() + day.slice(1);
        }
      }
    }

    // Also check direct day mentions (fallback)
    for (const day of this.daysOfWeek) {
      if (text === day || text.includes(day)) {
        return day.charAt(0).toUpperCase() + day.slice(1);
      }
    }

    return null;
  }

  /**
   * Detect time slot (AULA X, INTERVALO, ALMOÇO)
   */
  _detectTimeSlot(text) {
    const upper = text.toUpperCase();
    for (const slot of this.timeSlots) {
      if (upper.includes(slot.pattern)) {
        return slot;
      }
    }
    return null;
  }

  /**
   * Group items by Y coordinate (horizontal lines)
   */
  _groupByY(items) {
    const tolerance = 3;
    const groups = new Map();

    for (const item of items) {
      let found = false;
      for (const [y] of groups) {
        if (Math.abs(y - item.y) < tolerance) {
          groups.get(y).push(item);
          found = true;
          break;
        }
      }
      if (!found) {
        groups.set(item.y, [item]);
      }
    }

    return groups;
  }

  /**
   * Determine period from hour order
   */
  _getPeriodo(hour) {
    if (hour >= 1 && hour <= 3.5) return 'Manhã';
    if (hour >= 4 && hour <= 6.5) return 'Tarde';
    return 'Noite';
  }

  /**
   * Detect area from discipline name
   */
  _detectArea(discipline) {
    const disc = discipline.toLowerCase();
    if (disc.includes('português') || disc.includes('inglês') || disc.includes('literatura')) return 'linguagens';
    if (disc.includes('matemática') || disc.includes('raciocínio')) return 'matematica';
    if (disc.includes('biologia') || disc.includes('química') || disc.includes('física')) return 'natureza';
    if (disc.includes('história') || disc.includes('geografia') || disc.includes('sociologia')) return 'humanas';
    if (disc.includes('eletiva') || disc.includes('clube')) return 'eletiva';
    if (disc.includes('ppa') || disc.includes('planejamento')) return 'planejamento';
    return 'outro';
  }

  /**
   * Fallback: extract raw text from PDF
   */
  async extractRawText(pdfFile) {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await this.pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= Math.min(pdf.numPages, this.maxPages); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n---PAGE_BREAK---\n';
    }

    return fullText;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFParser;
}
