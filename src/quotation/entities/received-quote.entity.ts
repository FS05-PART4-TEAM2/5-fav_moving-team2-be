import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class ReceivedQuote {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  price: number;

  @Column()
  comment: string;

  @Column()
  isAssignQuo: boolean;

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
  updatedAt: Date | null;
}
