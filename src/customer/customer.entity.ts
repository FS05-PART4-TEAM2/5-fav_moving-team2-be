import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column("simple-array", { nullable: true })
  wantService: String[];

  @Column("simple-array", { nullable: true })
  livingPlace: string[];

  @CreateDateColumn()
  createAt: Date;
}
