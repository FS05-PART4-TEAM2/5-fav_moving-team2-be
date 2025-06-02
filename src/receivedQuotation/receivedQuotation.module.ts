import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReceivedQuotationController } from "./receivedQuotation.controller";
import { ReceivedQuotationService } from "./receivedQuotation.service";
import { ReceivedQuotation } from "./receivedQuotation.entity";
import { AuthModule } from "src/auth/auth.module";
import { Quotation } from "src/quotation/quotation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ReceivedQuotation, Quotation]),
    AuthModule,
  ],
  controllers: [ReceivedQuotationController],
  providers: [ReceivedQuotationService],
  exports: [TypeOrmModule],
})
export class ReceivedQuotationModule {}
