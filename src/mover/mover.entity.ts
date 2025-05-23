import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Mover {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  nickname: string;

  @Column({ nullable: true, default: false })
  isProfile: boolean; // 프로필 정보 등록했는지 여부

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) // OAuth 가입의 경우에는 패스워드 X
  password: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  provider: string; // OAuth 제공자 : google, naver, kakao 등

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  img: string;

  @Column("simple-array", { nullable: true })
  serviceArea: string[];

  @Column("simple-array", { nullable: true })
  serviceList: string[];

  @Column({ nullable: true, type: "text" })
  intro: string;

  @Column({ nullable: true, type: "text" })
  career: string;

  @Column({ nullable: true, type: "text" })
  detailDescription: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  totalRating: number; // 별점 총점

  @Column({ default: 0 })
  reviewCounts: number;

  @CreateDateColumn()
  createdAt: Date;
}
