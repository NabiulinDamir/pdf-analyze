export const OcrMessages = {
  fileNotProvided: 'File not provided',
  fileIsEmpty: 'File is empty',
  ocrStarted: 'OCR started',
  ocrEnded: 'OCR ended',
  noOutputFromOcr: (status: number) =>
      `OCR service returned status ${status}, but output is missing`,
  uploadError: 'Error uploading file to OCR service:',
  internalProcessingError:
      'An internal error occurred while processing the file',
  fallbackErrorResponse: (status: number) =>
      `OCR service returned error ${status}`,
  ocrErrorResponse: (status: number, serverMessage?: string) => {
    if (serverMessage) {
      return `OCR service returned error ${status}: ${serverMessage}`;
    }
    return `OCR service returned error ${status}`;
  },
  noResponseFromOcr: 'No response from OCR service',
  requestSetupError: 'Error setting up request to OCR service',
} as const;
