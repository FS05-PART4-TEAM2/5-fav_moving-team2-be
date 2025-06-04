import { Module } from "@nestjs/common";
import { MoverReview } from "./moverReview.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { MoverReviewService } from "./moverReview.service";
import { MoverReviewController } from "./moverReview.controller";
import { Mover } from "src/mover/mover.entity";
import { Customer } from "src/customer/customer.entity";
import { ReceivedQuote } from "src/quotation/entities/received-quote.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([MoverReview, Mover, Customer, ReceivedQuote]),
    AuthModule,
  ],
  providers: [MoverReviewService],
  controllers: [MoverReviewController],
})
export class MoverReviewModule {}
