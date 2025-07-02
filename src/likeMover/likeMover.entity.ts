import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class LikeMover {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  moverId: string;

  @Column()
  customerId: string;

  @CreateDateColumn({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
