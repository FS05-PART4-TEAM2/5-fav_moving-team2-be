// tasks.module.ts
import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quotation } from "src/quotation/quotation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Quotation])],
  providers: [TaskService],
})
export class TaskModule {}
