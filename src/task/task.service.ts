// tasks.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Quotation } from "src/quotation/quotation.entity";
import { In, Repository } from "typeorm";

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
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
}
