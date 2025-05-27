import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { MoverInfoService } from "../services/mover-list.service";
import { MoverListRequestDto } from "../dto/mover-list.request.dto";
import { JustLookUserGuard } from "src/common/guards/just-look-user.guard";

@Controller("api/mover")
export class MoverInfoController {
  constructor(private readonly moverInfoService: MoverInfoService) {}

  @Get()
  @UseGuards(JustLookUserGuard)
  async getMoverList(@Req() req,@Query() moverListRequestDto: MoverListRequestDto) {
    console.log(req.user , "hi")
    // return this.moverListService.getMoverList(moverListRequestDto);
    return "test";
  }
}
