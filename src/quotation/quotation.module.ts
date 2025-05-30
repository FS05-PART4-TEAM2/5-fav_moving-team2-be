import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuotationService } from "./quotation.service";
import { QuotationController } from "./quotation.controller";
import { Quotation } from "./quotation.entity";
import { AuthModule } from "../auth/auth.module";
import { MoverQuotationService } from "./services/mover-quotation.service";
import { MoverQuotationController } from "./constrollers/mover-quotation.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Quotation]),
    forwardRef(() => AuthModule),
  ],
  providers: [QuotationService, MoverQuotationService],
  controllers: [QuotationController, MoverQuotationController],
  exports: [TypeOrmModule],
})
export class QuotationModule {}
