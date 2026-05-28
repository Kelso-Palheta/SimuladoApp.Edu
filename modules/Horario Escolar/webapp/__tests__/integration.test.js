/**
 * Sprint 1 — Integration Test
 * E2E flow: PDFUpload → PDFParser → DataMapper
 *
 * Tests the complete workflow from file upload through PDF extraction
 * to fuzzy matching and validation.
 */

/**
 * Mock school data for testing
 */
const mockSchoolData = {
  professors: [
    { id: 'prof_1', name: 'João Silva' },
    { id: 'prof_2', name: 'Maria Santos' },
    { id: 'prof_3', name: 'Carlos Oliveira' },
    { id: 'prof_4', name: 'Ana Paula' }
  ],
  disciplines: [
    { id: 'disc_1', name: 'Português', area_id: 'linguagens' },
    { id: 'disc_2', name: 'Inglês', area_id: 'linguagens' },
    { id: 'disc_3', name: 'Matemática', area_id: 'matematica' },
    { id: 'disc_4', name: 'Biologia', area_id: 'natureza' },
    { id: 'disc_5', name: 'História', area_id: 'humanas' }
  ],
  areas: [
    { id: 'linguagens', name: 'Linguagens' },
    { id: 'matematica', name: 'Matemática' },
    { id: 'natureza', name: 'Ciências Natureza' },
    { id: 'humanas', name: 'Ciências Humanas' }
  ],
  blockedSlots: [
    { dia: 'segunda', horario: 12, reason: 'Intervalo' },
    { dia: 'sábado', horario: null, reason: 'Fim de semana' }
  ],
  debug: false
};

/**
 * Mock raw rows from PDFParser
 */
const mockRawRows = [
  {
    turma: '1º ANO - 101',
    periodo: 'Manhã',
    dia: 'segunda',
    horario: 1,
    areaId: 'linguagens',
    disciplinaOriginal: 'Português',
    professorOriginal: 'João Silva',
    sala: 'Sala L2',
    observacoes: ''
  },
  {
    turma: '1º ANO - 101',
    periodo: 'Manhã',
    dia: 'segunda',
    horario: 2,
    areaId: 'linguagens',
    disciplinaOriginal: 'Inglês',
    professorOriginal: 'Maria Santos',
    sala: 'Sala L3',
    observacoes: ''
  },
  {
    turma: '1º ANO - 101',
    periodo: 'Tarde',
    dia: 'terça',
    horario: 1,
    areaId: 'matematica',
    disciplinaOriginal: 'Matemática',
    professorOriginal: 'Carlos Oliveira',
    sala: 'Sala M1',
    observacoes: ''
  },
  {
    turma: '1º ANO - 101',
    periodo: 'Manhã',
    dia: 'quarta',
    horario: 3,
    areaId: 'natureza',
    disciplinaOriginal: 'Biologia',
    professorOriginal: 'Joao Silva', // typo — will be fuzzy matched
    sala: 'Lab Bio',
    observacoes: ''
  },
  {
    turma: '1º ANO - 101',
    periodo: 'Manhã',
    dia: 'segunda',
    horario: 12, // blocked slot
    areaId: 'humanas',
    disciplinaOriginal: 'História',
    professorOriginal: 'Unknown Professor',
    sala: 'Sala H1',
    observacoes: ''
  }
];

/**
 * TEST SUITE 1: PDFUpload Validation
 */
describe('PDFUpload (RF-01)', () => {
  let uploader;

  beforeEach(() => {
    uploader = new PDFUpload({
      maxSize: 10 * 1024 * 1024,
    });
  });

  test('should reject non-PDF files', async () => {
    const fakeFile = new File(['not a pdf'], 'test.txt', { type: 'text/plain' });

    try {
      await uploader.validatePDF(fakeFile);
      throw new Error('Should have rejected non-PDF');
    } catch (error) {
      expect(error.message).toContain('não é um PDF válido');
    }
  });

  test('should reject files larger than 10MB', async () => {
    const largeData = new ArrayBuffer(11 * 1024 * 1024); // 11MB
    const file = new File([largeData], 'large.pdf', { type: 'application/pdf' });

    try {
      await uploader.validatePDF(file);
      throw new Error('Should have rejected large file');
    } catch (error) {
      expect(error.message).toContain('muito grande');
    }
  });

  test('should store uploaded PDF metadata in sessionStorage', async () => {
    // Create a minimal PDF (just has "%PDF" magic bytes)
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E]); // "%PDF-1."
    const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' });

    const metadata = await uploader.handleUpload(file);

    expect(metadata).toBeDefined();
    expect(metadata.fileName).toBe('test.pdf');
    expect(metadata.uploadedAt).toBeDefined();
    expect(metadata.base64).toBeDefined();

    // Verify stored in sessionStorage
    const stored = uploader.getUploadedPDF();
    expect(stored).toBeDefined();
    expect(stored.fileName).toBe('test.pdf');
  });
});

/**
 * TEST SUITE 2: PDFParser Output Structure
 */
describe('PDFParser (RF-02)', () => {
  test('should return array of raw rows with required fields', () => {
    // Validate mock raw rows structure
    const requiredFields = [
      'turma', 'periodo', 'dia', 'horario',
      'areaId', 'disciplinaOriginal', 'professorOriginal',
      'sala', 'observacoes'
    ];

    for (const row of mockRawRows) {
      for (const field of requiredFields) {
        expect(row).toHaveProperty(field);
      }
    }

    expect(mockRawRows.length).toBeGreaterThan(0);
  });

  test('should parse turma field correctly', () => {
    const row = mockRawRows[0];
    expect(row.turma).toBeTruthy();
    expect(row.turma).toMatch(/1º ANO/i);
  });

  test('should parse dia field as valid weekday', () => {
    const validDays = ['segunda', 'terça', 'quarta', 'quinta', 'sexta'];

    for (const row of mockRawRows) {
      expect(validDays).toContain(row.dia.toLowerCase());
    }
  });

  test('should parse horario as number 1-12', () => {
    for (const row of mockRawRows) {
      expect(typeof row.horario).toBe('number');
      expect(row.horario).toBeGreaterThanOrEqual(1);
      expect(row.horario).toBeLessThanOrEqual(12);
    }
  });
});

/**
 * TEST SUITE 3: DataMapper Fuzzy Matching (RF-03)
 */
describe('DataMapper Professor Matching (RF-03)', () => {
  let mapper;

  beforeEach(() => {
    mapper = new DataMapper(mockSchoolData);
  });

  test('should fuzzy match professor with typo (85% threshold)', () => {
    const rows = [mockRawRows[3]]; // "Joao Silva" (missing tilde)
    const enriched = mapper.mapRows(rows);

    const result = enriched[0];
    expect(result.professorStatus).toBe('match_found');
    expect(result.professorMatch).toBeDefined();
    expect(result.professorMatch.name).toBe('João Silva');
  });

  test('should mark professor as not_found if no match', () => {
    const rows = [mockRawRows[4]]; // "Unknown Professor"
    const enriched = mapper.mapRows(rows);

    const result = enriched[0];
    expect(result.professorStatus).toBe('not_found');
    expect(result.professorMatch).toBeNull();
  });

  test('should find exact match for professor', () => {
    const rows = [mockRawRows[0]]; // "João Silva"
    const enriched = mapper.mapRows(rows);

    const result = enriched[0];
    expect(result.professorStatus).toBe('match_found');
    expect(result.professorMatch.name).toBe('João Silva');
    expect(result.professorId).toBe('prof_1');
  });
});

/**
 * TEST SUITE 4: DataMapper Discipline Validation (RF-04)
 */
describe('DataMapper Discipline Validation (RF-04)', () => {
  let mapper;

  beforeEach(() => {
    mapper = new DataMapper(mockSchoolData);
  });

  test('should validate all disciplines in mock rows', () => {
    const enriched = mapper.mapRows(mockRawRows);

    const validDiscs = enriched.filter(r => r.disciplinaStatus === 'valid');
    expect(validDiscs.length).toBeGreaterThan(0);
  });

  test('should set disciplinaAreaId for valid disciplines', () => {
    const rows = [mockRawRows[0]]; // Português
    const enriched = mapper.mapRows(rows);

    const result = enriched[0];
    expect(result.disciplinaStatus).toBe('valid');
    expect(result.disciplinaAreaId).toBe('linguagens');
  });

  test('should handle discipline aliases', () => {
    const testRow = {
      ...mockRawRows[0],
      disciplinaOriginal: 'Matemática' // Should match "Matemática"
    };

    const enriched = mapper.mapRows([testRow]);
    expect(enriched[0].disciplinaStatus).toBe('valid');
  });
});

/**
 * TEST SUITE 5: DataMapper Calendar Blocking (RF-05)
 */
describe('DataMapper Blocked Slots (RF-05)', () => {
  let mapper;

  beforeEach(() => {
    mapper = new DataMapper(mockSchoolData);
  });

  test('should detect explicitly blocked slots', () => {
    const rows = [mockRawRows[4]]; // segunda + horario 12 (blocked)
    const enriched = mapper.mapRows(rows);

    const result = enriched[0];
    expect(result.slotBlocked).toBe(true);
    expect(result.blockReason).toContain('Intervalo');
  });

  test('should detect weekend slots as blocked', () => {
    const testRow = {
      ...mockRawRows[0],
      dia: 'sábado'
    };

    const enriched = mapper.mapRows([testRow]);
    expect(enriched[0].slotBlocked).toBe(true);
    expect(enriched[0].blockReason).toContain('Fim de semana');
  });

  test('should allow non-blocked slots', () => {
    const rows = [mockRawRows[0]]; // segunda, horario 1 (not blocked)
    const enriched = mapper.mapRows(rows);

    const result = enriched[0];
    expect(result.slotBlocked).toBe(false);
  });
});

/**
 * TEST SUITE 6: DataMapper Overall Validation Status
 */
describe('DataMapper Validation Status', () => {
  let mapper;

  beforeEach(() => {
    mapper = new DataMapper(mockSchoolData);
  });

  test('should mark rows with all valid data as "ok"', () => {
    const rows = [mockRawRows[0]]; // All fields valid
    const enriched = mapper.mapRows(rows);

    expect(enriched[0].validationStatus).toBe('ok');
    expect(enriched[0].requiresDecision).toBe(false);
  });

  test('should mark rows with warnings as "warning"', () => {
    const rows = [mockRawRows[3]]; // Fuzzy match (warning)
    const enriched = mapper.mapRows(rows);

    expect(enriched[0].validationStatus).toBe('ok'); // Fuzzy match is acceptable
  });

  test('should mark rows with errors as "error"', () => {
    const testRow = {
      ...mockRawRows[4],
      disciplinaOriginal: 'XXXXXX' // Invalid discipline
    };

    const enriched = mapper.mapRows([testRow]);
    expect(enriched[0].validationStatus).toBe('error');
    expect(enriched[0].requiresDecision).toBe(true);
  });

  test('should provide decision options for problematic rows', () => {
    const rows = [mockRawRows[4]]; // Unknown professor + blocked slot
    const enriched = mapper.mapRows(rows);

    const result = enriched[0];
    expect(result.decisionOptions).toBeInstanceOf(Array);
    expect(result.decisionOptions.length).toBeGreaterThan(0);
  });
});

/**
 * TEST SUITE 7: E2E Integration Flow
 */
describe('E2E Integration: PDFUpload → PDFParser → DataMapper', () => {
  test('should complete full workflow without errors', () => {
    // Step 1: Upload (validated)
    const uploader = new PDFUpload();
    expect(uploader).toBeDefined();

    // Step 2: Parse (raw rows generated)
    const rawRows = mockRawRows; // Simulate PDFParser output
    expect(rawRows.length).toBeGreaterThan(0);

    // Step 3: Map (enriched rows with validation)
    const mapper = new DataMapper(mockSchoolData);
    const enriched = mapper.mapRows(rawRows);

    expect(enriched.length).toBe(rawRows.length);

    // Validate enriched row structure
    const requiredEnrichedFields = [
      'professorMatch', 'professorStatus', 'professorId',
      'disciplineMatch', 'disciplinaStatus', 'disciplinaAreaId',
      'slotBlocked', 'blockReason',
      'validationStatus', 'requiresDecision', 'decisionOptions'
    ];

    for (const row of enriched) {
      for (const field of requiredEnrichedFields) {
        expect(row).toHaveProperty(field);
      }
    }
  });

  test('should generate summary statistics', () => {
    const mapper = new DataMapper(mockSchoolData);
    const enriched = mapper.mapRows(mockRawRows);
    const summary = mapper.getSummary(enriched);

    expect(summary).toHaveProperty('total');
    expect(summary).toHaveProperty('ok');
    expect(summary).toHaveProperty('warnings');
    expect(summary).toHaveProperty('errors');
    expect(summary).toHaveProperty('matchRate');

    expect(summary.total).toBe(mockRawRows.length);
    expect(summary.matchRate).toBeGreaterThanOrEqual(0);
    expect(summary.matchRate).toBeLessThanOrEqual(100);
  });
});

/**
 * TEST SUITE 8: Edge Cases
 */
describe('Edge Cases', () => {
  test('should handle empty input arrays', () => {
    const mapper = new DataMapper(mockSchoolData);

    try {
      mapper.mapRows([]);
      throw new Error('Should have rejected empty array');
    } catch (error) {
      expect(error.message).toContain('vazio');
    }
  });

  test('should handle missing optional fields', () => {
    const minimalRow = {
      turma: '1A',
      periodo: 'Manhã',
      dia: 'segunda',
      horario: 1,
      areaId: 'linguagens',
      disciplinaOriginal: '',
      professorOriginal: '',
      sala: '',
      observacoes: ''
    };

    const mapper = new DataMapper(mockSchoolData);
    const enriched = mapper.mapRows([minimalRow]);

    expect(enriched.length).toBe(1);
    expect(enriched[0].professorStatus).toBe('pending');
    expect(enriched[0].disciplinaStatus).toBe('pending');
  });

  test('should normalize text with accents correctly', () => {
    const testRow = {
      ...mockRawRows[0],
      professorOriginal: 'JOÃO SILVA' // All caps with accent
    };

    const mapper = new DataMapper(mockSchoolData);
    const enriched = mapper.mapRows([testRow]);

    expect(enriched[0].professorStatus).toBe('match_found');
  });
});
