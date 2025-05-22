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
import { InvalidCredentialsException } from "src/common/exceptions/invalid-credentials.exception";
import { JwtService } from "@nestjs/jwt";
import { OauthLoginDto } from "./dto/oauthLogin.dto";
import { OauthProviderConflictException } from "src/common/exceptions/oauth-provider-conflict.exception";

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly jwtService: JwtService,
  ) {}

  async signUpOrSignInByOauthCustomer(
    oAuthLoginDto: OauthLoginDto,
  ): Promise<Customer> {
    const existedCustomer = await this.customerRepository.findOne({
      where: {
        email: oAuthLoginDto.email,
      },
    });

    if (existedCustomer) {
      /** 이미 가입한 손님일 때 */

      // 만약 가입한 provider와 일치하지 않으면 예외처리 (중복 가입 방지)
      if (existedCustomer.provider !== oAuthLoginDto.provider) {
        throw new OauthProviderConflictException(existedCustomer.provider);
      }

      // access token, refresh token 발급

      return existedCustomer;
    }

    /** 아직 가입하지 않은 손님일 때 */

    const newCustomerObject = this.customerRepository.create({
      username: oAuthLoginDto.name,
      email: oAuthLoginDto.email,
      profileImage: oAuthLoginDto.photo,
      phoneNumber: "000-0000-0000",
      provider: oAuthLoginDto.provider,
    });

    const newCustomer = await this.customerRepository.save(newCustomerObject);
    return newCustomer;
  }

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
      throw new InvalidCredentialsException();
    }
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload = { sub: customer.id, email: customer.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }); // Auth 엔티티에 refreshToken을 저장하는 로직 추가 예정

    const response: CustomerLoginResponseDto = {
      accessToken,
      refreshToken,

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
