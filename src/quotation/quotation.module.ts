import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuotationService } from "./quotation.service";
import { QuotationController } from "./quotation.controller";
import { Quotation } from "./quotation.entity";
import { AuthModule } from "../auth/auth.module";
import { MoverQuotationService } from "./services/mover-quotation.service";
import { ReceivedQuote } from "./entities/received-quote.entity";
import { Customer } from "src/customer/customer.entity";
import { MoverQuotationController } from "./controllers/mover-quotation.controller";
import { AssignQuotationController } from "./controllers/assign-quotation.controller";
import { AssignQuotationService } from "./services/assign-quotation.service";
import { AssignMover } from "./entities/assign-mover.entity";
import { ReceivedQuotationService } from "./services/customer-quotation.service";
import { ReceivedQuotationController } from "./controllers/customer-quotation.controller";
import { LikeMover } from "src/likeMover/likeMover.entity";
import { LikeModule } from "src/likeMover/likeMover.module";
@Module({
  imports: [
    TypeOrmModule.forFeature([Quotation, AssignMover, ReceivedQuote, Customer]),
    forwardRef(() => AuthModule),
    LikeModule,
  ],
  providers: [
    QuotationService,
    MoverQuotationService,
    AssignQuotationService,
    ReceivedQuotationService,
  ],
  controllers: [
    QuotationController,
    MoverQuotationController,
    AssignQuotationController,
    ReceivedQuotationController,
  ],
  exports: [TypeOrmModule],
})
export class QuotationModule {}
