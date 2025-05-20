import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Mover {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    nickname: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column()
    phonNumber: string;

    @Column({nullable: true})
    img: string;

    @Column('simple-array')
    serviceArea: string[];

    @Column('simple-array')
    serviceList: string[]; 
    
    @Column({nullable: true, type: 'text'})
    intro: string;

    @Column({ nullable: true, type: 'text' })
    career: string;

    @Column({ nullable: true, type: 'text' })
    detailDescription: string;

    @Column({ default: 0 })
    likeCount: number;

    @Column({ default: 0 })
    totalRating: number; // 별점 총점

    @Column({ default: 0 })
    reviewCounts: number; 

    @CreateDateColumn()
    createdAt: Date;

}