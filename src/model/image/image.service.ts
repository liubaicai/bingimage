import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  findAll(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  insert(): Promise<Image> {
    const t = {
      name: 'test',
      description: 'test',
      filename: '123',
      views: 456,
      isPublished: false,
    };
    return this.imageRepository.save(t);
  }
}
