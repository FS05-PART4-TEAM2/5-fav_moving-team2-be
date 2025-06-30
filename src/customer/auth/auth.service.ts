import {
  Injectable,
  Inject,
  forwardRef,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { Customer } from "../customer.entity";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { UserExistsException } from "src/common/exceptions/user-exists.exception";
import * as bcrypt from "bcrypt";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { InvalidCredentialsException } from "src/common/exceptions/invalid-credentials.exception";
import { CustomerLoginResponseDto } from "src/common/dto/login.response.dto";
import { AuthService as SharedAuthService } from "src/auth/auth.service";
import { RefreshTokenResponseDto } from "src/common/dto/refreshToken.response.dto";
import {
  CustomerOauthLoginResponseDto,
  OauthLoginRequestDto,
} from "../../common/dto/oauthLogin.dto";
import { OauthProviderConflictException } from "src/common/exceptions/oauth-provider-conflict.exception";
import { Quotation } from "src/quotation/quotation.entity";
import { StorageService } from "src/common/interfaces/storage.service";

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Quotation)
    private readonly quotationRepository: Repository<Quotation>,
    @Inject("StorageService")
    private readonly storageService: StorageService,
    @Inject(forwardRef(() => SharedAuthService))
    private readonly sharedAuthService: SharedAuthService,
  ) {}

  async signUpOrSignInByOauthCustomer(
    oAuthLoginRequestDto: OauthLoginRequestDto,
  ): Promise<CustomerOauthLoginResponseDto> {
    const existedCustomer = await this.customerRepository.findOne({
      where: {
        email: oAuthLoginRequestDto.email,
      },
    });

    if (existedCustomer) {
      /** 이미 가입한 손님일 때 */

      // 만약 가입한 provider와 일치하지 않으면 예외처리 (중복 가입 방지)
      if (existedCustomer.provider !== oAuthLoginRequestDto.provider) {
        throw new OauthProviderConflictException(existedCustomer.provider);
      }

      // access token, refresh token 발급
      const payload = {
        sub: existedCustomer.id,
        email: existedCustomer.email,
        role: "customer",
        isProfile: existedCustomer.isProfile,
      };
      const { accessToken, refreshToken } =
        this.sharedAuthService.generateTokens(payload);

      const { password, ...existedCustomerWithoutPw } = existedCustomer;

      await this.sharedAuthService.recordLogin({
        userType: "customer",
        userId: existedCustomer.id,
        accessToken,
        refreshToken,
      });

      return {
        refreshToken,
        accessToken,
        type: "customer",
      };
    }

    /** 아직 가입하지 않은 손님일 때 */

    const newCustomerObject = this.customerRepository.create({
      username: oAuthLoginRequestDto.name,
      email: oAuthLoginRequestDto.email,
      phoneNumber: "000-0000-0000",
      provider: oAuthLoginRequestDto.provider,
    });

    const newCustomer = await this.customerRepository.save(newCustomerObject);

    // access token, refresh token 발급
    const payload = {
      sub: newCustomer.id,
      email: newCustomer.email,
      role: "customer",
      isProfile: newCustomer.isProfile,
    };
    const { accessToken, refreshToken } =
      this.sharedAuthService.generateTokens(payload);

    const { password, ...newCustomerWithoutPw } = newCustomer;

    await this.sharedAuthService.recordLogin({
      userType: "customer",
      userId: newCustomer.id,
      accessToken,
      refreshToken,
      provider: newCustomer.provider,
    });

    return {
      refreshToken,
      accessToken,
      type: "customer",
    };
  }

  async signUp(SignUpRequestDto: SignUpRequestDto): Promise<Customer> {
    const { username, email, password, phoneNumber } = SignUpRequestDto;

    // OAuth 설정으로 인해 password 빈 값인지 추가 검증 필요
    if (!password) {
      throw new BadRequestException("패스워드가 비어있으면 안됩니다.");
    }
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
      provider: "default", // 기본 로그인 방식
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
    // 로그인 할 때 provider 일치하지 않으면 예외처리
    if (customer.provider !== "default") {
      throw new InvalidCredentialsException();
    }
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    const payload = {
      sub: customer.id,
      email: customer.email,
      role: "customer",
      isProfile: customer.isProfile,
    };
    const { accessToken, refreshToken } =
      this.sharedAuthService.generateTokens(payload);

    const hasQuotation =
      (await this.quotationRepository.count({
        where: {
          customerId: customer.id,
          moveDate: MoreThan(new Date().toISOString()),
        },
      })) > 0;

    let profileImage = customer.profileImage;
    if (
      typeof this.storageService.getSignedUrlFromS3Url === "function" &&
      profileImage !== null
    ) {
      profileImage =
        await this.storageService.getSignedUrlFromS3Url(profileImage);
    }

    const response: CustomerLoginResponseDto = {
      accessToken,
      refreshToken,
      customer: {
        id: customer.id,
        username: customer.username,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        isProfile: !!customer.profileImage,
        profileImage: profileImage,
        wantService: customer.wantService || null,
        livingPlace: customer.livingPlace || null,
        createdAt: customer.createdAt,
        hasQuotation,
      },
    };

    await this.sharedAuthService.recordLogin({
      userType: "customer",
      userId: customer.id,
      accessToken,
      refreshToken,
    });

    return response;
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponseDto> {
    const tokens =
      await this.sharedAuthService.refreshAccessToken(refreshToken);
    return tokens;
  }
}
