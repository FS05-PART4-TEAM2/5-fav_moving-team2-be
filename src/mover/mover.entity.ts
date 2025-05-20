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

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

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
