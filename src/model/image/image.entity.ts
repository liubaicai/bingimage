import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column()
  fullStartDate: string;

  @Column()
  url: string;

  @Column()
  urlBase: string;

  @Column()
  copyright: string;

  @Column()
  copyrightLink: string;

  @Column()
  thumbnailUrl: string;

  @Column()
  downloadUrl: string;

  @Column({
    type: 'int',
    default: 0,
  })
  downloadCount: number;
}
