/**
 * Reference Mapper
 *
 * Usa os dados de uma escola REFERÊNCIA (que já tem prof → disciplina → sala correto)
 * para enriquecer dados extraídos do PDF.
 *
 * Estratégia:
 * 1. Constrói múltiplos índices da referência
 * 2. Para cada slot do PDF, tenta match em ordem de prioridade:
 *    a) Match EXATO (turma + dia + aula + prof) — copia disciplina + sala
 *    b) Match por (prof + disciplina aproximada) — usa sala associada
 *    c) Match só por (prof) — usa sala mais comum dele
 *    d) Sem match — retorna dados crus do PDF
 */

class ReferenceMapper {
  constructor(config = {}) {
    this.referenceSlots = config.referenceSlots || [];
    this.debug = config.debug || false;

    // Indexes (built once)
    this.byTurmaDiaAula = new Map();  // "1º ANO - 101|Segunda|1" → slot
    this.byProf = new Map();           // "VANESA" → { salas: Set, discs: Set, slots: [] }
    this.profSalaMain = new Map();     // "VANESA" → sala mais frequente

    this._buildIndexes();
  }

  _buildIndexes() {
    for (const slot of this.referenceSlots) {
      if (!slot.prof) continue;

      // Index 1: by (turma, dia, aula)
      const key = `${slot.turma}|${slot.dia}|${slot.aula}`;
      this.byTurmaDiaAula.set(key, slot);

      // Index 2: by prof
      const prof = this._normalize(slot.prof);
      if (!this.byProf.has(prof)) {
        this.byProf.set(prof, { salas: new Map(), discs: new Map(), slots: [] });
      }
      const profData = this.byProf.get(prof);
      profData.slots.push(slot);

      if (slot.sala) {
        profData.salas.set(slot.sala, (profData.salas.get(slot.sala) || 0) + 1);
      }
      if (slot.disc) {
        profData.discs.set(slot.disc, (profData.discs.get(slot.disc) || 0) + 1);
      }
    }

    // Compute most common sala per prof
    for (const [prof, data] of this.byProf) {
      let maxSala = '';
      let maxCount = 0;
      for (const [sala, count] of data.salas) {
        if (count > maxCount) { maxSala = sala; maxCount = count; }
      }
      this.profSalaMain.set(prof, maxSala);
    }

    if (this.debug) {
      console.log(`[ReferenceMapper] Built indexes: ${this.byTurmaDiaAula.size} slots, ${this.byProf.size} profs`);
    }
  }

  _normalize(text) {
    if (!text) return '';
    return text.toString().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  /**
   * Enrich a single PDF slot using reference data
   */
  enrichSlot(pdfSlot) {
    const { turma, dia, aula, prof, disc: pdfDisc } = pdfSlot;
    const profNorm = this._normalize(prof);

    // Strategy 1: Exact match (turma + dia + aula)
    const exactKey = `${turma}|${dia}|${aula}`;
    const exactMatch = this.byTurmaDiaAula.get(exactKey);
    if (exactMatch && this._normalize(exactMatch.prof) === profNorm) {
      return {
        ...pdfSlot,
        prof: exactMatch.prof,         // Use exact case from reference
        disc: exactMatch.disc,
        sala: exactMatch.sala,
        match_type: 'exact',
        match_score: 1.0
      };
    }

    // Strategy 2: Match by prof + similar discipline
    const profData = this.byProf.get(profNorm);
    if (profData) {
      // If PDF has a discipline, try to find best match in prof's disciplines
      if (pdfDisc) {
        const discNorm = this._normalize(pdfDisc);
        let bestMatch = null;
        let bestScore = 0;
        for (const [refDisc, count] of profData.discs) {
          const score = this._similarity(discNorm, this._normalize(refDisc));
          if (score > bestScore) {
            bestScore = score;
            bestMatch = refDisc;
          }
        }
        if (bestMatch && bestScore >= 0.5) {
          // Find slot with this disc to get the sala
          const slotWithDisc = profData.slots.find(s => s.disc === bestMatch);
          return {
            ...pdfSlot,
            prof: profData.slots[0].prof,
            disc: bestMatch,
            sala: slotWithDisc?.sala || this.profSalaMain.get(profNorm) || '',
            match_type: 'prof_disc',
            match_score: bestScore
          };
        }
      }

      // Strategy 3: Match by prof only - use most common (disc, sala) combo
      const mostCommonDisc = this._getMostCommon(profData.discs);
      const slotWithDisc = profData.slots.find(s => s.disc === mostCommonDisc);
      return {
        ...pdfSlot,
        prof: profData.slots[0].prof,
        disc: pdfDisc || mostCommonDisc,
        sala: slotWithDisc?.sala || this.profSalaMain.get(profNorm) || '',
        match_type: 'prof_only',
        match_score: 0.5
      };
    }

    // Strategy 4: No match - return raw PDF data with empty sala
    return {
      ...pdfSlot,
      sala: '',
      match_type: 'no_match',
      match_score: 0
    };
  }

  /**
   * Enrich all slots from PDF
   */
  enrichAll(pdfSlots) {
    const enriched = [];
    const stats = { exact: 0, prof_disc: 0, prof_only: 0, no_match: 0 };
    const unknownProfs = new Set();

    for (const slot of pdfSlots) {
      const e = this.enrichSlot(slot);
      stats[e.match_type] = (stats[e.match_type] || 0) + 1;
      if (e.match_type === 'no_match' && slot.prof) {
        unknownProfs.add(slot.prof);
      }
      enriched.push(e);
    }

    if (this.debug) {
      console.log('[ReferenceMapper] Stats:', stats);
      console.log('[ReferenceMapper] Unknown profs:', Array.from(unknownProfs));
    }

    return { enriched, stats, unknownProfs: Array.from(unknownProfs) };
  }

  /**
   * Simple similarity: 1.0 if equal, partial otherwise (substring + char overlap)
   */
  _similarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.85;

    // Char overlap
    const setA = new Set(a);
    const setB = new Set(b);
    let common = 0;
    for (const c of setA) if (setB.has(c)) common++;
    return common / Math.max(setA.size, setB.size);
  }

  _getMostCommon(map) {
    let best = '';
    let maxCount = 0;
    for (const [k, v] of map) {
      if (v > maxCount) { best = k; maxCount = v; }
    }
    return best;
  }

  /**
   * Get reference school overview for UI
   */
  getOverview() {
    return {
      totalSlots: this.referenceSlots.length,
      totalProfs: this.byProf.size,
      profList: Array.from(this.byProf.keys()).sort(),
      profSalaMap: Object.fromEntries(this.profSalaMain)
    };
  }
}

if (typeof window !== 'undefined') {
  window.ReferenceMapper = ReferenceMapper;
}
