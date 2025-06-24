// tasks.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationService } from "src/notifications/notification.service";
import { Quotation } from "src/quotation/quotation.entity";
import { QuotationService } from "src/quotation/quotation.service";
import { In, Repository } from "typeorm";

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    private readonly quotationService: QuotationService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // 자정마다 실행
  async handleQuoStatusUpdate() {
    this.logger.log("이사일이 되었을 때 완료 처리 크론탭 실행");

    const now = new Date();

    const quotations = await this.quotationRepository.find({
      where: {
        status: In(["PENDING", "CONFIRMED"]),
      },
    });
    const completedQuos = quotations.filter((q) => new Date(q.moveDate) < now);

    if (completedQuos.length > 0) {
      const completedQuoIds = completedQuos.map((cq) => cq.id);
      await this.quotationRepository.update(
        { id: In(completedQuoIds) },
        { status: "COMPLETED" },
      );
      this.logger.log(
        `🔄 ${completedQuos.length}개의 항목 상태를 COMPLETED로 변경`,
      );
    } else {
      this.logger.log("이사 완료 항목 없음");
    }
  }

  /**
   * @TODO 이사 당일에 알림 보내기 >>> 일반 유저, 기사
   * - 확정된 견적
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // 자정마다 실행
  async handleMoveDayNotification() {
    this.logger.log("이사 당일 알림 크론 실행");

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 자정 기준으로 비교

    const confirmedQuotations =
      await this.quotationService.getConfirmedQuotationsByDate(today);

    for (const quotation of confirmedQuotations) {
      const startAddr = quotation.startAddress.split(" ");
      const endAddr = quotation.endAddress.split(" ");

      const segments = [
        { text: "오늘은 ", isHighlight: false },
        {
          text: `${startAddr[0]}(${startAddr[1]}) → ${endAddr[0]}(${endAddr[1]}) 이사 예정일일`,
          isHighlight: true,
        },
        { text: "이에요.", isHighlight: false },
      ];
      // 고객 알림
      await this.notificationService.createNotification(quotation.customerId, {
        type: "MOVE_SCHEDULE",
        segments,
        quotationId: quotation.id,
      });

      // 기사 알림
      await this.notificationService.createNotification(
        quotation.confirmedMoverId,
        {
          type: "MOVE_SCHEDULE",
          segments,
          quotationId: quotation.id,
        },
      );
    }
  }
}
