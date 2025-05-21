import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Mover } from "../mover.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { SignUpRequestDto } from "src/common/dto/signup.request.dto";
import { UserExistsException } from "src/common/exceptions/user-exists.exception";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Mover)
    private readonly moverRepository: Repository<Mover>,
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
}
