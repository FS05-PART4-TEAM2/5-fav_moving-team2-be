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

  @Column({ default: false })
  isCompleted: boolean; // 해당 견적에 요청들이 수락된 상태인지 ( 하나 확정하면 관련 요청들 전부 완료 처리)

  @Column({ default: false })
  isConfirmedMover: boolean; //본인이 확정된 mover인지

  @Column({ default: false })
  isReviewed: boolean; // 리뷰가 작성 된 요청인지

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}
