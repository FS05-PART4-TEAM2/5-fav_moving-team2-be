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
import { Mover } from "src/mover/mover.entity";
import { NotificationsModule } from "src/notifications/notification.module";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quotation,
      AssignMover,
      ReceivedQuote,
      Customer,
      Mover,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationsModule), // NotificationsModule이 임포트되었는지 확인
  ],
  providers: [
    QuotationService,
    MoverQuotationService,
    AssignQuotationService,
    ReceivedQuotationService,
    // NotificationService는 여기서 제공할 필요 없음, NotificationsModule에서 내보내므로
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
