import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
  BadRequestException,
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
import {
  MoverOauthLoginResponseDto,
  OauthLoginRequestDto,
} from "src/common/dto/oauthLogin.dto";
import { OauthProviderConflictException } from "src/common/exceptions/oauth-provider-conflict.exception";

@Injectable()
export class MoverAuthService {
  constructor(
    @InjectRepository(Mover)
    private readonly moverRepository: Repository<Mover>,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => SharedAuthService))
    private readonly sharedAuthService: SharedAuthService,
  ) {}

  async signUpOrSignInByOauthMover(
    oAuthLoginRequestDto: OauthLoginRequestDto,
  ): Promise<MoverOauthLoginResponseDto> {
    const existedMover = await this.moverRepository.findOne({
      where: {
        email: oAuthLoginRequestDto.email,
      },
    });

    if (existedMover) {
      /** 이미 가입한 기사일 때 */

      // 만약 가입한 provider와 일치하지 않으면 예외처리 (중복 가입 방지)
      if (existedMover.provider !== oAuthLoginRequestDto.provider) {
        throw new OauthProviderConflictException(existedMover.provider);
      }

      // access token, refresh token 발급
      const payload = { sub: existedMover.id, email: existedMover.email, role: "mover" };
      const { accessToken, refreshToken } =
        this.sharedAuthService.generateTokens(payload);

      const { password, ...existedMoverWithoutPw } = existedMover;

      await this.sharedAuthService.recordLogin({
        userType: "mover",
        userId: existedMover.id,
        accessToken,
        refreshToken,
      });

      return {
        refreshToken,
        accessToken,
        type: "mover",
      };
    }

    /** 아직 가입하지 않은 기사일 때 */

    const newMoverObject = this.moverRepository.create({
      username: oAuthLoginRequestDto.name,
      email: oAuthLoginRequestDto.email,
      profileImage: oAuthLoginRequestDto.photo,
      phoneNumber: "000-0000-0000",
      provider: oAuthLoginRequestDto.provider,
    });

    const newMover = await this.moverRepository.save(newMoverObject);

    // access token, refresh token 발급
    const payload = { sub: newMover.id, email: newMover.email, role: "mover" };
    const { accessToken, refreshToken } =
      this.sharedAuthService.generateTokens(payload);

    const { password, ...newMoverWithoutPw } = newMover;

    await this.sharedAuthService.recordLogin({
      userType: "mover",
      userId: newMover.id,
      accessToken,
      refreshToken,
    });

    return {
      refreshToken,
      accessToken,
      type: "mover",
    };
  }

  async signUp(SignUpRequestDto: SignUpRequestDto): Promise<Mover> {
    const { username, email, password, phoneNumber } = SignUpRequestDto;

    // OAuth 설정으로 인해 password 빈 값인지 추가 검증 필요
    if (!password) {
      throw new BadRequestException("패스워드가 비어있으면 안됩니다.");
    }

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
      provider: "default", // 기본 로그인 방식
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
    // 로그인 할 때 provider 일치하지 않으면 예외처리
    if (mover.provider !== "default") {
      throw new InvalidCredentialsException();
    }
    const isPasswordValid = await bcrypt.compare(password, mover.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }
    const payload = { sub: mover.id, email: mover.email, role: "mover" };
    const { accessToken, refreshToken } =
      this.sharedAuthService.generateTokens(payload);
    const response: MoverLoginResponseDto = {
      accessToken,
      refreshToken,
      mover: {
        id: mover.id,
        username: mover.username,
        nickname: mover.nickname,
        email: mover.email,
        phoneNumber: mover.phoneNumber,
        isProfile: !!mover.profileImage,
        profileImage: mover.profileImage || null,
        serviceArea: mover.serviceArea || null,
        serviceList: mover.serviceList || null,
        intro: mover.intro || null,
        career: mover.career || null,
        detailDescription: mover.detailDescription || null,
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
