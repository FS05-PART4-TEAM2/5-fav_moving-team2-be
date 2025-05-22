import { Injectable } from "@nestjs/common";
import { Customer } from "../customer.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomerProfileRequestDto } from "../dto/customer-profile.request.dto";

@Injectable()
export class CustomerProfileService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(request: CustomerProfileRequestDto): Promise<null> {
    // TODO: 고객 프로필 생성 로직 구현 예정
    console.log("create() 호출됨. 요청 데이터:", request);

    return null;
  }
}
