import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReceivedQuotationController } from "./received-quotation.controller";
import { ReceivedQuotationService } from "./received-quotation.service";
import { ReceivedQuotation } from "./received-quotation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ReceivedQuotation])],
  controllers: [ReceivedQuotationController],
  providers: [ReceivedQuotationService],
  exports: [TypeOrmModule],
})
export class ReceivedQuotationModule {}
