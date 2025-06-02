import { QuotationState } from "src/common/constants/quotation-state.constant";
import { RegionKey } from "src/common/constants/region.constant";
import { ServiceTypeKey } from "src/common/constants/service-type.constant";
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
  moveType: ServiceTypeKey;

  @Column()
  moveDate: string;

  @Column({ nullable: true })
  price: string;

  @Column()
  startAddress: string;

  @Column()
  endAddress: string;

  @Column({ default: "PENDING" })
  status: QuotationState;

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
