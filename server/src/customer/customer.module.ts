import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { CustomerModuleBase } from "./base/customer.module.base";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";

@Module({
  imports: [CustomerModuleBase],
  controllers: [CustomerController],
  providers: [CustomerService, DbService],
  exports: [CustomerService],
})
export class CustomerModule {}
