import { ApiProperty } from '@nestjs/swagger'

export class Task {
  @ApiProperty({description: 'Идентификатор задания'})
  id: string
  @ApiProperty({description: 'Задание'})
  title: string
  @ApiProperty({description: 'Ответственные'})
  responsible: string[]
  @ApiProperty({description: 'Срок выполнения'})
  deadline: string
}