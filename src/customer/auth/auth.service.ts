import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "../customer.entity";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { UserExistsException } from "src/common/exceptions/user-exists.exception";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async signUp(SignUpRequestDto: SignUpRequestDto): Promise<Customer> {
    const { username, email, password, phoneNumber } = SignUpRequestDto;

    const existingCustomer = await this.customerRepository.findOne({
      where: { email },
    });
    if (existingCustomer) {
      console.log("existingCustomer", existingCustomer.email);
      throw new UserExistsException({ email: existingCustomer.email });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = this.customerRepository.create({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    return this.customerRepository.save(newCustomer);
  }
}
