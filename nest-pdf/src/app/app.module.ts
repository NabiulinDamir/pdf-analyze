import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { OcrModule } from '../ocr/ocr.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LlmModule } from 'src/llm/llm.module'

@Module({
  imports: [DatabaseModule, OcrModule, LlmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
