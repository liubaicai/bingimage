import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BingImage } from './entities/BingImage';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  async getImage(id: number): Promise<BingImage> {
    const repo = this.dataSource.getRepository(BingImage);
    const image = await repo.findOne({ where: { id } });
    return image;
  }

  async getImageByDate(date: string): Promise<BingImage> {
    const repo = this.dataSource.getRepository(BingImage);
    const image = await repo.findOne({
      where: { endDate: date },
    });
    return image;
  }

  async saveImage(image: BingImage): Promise<void> {
    const repo = this.dataSource.getRepository(BingImage);
    await repo.save(image);
  }

  async getImageCount(): Promise<number> {
    const repo = this.dataSource.getRepository(BingImage);
    const count = await repo.count();
    return count;
  }

  async getImageList(page: number, size: number): Promise<BingImage[]> {
    const repo = this.dataSource.getRepository(BingImage);
    const searcher = repo
      .createQueryBuilder('bing_images')
      .select('bing_images')
      .orderBy({
        id: 'DESC',
      })
      .skip(page * size)
      .take(size);
    const images = await searcher.getMany();
    return images;
  }
}
