/**
 * Room Mapper Module
 *
 * Maps each PDF row (turma, dia, aula, professor) → sala temática
 * by looking up the professor's room in data.json.
 *
 * Input:  rawRows from PDFParser + data.json (or array of {prof, sala})
 * Output: enriched rows with sala_tematica field
 */

class RoomMapper {
  constructor(config = {}) {
    this.profSalaMap = {};       // { "LUCIDALVA": "Sala M1" }
    this.unknownProfs = new Set();
    this.debug = config.debug || false;

    if (config.profSalaMap) {
      this.profSalaMap = config.profSalaMap;
    } else if (config.slots) {
      this._buildMapFromSlots(config.slots);
    }
  }

  /**
   * Build professor → sala lookup from existing slots
   */
  _buildMapFromSlots(slots) {
    for (const slot of slots) {
      if (slot.prof && slot.sala && !this.profSalaMap[slot.prof]) {
        this.profSalaMap[slot.prof] = slot.sala;
      }
    }
    if (this.debug) {
      console.log(`[RoomMapper] Built map with ${Object.keys(this.profSalaMap).length} professors`);
    }
  }

  /**
   * Normalize text for comparison (uppercase, remove accents)
   */
  _normalize(text) {
    if (!text) return '';
    return text
      .toString()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
  }

  /**
   * Find sala for a given professor name (case-insensitive, accent-insensitive)
   */
  findSala(profName) {
    if (!profName) return null;

    const normalized = this._normalize(profName);

    // Try exact match first
    if (this.profSalaMap[profName]) {
      return this.profSalaMap[profName];
    }

    // Try normalized match
    for (const [prof, sala] of Object.entries(this.profSalaMap)) {
      if (this._normalize(prof) === normalized) {
        return sala;
      }
    }

    // Try partial match (PDF prof contains cadastro prof or vice-versa)
    for (const [prof, sala] of Object.entries(this.profSalaMap)) {
      const cadProf = this._normalize(prof);
      if (cadProf.includes(normalized) || normalized.includes(cadProf)) {
        return sala;
      }
    }

    return null;
  }

  /**
   * Main entry: map PDF rows → enriched rows with sala_tematica
   */
  mapRows(rawRows) {
    if (!rawRows || rawRows.length === 0) {
      return [];
    }

    const enriched = [];
    this.unknownProfs.clear();

    for (const row of rawRows) {
      const professor = row.professorOriginal || row.prof || '';
      const sala = this.findSala(professor);

      const enrichedRow = {
        turma: row.turma || '',
        dia: row.dia || '',
        aula: row.horario || row.aula || '',
        prof: professor,
        disc: row.disciplinaOriginal || row.disc || '',
        sala_original: row.sala || '',
        sala_tematica: sala || '',
        encontrado: !!sala
      };

      if (!sala) {
        this.unknownProfs.add(professor);
      }

      enriched.push(enrichedRow);
    }

    if (this.debug) {
      console.log(`[RoomMapper] Mapped ${enriched.length} rows`);
      console.log(`[RoomMapper] Unknown professors: ${this.unknownProfs.size}`);
    }

    return enriched;
  }

  /**
   * Deduplicate identical rows (same turma/dia/aula/prof)
   */
  deduplicate(rows) {
    const seen = new Set();
    const unique = [];

    for (const row of rows) {
      const key = `${row.turma}|${row.dia}|${row.aula}|${row.prof}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(row);
      }
    }

    if (this.debug) {
      console.log(`[RoomMapper] Deduplicated: ${rows.length} → ${unique.length}`);
    }

    return unique;
  }

  /**
   * Get summary statistics
   */
  getSummary(rows) {
    const total = rows.length;
    const mapped = rows.filter(r => r.encontrado).length;
    const unknown = rows.filter(r => !r.encontrado).length;
    const uniqueProfs = new Set(rows.map(r => r.prof)).size;
    const uniqueSalas = new Set(rows.filter(r => r.sala_tematica).map(r => r.sala_tematica)).size;

    return {
      total,
      mapped,
      unknown,
      uniqueProfs,
      uniqueSalas,
      unknownProfs: Array.from(this.unknownProfs).sort(),
      successRate: total > 0 ? Math.round((mapped / total) * 100) : 0
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoomMapper;
}
