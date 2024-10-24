import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get<ConfigService>(ConfigService);

  const smartcampusmauaWebUrl = configService.get<string>('SMARTCAMPUSMAUA_WEB_URL')
  const smartcampusmauaWebPort = configService.get<string>('SMARTCAMPUSMAUA_WEB_PORT')

  const gmsWebUrl = configService.get<string>('GMS_WEB_URL')
  const gmsWebPort = configService.get<string>('GMS_WEB_PORT')

  const smartcampusmauaServerUrl = configService.get<string>('SMARTCAMPUSMAUA_SERVER_URL')
  const smartcampusmauaServerPort = configService.get<string>('SMARTCAMPUSMAUA_SERVER_PORT')

  const corsOptions: CorsOptions = {
    origin: [`${smartcampusmauaWebUrl}:${smartcampusmauaWebPort}`, `${gmsWebUrl}:${gmsWebPort}`, `${smartcampusmauaServerUrl}:${smartcampusmauaServerPort}`], // Allow this origin
    methods: 'GET,POST,OPTIONS',
    credentials: true, // Enable credentials (cookies, authorization headers)
  };

  app.use(cookieParser());
  app.enableCors(corsOptions);

  await app.listen(smartcampusmauaServerPort);
}
bootstrap();
