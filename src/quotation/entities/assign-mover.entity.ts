import { AssignStatusKey } from "src/common/constants/assign-status.constant";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class AssignMover {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  status: AssignStatusKey;

  @Column({ nullable: true })
  rejectedReason: string;

  // tb-Mover
  @Column()
  moverId: string;

  // tb-Customer
  @Column()
  customerId: string;

  // tb-Quotation
  @Column()
  quotationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}
