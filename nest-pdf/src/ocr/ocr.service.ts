import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import FormData from 'form-data';
import { OcrParsedResult } from 'src/types/ocr.type';
import { OcrMessages } from './ocr.messages';

dotenv.config();

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async parsePdf(file: Express.Multer.File): Promise<OcrParsedResult> {
    if (!file) {
      this.logger.error(OcrMessages.fileNotProvided);
      return { output: '', error: OcrMessages.fileNotProvided };
    }

    if (!file.buffer || file.buffer.length === 0) {
      this.logger.error(OcrMessages.fileIsEmpty);
      return { output: '', error: OcrMessages.fileIsEmpty };
    }

    const form = new FormData();
    form.append('file', file.buffer, { filename: file.originalname });
    form.append('output_format', 'markdown');
    form.append('force_ocr', 'false');
    form.append('paginate_output', 'false');

    try {
      this.logger.log(OcrMessages.ocrStarted); // ← можно оставить 'OCR started' или заменить
      const res = await axios.post(
        `http://${process.env.MARKER_URL}/marker/upload`,
        form,
        {
          headers: form.getHeaders(),
        },
      );
      this.logger.log(OcrMessages.ocrEnded);

      if (res.status === 200 && res.data?.output) {
        return { output: res.data.output, error: null };
      } else {
        const errorMessage = OcrMessages.noOutputFromOcr(res.status);
        this.logger.warn(errorMessage);
        return { output: '', error: errorMessage };
      }
    } catch (error) {
      // Логируем исходную ошибку (техническую)
      this.logger.error(
        `${OcrMessages.uploadError} ${error.message || error}`,
        (error as Error).stack,
      );

      let errorMessage: string = OcrMessages.internalProcessingError;

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const message =
            error.response.data || OcrMessages.ocrErrorResponse(status);
          errorMessage = OcrMessages.ocrErrorResponse(status, String(message));
        } else if (error.request) {
          errorMessage = OcrMessages.noResponseFromOcr;
        } else {
          errorMessage = OcrMessages.requestSetupError;
        }
      }

      return { output: '', error: errorMessage };
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await axios.get(`http://${process.env.MARKER_URL}`, {
        timeout: 1000,
      });
      return true;
    } catch {
      return false;
    }
  }
}
