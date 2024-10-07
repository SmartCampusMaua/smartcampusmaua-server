import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000', // Allow this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Enable credentials (cookies, authorization headers)
  };

  app.use(cookieParser());
  app.enableCors(corsOptions);

  await app.listen(3001);
}
bootstrap();
