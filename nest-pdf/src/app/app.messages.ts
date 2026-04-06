export const AppMessages = {
  unknownOcrLlmError: 'Unknown error during OCR and LLM processing',
  ocrErrorPrefix: 'OCR error for ID',
  llmErrorPrefix: 'LLM error for ID',
  pdfAlreadyInDbWithError:
    'PDF already exists in DB but was saved with an error',
  pdfSavedSuccessfully: 'PDF saved successfully',
  pdfAlreadyInDb: 'PDF already exists in DB',
  ocrServiceUnavailable: 'OCR service is unavailable',
  llmServiceUnavailable: 'LLM service is unavailable',
  appIsRunning: 'Application is running',
} as const;
