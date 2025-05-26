import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { Repository } from "typeorm";
import { StorageService } from "src/common/interfaces/storage.service";

@Injectable()
export class MoverProfileService {
  constructor(
    @InjectRepository(Mover)
    private customerRepository: Repository<Mover>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
  ) {}

  modify(userId: string, request): void {
    console.log("mover modify::", userId, request);
  }
}
