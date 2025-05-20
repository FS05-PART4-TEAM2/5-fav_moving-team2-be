import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Mover {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ nullable: true })
  serviceArea: string;

  @Column({ nullable: true })
  serviceList: string;

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
