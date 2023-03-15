import { ApiProperty } from "@nestjs/swagger";
import { Order } from "./Order";
export class getListOrderDto {
  @ApiProperty({
    type: [Order],
  })
  readonly paginatedResult!: [Order];

  @ApiProperty({
    type: Number,
  })
  readonly totalCount!: number;
}
