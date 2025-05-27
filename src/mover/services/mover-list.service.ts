import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { Repository } from "typeorm";
import { MoverListRequestDto } from "../dto/mover-list.request.dto";

@Injectable()
export class MoverListService {
  constructor(
    @InjectRepository(Mover)
    private moverRepository: Repository<Mover>
  ){}

  async getMoverList(moverListRequestDto: MoverListRequestDto) {
    const { keyword, orderBy, region, service } = moverListRequestDto;
  }
}