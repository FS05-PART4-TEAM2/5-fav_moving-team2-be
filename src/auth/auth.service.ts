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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  generateTokens(payload: any) {
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

  async recordLogin(recordLogin: recordLoginDto) {
    const existing = await this.authRepository.findOne({
      where: {
        userType: recordLogin.userType,
        userId: recordLogin.userId,
      },
    });

    if (existing) {
      if (!existing.logoutAt) {
        // 기존 레코드가 유효한 경우 updatedAt만 갱신
        existing.updatedAt = new Date();
        await this.authRepository.save(existing);
        return;
      }
    }

    // 새로운 Auth 레코드 생성
    const record = this.authRepository.create({ ...recordLogin, logoutAt: null });
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
    return this.authRepository.findOne({ where: { accessToken } });
  }

  async saveToken(accessToken: string): Promise<Auth> {
    const auth = this.authRepository.create({ accessToken });
    return this.authRepository.save(auth);
  }

  async validateRefreshToken(refreshToken: string): Promise<Auth | null> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      return this.authRepository.findOne({
        where: { userId: payload.userId, refreshToken },
      });
    } catch (error) {
      return null;
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const existingRecord = await this.authRepository.findOne({
        where: { refreshToken },
      });

      if (!existingRecord) {
        throw new NotFoundException("유효하지 않은 refreshToken입니다.");
      }

      const newAccessToken = this.jwtService.sign(
        {
          userId: payload.userId,
          userType: payload.userType,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      );

      return { accessToken: newAccessToken, refreshToken };
    } catch (error) {
      throw new NotFoundException("refreshToken 검증에 실패했습니다.");
    }
  }

  decodeToken(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      throw new UnauthorizedException("유효하지 않은 토큰입니다.");
    }
  }
}
