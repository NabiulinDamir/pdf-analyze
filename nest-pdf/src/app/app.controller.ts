import {
  Controller,
  Get,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AppMessages } from './app.messages';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Проверить статус сервиса' })
  @ApiResponse({
    status: 200,
    description: AppMessages.appIsRunning,
    schema: {
      type: 'object',
      example: {
        isHealthy: true,
        message: AppMessages.appIsRunning,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка доступа к сервисам',
    schema: {
      type: 'object',
      example: {
        isHealthy: false,
        message: AppMessages.ocrServiceUnavailable,
      },
    },
  })
  @Get('/health')
  async getHealth(@Res() res: Response) {
    const result = await this.appService.getHealth();

    if (result.isHealthy) return res.status(HttpStatus.OK).json(result);
    else return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
  }

  @ApiOperation({ summary: 'Загрузить PDF для обработки через OCR и LLM' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'PDF файл для обработки через OCR и LLM',
    schema: {
      type: 'object',
      required: ['document'],
      properties: {
        document: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'ID задачи обработки',
    type: String,
  })
  @Post('/process')
  @UseInterceptors(FileInterceptor('document'))
  async parseAndProcess(
    @UploadedFile() document: Express.Multer.File,
  ): Promise<string> {
    return this.appService.parseAndProcessPdf(document);
  }

  @ApiOperation({ summary: 'Удалить файл из базы' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'PDF файл для удаления',
    schema: {
      type: 'object',
      required: ['document'],
      properties: {
        document: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Файл удален',
    type: String,
  })
  @Delete('/delete')
  @UseInterceptors(FileInterceptor('document'))
  deleteFile(@UploadedFile() document: Express.Multer.File) {
    return this.appService.deleteFromDB(document);
  }

  @ApiOperation({ summary: 'Получить результат обработки задачи по ID' })
  @ApiParam({ name: 'id', description: 'ID задачи', type: String })
  @ApiResponse({
    status: 200,
    description: 'Задача готова к использованию',
    schema: {
      type: 'object',
      example: {
        id: 'abc123...',
        isReady: true,
        processed: [
          {
            id: '1',
            title: 'Task example',
            responsible: ['Ivanov I.I.'],
            deadline: '2025-01-01',
          },
        ],
        error: null,
      },
    },
  })
  @ApiResponse({
    status: 202, // 202 Accepted — задача в обработке
    description: 'Обработка в процессе',
    schema: {
      type: 'object',
      example: {
        id: 'abc123...',
        isReady: false,
        processed: null,
        error: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Задача не найдена',
    schema: {
      type: 'object',
      example: {
        id: null,
        isReady: false,
        processed: null,
        error: 'Document not found',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка при обработке',
    schema: {
      type: 'object',
      example: {
        id: 'abc123...',
        isReady: true,
        processed: null,
        error: 'OCR сервис вернул ошибку 500: Internal Server Error',
      },
    },
  })
  @Get('/processed/:id')
  async getProcessedFile(@Param('id') id: string, @Res() res: Response) {
    const result = await this.appService.getProcessedTaskById(id);

    if (result.id === null) {
      // 404: задача не найдена
      return res.status(HttpStatus.NOT_FOUND).json(result);
    }

    if (result.error) {
      // 500: внутренняя ошибка
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    }

    if (!result.isReady) {
      // 202: задача ещё в обработке
      return res.status(HttpStatus.ACCEPTED).json(result);
    }

    // 200: задача готова
    return res.status(HttpStatus.OK).json(result);
  }
}
