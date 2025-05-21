import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "../customer.entity";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { UserExistsException } from "src/common/exceptions/user-exists.exception";
import * as bcrypt from "bcrypt";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { error } from "console";
import { CustomerLoginResponseDto } from "src/common/dto/login.response.dto";

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async signUp(SignUpRequestDto: SignUpRequestDto): Promise<Customer> {
    const { username, email, password, phoneNumber } = SignUpRequestDto;

    const existing = await this.customerRepository.findOne({
      where: { email },
    });
    if (existing) {
      console.log("existingCustomer", existing.email);
      throw new UserExistsException({ email: existing.email });
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

  async login(
    LoginRequestDto: LoginRequestDto,
  ): Promise<CustomerLoginResponseDto> {
    const { email, password } = LoginRequestDto;
    const customer = await this.customerRepository.findOne({
      where: { email },
    });
    if (!customer) {
      throw new UserExistsException({ email: email });
    }
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(" 비밀번호가 일치하지 않습니다");
    }

    const response: CustomerLoginResponseDto = {
      customer: {
        id: customer.id,
        username: customer.username,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        profileImage: null,
        wantService: null,
        livingPlace: null,
        createdAt: customer.createdAt,
      },
    };

    return response;
  }
}
