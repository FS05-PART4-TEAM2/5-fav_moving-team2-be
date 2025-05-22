import { Injectable } from "@nestjs/common";
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
      Object.assign(existing, recordLogin); // 같은 유저 로그인 정보 존재하면 업데이트
      await this.authRepository.save(existing);
    } else {
      const record = this.authRepository.create(recordLogin); // 새로 생성
      await this.authRepository.save(record);
    }
  }
}
