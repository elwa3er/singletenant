import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { DbService } from "src/dbService/db.service";
import { AddressServiceBase } from "./base/address.service.base";

@Injectable()
export class AddressService extends AddressServiceBase {
  constructor(protected readonly prisma: DbService) {
    super(prisma);
  }
}
