import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReceivedQuotationController } from "./received-quotation.controller";
import { ReceivedQuotationService } from "./received-quotation.service";
import { ReceivedQuotation } from "./received-quotation.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([ReceivedQuotation]), AuthModule],
  controllers: [ReceivedQuotationController],
  providers: [ReceivedQuotationService],
  exports: [TypeOrmModule],
})
export class ReceivedQuotationModule {}
