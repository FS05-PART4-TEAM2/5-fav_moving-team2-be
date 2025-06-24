import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Auth } from "./auth.entity";
import { Repository } from "typeorm";
import { recordLoginDto } from "src/common/dto/auth-record-login.dto";
import { IsNull } from "typeorm";
import { RefreshTokenResponseDto } from "src/common/dto/refreshToken.response.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  generateTokens(payload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
  }
  // Auth 테이블 조회 후 logoutAt가 Null이면 업데이트, 값이 있다면 새로 생성
  async recordLogin(recordLogin: recordLoginDto) {
    const existing = await this.authRepository.findOne({
      where: {
        userType: recordLogin.userType,
        userId: recordLogin.userId,
        logoutAt: IsNull(), // 로그아웃되지 않은 레코드만 찾기
      },
    });

    if (existing) {
      // logoutAt가 null인 레코드를 찾았으므로 업데이트
      await this.authRepository.update(existing.id, {
        accessToken: recordLogin.accessToken,
        refreshToken: recordLogin.refreshToken,
        updatedAt: new Date(),
      });
      return;
    }

    // 기존 활성 세션이 없으므로 새 레코드 생성
    const record = this.authRepository.create({
      ...recordLogin,
      logoutAt: null,
    });
    await this.authRepository.save(record);
  }

  async logout(accessToken: string): Promise<void> {
    const record = await this.authRepository.findOne({
      where: { accessToken },
    });
    if (!record) {
      throw new NotFoundException("토큰이 존재하지 않습니다.");
    }
    record.logoutAt = new Date();
    await this.authRepository.save(record);
  }

  async findByToken(accessToken: string): Promise<Auth | null> {
    if (!accessToken) return null;
    return this.authRepository.findOne({ where: { accessToken } });
  }

  async saveToken(accessToken: string): Promise<Auth> {
    const auth = this.authRepository.create({ accessToken });
    return this.authRepository.save(auth);
  }

  async validateRefreshToken(refreshToken: string): Promise<Auth | null> {
    try {
      const payload: { userId: string; userType: string } =
        this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET,
        });
      return this.authRepository.findOne({
        where: { userId: payload.userId, refreshToken },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponseDto> {
    try {
      const payload =
        this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_REFRESH_SECRET,
        });

      const existingRecord = await this.authRepository.findOne({
        where: { refreshToken },
      });

      if (!existingRecord) {
        throw new NotFoundException("유효하지 않은 refreshToken입니다.");
      }

      if (existingRecord.logoutAt) {
        throw new NotFoundException(
          "로그아웃된 토큰입니다. 다시 로그인해주세요.",
        );
      }

      const { exp, iat, isProfile, ...rest } = payload;

      const newAccessToken = this.jwtService.sign(
        rest,
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      );

      await this.authRepository.update(existingRecord.id, {
        accessToken: newAccessToken,
        refreshToken,
        updatedAt: new Date(),
      });
      return { accessToken: newAccessToken, refreshToken };
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException("refreshToken 검증에 실패했습니다.");
    }
  }

  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException("유효하지 않은 토큰입니다.");
    }
  }
}
