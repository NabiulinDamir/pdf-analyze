import { Injectable, Logger } from '@nestjs/common';
import { OcrService } from '../ocr/ocr.service';
import { DatabaseService } from '../database/database.service';
import { LlmService } from '../llm/llm.service';
import { AppMessages } from './app.messages'; // ← импорт сообщений

@Injectable()
export class AppService {
  async getHealth(): Promise<{ isHealthy: boolean; message: string }> {
    const [ocrHealth, llmHealth] = await Promise.all([
      this.ocrService.checkHealth(),
      this.llmService.checkHealth(),
    ]);

    let errors: string[] = [];
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
