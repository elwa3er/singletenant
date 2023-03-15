import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { AddressModuleBase } from "./base/address.module.base";
import { AddressService } from "./address.service";
import { AddressController } from "./address.controller";

@Module({
  imports: [AddressModuleBase],
  controllers: [AddressController],
  providers: [AddressService, DbService],
  exports: [AddressService],
})
export class AddressModule {}
