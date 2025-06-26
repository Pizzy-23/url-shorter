import { User } from 'src/user/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('urls')
export class Url {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 6, unique: true })
    shortCode: string;

    @Column('text')
    originalUrl: string;

    @Column({ default: 0 })
    clicks: number;

    @ManyToOne(() => User, (user) => user.urls, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid', nullable: true })
    userId: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
