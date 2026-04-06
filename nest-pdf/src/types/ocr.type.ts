import { ApiProperty } from '@nestjs/swagger'

export class OcrParsedResult {
  @ApiProperty({description: 'Текст OCR'})
  output: string
  @ApiProperty({description: 'Ошибка', nullable: true})
  error: string | null
}