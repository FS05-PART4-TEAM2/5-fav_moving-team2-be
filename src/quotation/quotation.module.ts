import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QuotationService } from "./quotation.service";
import { QuotationController } from "./quotation.controller";
import { Quotation } from "./quotation.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Quotation]),
    forwardRef(() => AuthModule),
  ],
  providers: [QuotationService],
  controllers: [QuotationController],
  exports: [TypeOrmModule],
})
export class QuotationModule {}
