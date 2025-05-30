import { Controller } from "@nestjs/common";
import { MoverQuotationService } from "../services/mover-quotation.service";

@Controller("api/quotation/mover")
export class MoverQuotationController {
  constructor(private readonly moverQuotationService: MoverQuotationService) {}

  /**
   * @TODO GET 받은 요청 목록 조회 API
   */

  /**
   * @TODO POST 받은 요청에 견적 보내기 API
   */

  /**
   * @TODO POST 받은 요청에 견적 보내기 API
   */
}
