import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class ReceivedQuotation {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column("uuid")
  quotationId: string;

  @Column("uuid")
  customerId: string;

  @Column("uuid")
  moverId: string;

  @Column()
  price: string;

  @Column({ default: false })
  isCompleted: boolean; // 해당 견적에 요청들이 수락된 상태인지 ( 하나 확정하면 관련 요청들 전부 완료 처리)

  @Column({ default: false })
  isConfirmedMover: boolean; //본인이 확정된 mover인지

  @Column({ default: false })
  isReviewed: boolean; // 리뷰가 작성 된 요청인지

  @CreateDateColumn()
  createdAt: Date;
}
