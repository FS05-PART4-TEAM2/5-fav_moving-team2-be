import { Controller, Get, Query, Req } from "@nestjs/common";
import { MoverListService } from "../services/mover-list.service";
import { MoverListRequestDto } from "../dto/mover-list.request.dto";

@Controller("api/mover")
export class MoverListController {
  constructor(private readonly moverListService: MoverListService) {}

  @Get()
  async getMoverList(@Query() moverListRequestDto: MoverListRequestDto) {
    return this.moverListService.getMoverList(moverListRequestDto);
  }
}
