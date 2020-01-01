import { Module, HttpModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './configs/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Image } from './model/image/image.entity';
import { ImageModule } from './model/image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/database.sqlite',
      synchronize: true,
      logging: false,
      entities: [Image],
    }),
    HttpModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
