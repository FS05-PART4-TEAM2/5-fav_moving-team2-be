import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { UserExistsException } from "src/common/exceptions/user-exists.exception";
import { LoginRequestDto } from "src/common/dto/login.request.dto";
import { MoverLoginResponseDto } from "src/common/dto/login.response.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Mover)
    private readonly moverRepository: Repository<Mover>,
    private readonly jwtService: JwtService,
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
      throw new UserExistsException({ email: email });
    }
    const isPasswordValid = await bcrypt.compare(password, mover.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("비밀번호가 일치하지 않습니다");
    }
    console.log("로그인 성공");
    const payload = { sub: mover.id, email: mover.email };
    console.log("payload", payload);
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

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
    return response;
  }
}
