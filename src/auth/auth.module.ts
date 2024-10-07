import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/services/prisma.service';
import { SupabaseService } from 'src/services/supabase.service';
import { UserDataService } from 'src/userData/userData.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, SupabaseService, UserDataService]
})
export class AuthModule {}
