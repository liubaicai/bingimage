import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bing_images')
export class BingImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  startDate: string;

  @Column({ nullable: true })
  fullStartDate: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  urlBase: string;

  @Column({ nullable: true })
  copyright: string;

  @Column({ nullable: true })
  copyrightLink: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  downloadUrl: string;

  @Column({ nullable: true })
  downloadCount: number;

  @CreateDateColumn({ type: 'date', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'date', nullable: true })
  updatedAt: Date;
}
