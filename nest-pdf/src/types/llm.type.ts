import { ApiProperty } from '@nestjs/swagger';
import { Task } from './task.type';

export class LlmParsedResult {
  @ApiProperty({ description: 'Список заданий' })
  tasks: Task[];
  @ApiProperty({ description: 'Ошибка', nullable: true })
  error: string | null;
}
