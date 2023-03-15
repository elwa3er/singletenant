import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { OrderModuleBase } from "./base/order.module.base";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";

@Module({
  imports: [OrderModuleBase],
  controllers: [OrderController],
  providers: [OrderService, DbService],
  exports: [OrderService],
})
export class OrderModule {}
