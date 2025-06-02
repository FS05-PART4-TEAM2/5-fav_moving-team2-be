import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuotationService } from "./quotation.service";
import { QuotationController } from "./quotation.controller";
import { Quotation } from "./quotation.entity";
import { AuthModule } from "../auth/auth.module";
import { MoverQuotationService } from "./services/mover-quotation.service";
import { MoverQuotationController } from "./constrollers/mover-quotation.controller";
import { AssignMover } from "./entities/assign-mover.entity";
import { ReceivedQuote } from "./entities/received-quote.entity";
import { Customer } from "src/customer/customer.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Quotation, AssignMover, ReceivedQuote, Customer]),
    forwardRef(() => AuthModule),
  ],
  providers: [QuotationService, MoverQuotationService],
  controllers: [QuotationController, MoverQuotationController],
  exports: [TypeOrmModule],
})
export class QuotationModule {}
