export const LlmMessages = {
  emptyDocument: 'Document is empty or not provided',
  serviceReturnedStatus: (status: number) =>
    `Processing service returned status ${status}`,
  invalidTasksArray:
    'Response from processing service does not contain a valid tasks array',
  skippingInvalidTask: (index: number) =>
    `Skipping invalid task #${index}: expected an array of 4 elements`,
  titleNotString: (index: number) =>
    `Skipping task #${index}: title is not a string`,
  responsibleInvalid: (index: number) =>
    `Skipping task #${index}: responsible is neither a string nor an array of strings`,
  deadlineNotString: (index: number) =>
    `Skipping task #${index}: deadline is not a string`,
  idInvalid: (index: number) =>
    `Skipping task #${index}: id is neither a string nor a number`,
  requestError: 'Error while calling processing service:',
  internalProcessingError:
    'An internal error occurred while processing the document',
  serviceErrorResponse: (status: number, message: string) =>
    `Processing service returned error ${status}: ${message}`,
  noResponseFromService: 'No response from processing service',
  requestSetupError: 'Error setting up request to processing service',
} as const;





