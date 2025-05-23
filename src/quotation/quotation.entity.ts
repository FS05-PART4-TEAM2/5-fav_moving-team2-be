import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
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

  @Column({ type: "simple-array", nullable: true })
  assignMover: string[];

  @Column({ nullable: true })
  confirmedMoverId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
