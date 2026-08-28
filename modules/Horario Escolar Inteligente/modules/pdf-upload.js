/**
 * RF-01: PDF Upload Module
 * Handles file picker, validation, and upload to sessionStorage
 */

class PDFUpload {
  constructor(config = {}) {
    this.maxSize = config.maxSize || 10 * 1024 * 1024; // 10MB
    this.pdfMagic = [0x25, 0x50, 0x44, 0x46]; // "%PDF"
    this.storageKey = 'uploadedPDF';
    this.onUploadSuccess = config.onUploadSuccess || null;
    this.onUploadError = config.onUploadError || null;
  }

  /**
   * Create upload UI (modal with file input)
   * @returns {string} HTML string
   */
  createUploadUI() {
    const html = `
      <div id="import-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
          <h2 class="text-2xl font-bold mb-2">Importar Horário (PDF)</h2>
          <p class="text-gray-600 text-sm mb-4">Selecione um PDF com a tabela de horários</p>

          <input
            type="file"
            id="pdf-file-input"
            accept=".pdf"
            class="block w-full mb-4 p-2 border border-gray-300 rounded hover:border-blue-500 cursor-pointer"
          />

          <button
            id="pdf-upload-btn"
            class="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 font-medium transition"
          >
            Carregar PDF
          </button>

          <div id="pdf-upload-status" class="mt-4 text-sm text-gray-600"></div>
        </div>
      </div>
    `;
    return html;
  }

  /**
   * Mount UI to DOM and attach event listeners
   * @param {string} containerId - Container element ID
   */
  mount(containerId = 'root') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    container.innerHTML = this.createUploadUI();

    const fileInput = document.getElementById('pdf-file-input');
    const uploadBtn = document.getElementById('pdf-upload-btn');

    // File input change listener
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        uploadBtn.disabled = false;
      }
    });

    // Upload button click listener
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        this._setStatus('Selecione um arquivo', 'error');
        return;
      }

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Carregando...';

      try {
        await this.handleUpload(file);
        this._setStatus('✅ PDF carregado com sucesso!', 'success');
        uploadBtn.textContent = 'Carregar PDF';
        uploadBtn.disabled = false;

        if (this.onUploadSuccess) {
          this.onUploadSuccess(file);
        }
      } catch (error) {
        this._setStatus(`❌ ${error.message}`, 'error');
        uploadBtn.textContent = 'Carregar PDF';
        uploadBtn.disabled = false;

        if (this.onUploadError) {
          this.onUploadError(error);
        }
      }
    });
  }

  /**
   * Validate PDF file (magic bytes + size)
   * @param {File} file - PDF file object
   * @returns {Promise<boolean>} Validation result
   */
  async validatePDF(file) {
    // Check filename
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Arquivo deve ter extensão .pdf');
    }

    // Check size
    if (file.size > this.maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      throw new Error(`PDF muito grande: ${sizeMB}MB (máximo: 10MB)`);
    }

    // Check magic bytes (PDF signature)
    const buffer = await file.slice(0, 4).arrayBuffer();
    const view = new Uint8Array(buffer);

    const isPDF = view[0] === 0x25 && // %
                  view[1] === 0x50 && // P
                  view[2] === 0x44 && // D
                  view[3] === 0x46;   // F

    if (!isPDF) {
      throw new Error('Arquivo não é um PDF válido (assinatura inválida)');
    }

    return true;
  }

  /**
   * Handle upload: validate + store in sessionStorage
   * @param {File} file - PDF file object
   * @returns {Promise<Object>} Upload metadata
   */
  async handleUpload(file) {
    try {
      // Validate PDF
      await this.validatePDF(file);

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const base64 = this._arrayBufferToBase64(arrayBuffer);

      // Create metadata
      const uploadMetadata = {
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        base64: base64
      };

      // Store in sessionStorage
      sessionStorage.setItem(this.storageKey, JSON.stringify(uploadMetadata));

      console.log('✅ PDF validado e armazenado:', file.name);

      return uploadMetadata;
    } catch (error) {
      console.error('❌ Erro no upload:', error.message);
      throw error;
    }
  }

  /**
   * Retrieve uploaded PDF from sessionStorage
   * @returns {Object|null} Upload metadata or null
   */
  getUploadedPDF() {
    const stored = sessionStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Clear stored PDF from sessionStorage
   */
  clearUpload() {
    sessionStorage.removeItem(this.storageKey);
  }

  /**
   * Reset form (for re-upload)
   */
  reset() {
    const fileInput = document.getElementById('pdf-file-input');
    const statusDiv = document.getElementById('pdf-upload-status');

    if (fileInput) fileInput.value = '';
    if (statusDiv) statusDiv.textContent = '';

    this.clearUpload();
  }

  /**
   * Helper: Convert ArrayBuffer to Base64
   * @private
   */
  _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Helper: Set upload status message
   * @private
   */
  _setStatus(message, type = 'info') {
    const statusDiv = document.getElementById('pdf-upload-status');
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.className = `mt-4 text-sm ${
      type === 'success' ? 'text-green-600' :
      type === 'error' ? 'text-red-600' :
      'text-gray-600'
    }`;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFUpload;
}
