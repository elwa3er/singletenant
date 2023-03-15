import { ApiProperty } from "@nestjs/swagger";
import { Customer } from "./Customer";
export class getListCustomerDto {
  @ApiProperty({
    type: [Customer],
  })
  readonly paginatedResult!: [Customer];

  @ApiProperty({
    type: Number,
  })
  readonly totalCount!: number;
}
