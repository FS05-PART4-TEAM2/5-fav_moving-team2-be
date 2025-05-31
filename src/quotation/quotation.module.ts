import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuotationService } from "./quotation.service";
import { QuotationController } from "./quotation.controller";
import { Quotation } from "./quotation.entity";
import { AuthModule } from "../auth/auth.module";
import { MoverQuotationService } from "./services/mover-quotation.service";
import { MoverQuotationController } from "./controllers/mover-quotation.controller";
import { AssignQuotationController } from "./controllers/assign-quotation.controller";
import { AssignQuotationService } from "./services/assign-quotation.service";
import { AssignMover } from "./entities/assign-mover.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Quotation]),
    TypeOrmModule.forFeature([AssignMover]),
    forwardRef(() => AuthModule),
  ],
  providers: [QuotationService, MoverQuotationService, AssignQuotationService],
  controllers: [QuotationController, MoverQuotationController, AssignQuotationController],
  exports: [TypeOrmModule],
})
export class QuotationModule {}
