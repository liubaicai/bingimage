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

  insert(image): Promise<Image> {
    return this.imageRepository.save(image);
  }
}
