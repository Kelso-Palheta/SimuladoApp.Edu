/**
 * RF-03/04/05: Data Mapper Module
 * Fuzzy match professors/disciplines (fuse.js, threshold 85%),
 * validate against school data, detect blocked slots.
 *
 * Input:  rawRows from PDFParser
 * Output: enriched rows with validationStatus fields
 */

class DataMapper {
  constructor(schoolData = {}) {
    this.professors = schoolData.professors || [];
    this.disciplines = schoolData.disciplines || [];
    this.areas = schoolData.areas || [];
    this.blockedSlots = schoolData.blockedSlots || [];
    this.threshold = schoolData.matchThreshold || 0.85;
    this.debug = schoolData.debug || false;

    // Initialize fuse.js matchers if Fuse is available
    this.professorMatcher = null;
    this.disciplineMatcher = null;
    this._initMatchers();
  }

  /**
   * Initialize Fuse.js indexes for professor and discipline matching
   */
  _initMatchers() {
    const Fuse = typeof window !== 'undefined' ? window.Fuse : null;

    if (Fuse && this.professors.length > 0) {
      this.professorMatcher = new Fuse(this.professors, {
        keys: ['name'],
        threshold: 1 - this.threshold, // fuse threshold = 1 - match rate
        includeScore: true,
        distance: 100,
        minMatchCharLength: 2,
      });
    }

    if (Fuse && this.disciplines.length > 0) {
      this.disciplineMatcher = new Fuse(this.disciplines, {
        keys: ['name'],
        threshold: 1 - this.threshold,
        includeScore: true,
        distance: 100,
        minMatchCharLength: 2,
      });
    }
  }

  /**
   * Main entry point: map raw rows → enriched rows
   */
  mapRows(rawRows) {
    if (!rawRows || rawRows.length === 0) {
      throw new Error('Nenhuma linha para mapear — rawRows está vazio');
    }

    const enriched = [];

    for (const row of rawRows) {
      const enrichedRow = this._mapSingleRow(row);
      enriched.push(enrichedRow);
    }

    if (this.debug) {
      const withIssues = enriched.filter(r => r.validationStatus !== 'ok');
      console.log(`[DataMapper] Mapped ${enriched.length} rows, ${withIssues.length} need attention`);
    }

    return enriched;
  }

  /**
   * Map a single raw row → enriched row with validation
   */
  _mapSingleRow(row) {
    const enriched = {
      ...row,

      // Professor matching
      professorMatch: null,
      professorStatus: 'pending',      // match_found | not_found | ambiguous | pending
      professorId: null,

      // Discipline validation
      disciplineMatch: null,
      disciplinaStatus: 'pending',     // valid | not_found | ambiguous | pending
      disciplinaAreaId: null,

      // Calendar blocking
      slotBlocked: false,
      blockReason: '',

      // Overall status
      validationStatus: 'pending',     // ok | warning | error | pending
      requiresDecision: false,
      decisionOptions: [],
    };

    // ── RF-03: Match professor ──
    if (row.professorOriginal && row.professorOriginal.length >= 2) {
      const profResult = this._matchProfessor(row.professorOriginal);
      Object.assign(enriched, profResult);
    }

    // ── RF-04: Validate discipline ──
    if (row.disciplinaOriginal && row.disciplinaOriginal.length >= 2) {
      const discResult = this._validateDiscipline(row.disciplinaOriginal);
      Object.assign(enriched, discResult);
    }

    // ── RF-05: Check blocked slot ──
    if (row.dia || row.horario) {
      const blockResult = this._checkBlockedSlot(row.dia, row.horario, row.turma);
      Object.assign(enriched, blockResult);
    }

    // ── Compute overall status ──
    enriched.validationStatus = this._computeStatus(enriched);
    enriched.requiresDecision = enriched.validationStatus !== 'ok';
    enriched.decisionOptions = this._buildDecisionOptions(enriched);

    return enriched;
  }

  /**
   * RF-03: Fuzzy match professor name against school database
   */
  _matchProfessor(name) {
    // Normalize: trim, remove extra spaces, handle accents variations
    const normalized = this._normalize(name);

    // Try exact match first (case-insensitive)
    const exactMatch = this.professors.find(p =>
      this._normalize(p.name) === normalized
    );

    if (exactMatch) {
      return {
        professorMatch: exactMatch,
        professorStatus: 'match_found',
        professorId: exactMatch.id || exactMatch._id || null,
      };
    }

    // Try substring match (e.g., "JOANA" matches "Joana Silva")
    const substrMatch = this.professors.filter(p =>
      this._normalize(p.name).includes(normalized) ||
      normalized.includes(this._normalize(p.name))
    );

    if (substrMatch.length === 1) {
      return {
        professorMatch: substrMatch[0],
        professorStatus: 'match_found',
        professorId: substrMatch[0].id || substrMatch[0]._id || null,
      };
    }

    // Fuzzy match via fuse.js
    if (this.professorMatcher) {
      const results = this.professorMatcher.search(name);
      const goodMatches = results.filter(r => {
        const matchScore = 1 - r.score; // Convert fuse score to match rate
        return matchScore >= this.threshold;
      });

      if (goodMatches.length === 1) {
        return {
          professorMatch: goodMatches[0].item,
          professorStatus: 'match_found',
          professorId: goodMatches[0].item.id || goodMatches[0].item._id || null,
        };
      }

      if (goodMatches.length > 1) {
        return {
          professorMatch: goodMatches[0].item,
          professorStatus: 'ambiguous',
          professorId: null,
        };
      }
    }

    // No match found
    return {
      professorMatch: null,
      professorStatus: 'not_found',
      professorId: null,
    };
  }

  /**
   * RF-04: Validate discipline against school database
   */
  _validateDiscipline(name) {
    // Remove common prefixes (E.O., Aula de, etc.)
    let cleanName = name.replace(/^(E\.O\.|Aula de|Aula|Estudo de)\s+/i, '').trim();
    const normalized = this._normalize(cleanName);

    // Exact match
    const exactMatch = this.disciplines.find(d =>
      this._normalize(d.name) === normalized
    );

    if (exactMatch) {
      return {
        disciplineMatch: exactMatch,
        disciplinaStatus: 'valid',
        disciplinaAreaId: exactMatch.area_id || exactMatch.area || null,
      };
    }

    // Common aliases / abbreviations
    const aliases = {
      'português': 'Português', 'portugues': 'Português',
      'matemática': 'Matemática', 'matematica': 'Matemática',
      'biologia': 'Biologia',
      'química': 'Química', 'quimica': 'Química',
      'física': 'Física', 'fisica': 'Física',
      'história': 'História', 'historia': 'História',
      'geografia': 'Geografia',
      'inglês': 'Inglês', 'ingles': 'Inglês',
      'espanhol': 'Espanhol',
      'filosofia': 'Filosofia',
      'sociologia': 'Sociologia',
      'artes': 'Artes',
      'educação física': 'Educação Física',
      'educacao fisica': 'Educação Física',
      'ed. física': 'Educação Física', 'ed. fisica': 'Educação Física',
      'redação': 'Redação', 'redacao': 'Redação',
      'literatura': 'Literatura',
    };

    const aliasKey = normalized.replace(/[^a-zÀ-Ú\s]/g, '').trim();
    if (aliases[aliasKey]) {
      const aliasDisc = this.disciplines.find(d =>
        this._normalize(d.name) === this._normalize(aliases[aliasKey])
      );
      if (aliasDisc) {
        return {
          disciplineMatch: aliasDisc,
          disciplinaStatus: 'valid',
          disciplinaAreaId: aliasDisc.area_id || aliasDisc.area || null,
        };
      }
    }

    // Fuzzy match via fuse.js
    if (this.disciplineMatcher) {
      const results = this.disciplineMatcher.search(name);
      const goodMatches = results.filter(r => {
        const matchScore = 1 - r.score;
        return matchScore >= this.threshold;
      });

      if (goodMatches.length === 1) {
        return {
          disciplineMatch: goodMatches[0].item,
          disciplinaStatus: 'valid',
          disciplinaAreaId: goodMatches[0].item.area_id || goodMatches[0].item.area || null,
        };
      }

      if (goodMatches.length > 1) {
        return {
          disciplineMatch: goodMatches[0].item,
          disciplinaStatus: 'ambiguous',
          disciplinaAreaId: null,
        };
      }
    }

    // Not found
    return {
      disciplineMatch: null,
      disciplinaStatus: 'not_found',
      disciplinaAreaId: null,
    };
  }

  /**
   * RF-05: Check if slot is blocked (holiday, recess, no-class period)
   */
  _checkBlockedSlot(dia, horario, turma) {
    // Check explicit blocked slots
    if (this.blockedSlots.length > 0) {
      const blocked = this.blockedSlots.find(slot => {
        const diaMatch = !slot.dia || this._normalize(slot.dia) === this._normalize(dia);
        const horarioMatch = !slot.horario || slot.horario === horario || slot.tempo === horario;
        return diaMatch && horarioMatch;
      });

      if (blocked) {
        return {
          slotBlocked: true,
          blockReason: blocked.reason || blocked.motivo || 'Slot bloqueado no calendário escolar',
        };
      }
    }

    // Check if day has no classes at all (common patterns)
    if (dia) {
      const diaLower = this._normalize(dia);
      // Weekend detection
      if (diaLower.includes('sabado') || diaLower === 'sábado' || diaLower.includes('domingo')) {
        return {
          slotBlocked: true,
          blockReason: 'Fim de semana — sem aulas',
        };
      }
    }

    return {
      slotBlocked: false,
      blockReason: '',
    };
  }

  /**
   * Compute overall validation status for a row
   */
  _computeStatus(row) {
    const issues = [];

    if (row.professorStatus === 'not_found') {
      issues.push({ type: 'professor', severity: 'warning', field: 'professorOriginal' });
    }
    if (row.professorStatus === 'ambiguous') {
      issues.push({ type: 'professor', severity: 'warning', field: 'professorOriginal' });
    }

    if (row.disciplinaStatus === 'not_found') {
      issues.push({ type: 'disciplina', severity: 'error', field: 'disciplinaOriginal' });
    }
    if (row.disciplinaStatus === 'ambiguous') {
      issues.push({ type: 'disciplina', severity: 'warning', field: 'disciplinaOriginal' });
    }

    if (row.slotBlocked) {
      issues.push({ type: 'calendar', severity: 'warning', field: 'slotBlocked' });
    }

    if (issues.length === 0) return 'ok';
    if (issues.some(i => i.severity === 'error')) return 'error';
    return 'warning';
  }

  /**
   * Build decision options for UI
   */
  _buildDecisionOptions(row) {
    const options = [];

    if (row.professorStatus === 'not_found') {
      options.push({
        type: 'professor_create',
        label: `Criar professor "${row.professorOriginal}"`,
        action: 'create',
        field: 'professor',
      });
      options.push({
        type: 'professor_ignore',
        label: `Ignorar professor "${row.professorOriginal}" (não alocar esta aula)`,
        action: 'ignore',
        field: 'professor',
      });
      if (this.professors.length > 0) {
        options.push({
          type: 'professor_map_manual',
          label: 'Mapear manualmente para outro professor',
          action: 'manual',
          field: 'professor',
          choices: this.professors.map(p => ({ id: p.id || p._id, name: p.name })),
        });
      }
    }

    if (row.professorStatus === 'ambiguous') {
      options.push({
        type: 'professor_select',
        label: 'Selecionar professor correto',
        action: 'select',
        field: 'professor',
        choices: this._findSimilar(row.professorOriginal, this.professors).map(p => ({
          id: p.id || p._id, name: p.name,
        })),
      });
    }

    if (row.disciplinaStatus === 'not_found') {
      options.push({
        type: 'disciplina_create',
        label: `Criar disciplina "${row.disciplinaOriginal}"`,
        action: 'create',
        field: 'disciplina',
      });
      options.push({
        type: 'disciplina_map',
        label: 'Renomear para disciplina existente',
        action: 'map',
        field: 'disciplina',
        choices: this.disciplines.map(d => ({ id: d.id || d._id, name: d.name })),
      });
    }

    if (row.slotBlocked) {
      options.push({
        type: 'slot_override',
        label: `Remover bloqueio: "${row.blockReason}"`,
        action: 'unblock',
        field: 'slot',
      });
    }

    return options;
  }

  /**
   * Find similar items for ambiguous matches
   */
  _findSimilar(query, items) {
    if (this.professorMatcher) {
      const results = this.professorMatcher.search(query);
      return results.filter(r => (1 - r.score) >= 0.5).slice(0, 5).map(r => r.item);
    }
    // Fallback: substring match
    const normalized = this._normalize(query);
    return items.filter(item =>
      this._normalize(item.name).includes(normalized) ||
      normalized.includes(this._normalize(item.name))
    ).slice(0, 5);
  }

  /**
   * Normalize text: lowercase, remove accents, collapse whitespace
   */
  _normalize(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // Remove accent marks
      .replace(/[^a-z0-9\s]/g, '')     // Remove special chars
      .replace(/\s+/g, ' ')            // Collapse whitespace
      .trim();
  }

  /**
   * Get summary statistics after mapping
   */
  getSummary(enrichedRows) {
    const total = enrichedRows.length;
    const ok = enrichedRows.filter(r => r.validationStatus === 'ok').length;
    const warnings = enrichedRows.filter(r => r.validationStatus === 'warning').length;
    const errors = enrichedRows.filter(r => r.validationStatus === 'error').length;
    const profsNotFound = enrichedRows.filter(r => r.professorStatus === 'not_found').length;
    const discsNotFound = enrichedRows.filter(r => r.disciplinaStatus === 'not_found').length;
    const blocked = enrichedRows.filter(r => r.slotBlocked).length;

    return {
      total,
      ok,
      warnings,
      errors,
      professorsNotFound: profsNotFound,
      disciplinesNotFound: discsNotFound,
      slotsBlocked: blocked,
      matchRate: total > 0 ? Math.round((ok / total) * 100) : 0,
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataMapper;
}
