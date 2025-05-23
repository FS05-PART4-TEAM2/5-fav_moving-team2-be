import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { UserExistsException } from "src/common/exceptions/user-exists.exception";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { MoverLoginResponseDto } from "src/common/dto/login.response.dto";
import { JwtService } from "@nestjs/jwt";
import { AuthService as SharedAuthService } from "src/auth/auth.service";

import { InvalidCredentialsException } from "src/common/exceptions/invalid-credentials.exception";
import { RefreshTokenResponseDto } from "src/common/dto/refreshToken.response.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Mover)
    private readonly moverRepository: Repository<Mover>,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => SharedAuthService))
    private readonly sharedAuthService: SharedAuthService,
  ) {}

  async signUp(SignUpRequestDto: SignUpRequestDto): Promise<Mover> {
    const { username, email, password, phoneNumber } = SignUpRequestDto;

    const existing = await this.moverRepository.findOne({ where: { email } });
    if (existing) {
      throw new UserExistsException({ email: existing.email });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const mover = this.moverRepository.create({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    return this.moverRepository.save(mover);
  }

  async login(
    LoginRequestDto: LoginRequestDto,
  ): Promise<MoverLoginResponseDto> {
    const { email, password } = LoginRequestDto;
    const mover = await this.moverRepository.findOne({
      where: { email },
    });
    if (!mover) {
      throw new InvalidCredentialsException();
    }
    const isPasswordValid = await bcrypt.compare(password, mover.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    const payload = { sub: mover.id, email: mover.email };
    const { accessToken, refreshToken } =
      this.sharedAuthService.generateTokens(payload);
    const response: MoverLoginResponseDto = {
      accessToken,
      refreshToken,
      mover: {
        id: mover.id,
        username: mover.username,
        email: mover.email,
        phoneNumber: mover.phoneNumber,
        profileImage: null,
        serviceArea: null,
        serviceList: null,
        intro: null,
        career: null,
        detailDescription: null,
        likeCount: mover.likeCount,
        totalRating: mover.totalRating,
        reviewCounts: mover.reviewCounts,
        createdAt: mover.createdAt,
      },
    };

    await this.sharedAuthService.recordLogin({
      userType: "mover",
      userId: mover.id,
      accessToken,
      refreshToken,
    });
    return response;
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponseDto> {
    return this.sharedAuthService.refreshAccessToken(refreshToken);
  }
}
