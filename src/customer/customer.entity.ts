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

  @Column("simple-array")
  wantService: string[];

  @Column("simple-array")
  livingPlace: string[];

  @CreateDateColumn()
  createAt: Date;
}
