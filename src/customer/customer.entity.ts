import { RegionKey } from "src/common/constants/region.constant";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) // OAuth 가입의 경우에는 패스워드 X
  password: string;

  @Column({ nullable: true, default: false })
  isProfile: boolean; // 프로필 정보 등록했는지 여부

  @Column({ nullable: true })
  authType: string;

  @Column({ nullable: true })
  provider: string; // OAuth 제공자 : google, naver, kakao 등

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column("simple-array", { nullable: true })
  wantService: ServiceTypeKey[];

  @Column("simple-array", { nullable: true })
  livingPlace: RegionKey[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
