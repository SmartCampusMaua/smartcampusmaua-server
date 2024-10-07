import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserDataModule } from 'src/userData/userData.module';

@Module({
  imports: [
    ConfigModule.forRoot(), AuthModule, UserDataModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
