import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Quotation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  moveType: string;

  @Column()
  moveDate: string;

  @Column({ nullable: true })
  price: string;

  @Column()
  startAddress: string;

  @Column()
  endAddress: string;

  @Column({ default: "pending" })
  status: "pending" | "confirmed" | "completed" | "deleted";

  @Column()
  customerId: string;

  @Column({ nullable: true })
  confirmedMoverId: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn({ nullable: true })
  updatedAt: Date;

  @CreateDateColumn({ nullable: true })
  deletedAt: Date | null;
}
