import { Injectable, Logger } from '@nestjs/common';
import { OcrService } from '../ocr/ocr.service';
import { DatabaseService } from 'src/database/database.service';
import { LlmService } from 'src/llm/llm.service';
import { AppMessages } from './app.messages'; // ← импорт сообщений

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly databaseService: DatabaseService,
    private readonly llmService: LlmService,
  ) {}

  async parseAndProcessPdf(file: Express.Multer.File) {
    const { id, shouldProcess } = await this.handleFileUpload(file);
    try {
      if (shouldProcess) await this.ocrAndLlmProcess(id, file);
    } catch (error) {
      const errorMessage = error.message || AppMessages.unknownOcrLlmError;
      this.logger.error(
        `OCR и LLM ошибка для ID ${id}: ${errorMessage}`,
        error.stack,
      );
      this.databaseService.addErrorToDB(id, errorMessage);
    }

    return id;
  }

  private async ocrAndLlmProcess(id: string, file: Express.Multer.File) {
    const parsedFile: Express.Multer.File = { ...file, originalname: 'file' };
    const ocrResult = await this.ocrService.parsePdf(parsedFile);

    if (ocrResult.error) {
      this.logger.error(
        `${AppMessages.ocrErrorPrefix} ${id}:`,
        ocrResult.error,
      );
      this.databaseService.addErrorToDB(id, ocrResult.error);
      return;
    }

    this.databaseService.addParsedFileToDB(id, ocrResult);
    const llmResult = await this.llmService.parse(ocrResult.output);
    if (llmResult.error) {
      this.logger.error(
        `${AppMessages.llmErrorPrefix} ${id}:`,
        llmResult.error,
      );
      this.databaseService.addErrorToDB(id, llmResult.error);
      return;
    }

    this.databaseService.addProcessedFileToDB(id, llmResult.tasks);
  }

  private handleFileUpload(
    file: Express.Multer.File,
  ): Promise<{ id: string; shouldProcess: boolean }> {
    const id = this.generateId(file);
    let processed = this.databaseService.getFromDB(id);

    if (processed.error && processed.error !== 'Document not found') {
      this.logger.log(AppMessages.pdfAlreadyInDbWithError);
      this.databaseService.delete(id);
      processed = this.databaseService.getFromDB(id);
    }

    let shouldProcess = false;

    if (processed.id === null) {
      this.databaseService.addFileToDB(id, file);
      this.logger.log(AppMessages.pdfSavedSuccessfully);
      shouldProcess = true;
    } else {
      this.logger.log(AppMessages.pdfAlreadyInDb);
      shouldProcess = false;
    }

    return { id, shouldProcess };
  }

  deleteFromDB(file: Express.Multer.File) {
    const id = this.generateId(file);
    this.databaseService.delete(id);
  }

  private generateId(file: Express.Multer.File): string {
    return require('crypto')
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');
  }

  getProcessedTaskById(id: string) {
    const result = this.databaseService.getFromDB(id);
    return result;
  }

  async getHealth(): Promise<{ isHealthy: boolean; message: string }> {
    const [ocrHealth, llmHealth] = await Promise.all([
      this.ocrService.checkHealth(),
      this.llmService.checkHealth(),
    ]);

    const errors: string[] = [];
    if (!ocrHealth) errors.push(AppMessages.ocrServiceUnavailable);
    if (!llmHealth) errors.push(AppMessages.llmServiceUnavailable);

    if (errors.length)
      return {
        isHealthy: false,
        message: errors.join('; '),
      };

    return {
      isHealthy: true,
      message: AppMessages.appIsRunning,
    };
  }
}
