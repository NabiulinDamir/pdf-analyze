import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Проверить статус сервиса' })
  @ApiResponse({
    status: 200,
    description: 'Приложение запущено',
    schema: {
      type: 'object',
      example: {
        isHealthy: true,
        message: 'Приложение запущено',
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
        message: 'OCR сервис недоступен',
      },
    },
  })
  @Get('/health')
  async getHealth(@Res() res: Response) {
    const result = await this.appService.getHealth();

    if (result.isHealthy) return res.status(HttpStatus.OK).json(result);
    else return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(result);
  }
}
