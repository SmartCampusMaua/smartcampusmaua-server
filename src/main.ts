import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.use(cookieParser());

  await app.listen(3001);
}
bootstrap();
