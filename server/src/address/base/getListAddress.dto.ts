import { ApiProperty } from "@nestjs/swagger";
import { Address } from "./Address";
export class getListAddressDto {
  @ApiProperty({
    type: [Address],
  })
  readonly paginatedResult!: [Address];

  @ApiProperty({
    type: Number,
  })
  readonly totalCount!: number;
}
