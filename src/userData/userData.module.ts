import { Module } from '@nestjs/common';
import { UserDataController } from './userData.controller';
import { UserDataService } from './userData.service';
import { PrismaService } from 'src/services/prisma.service';
import { SupabaseService } from 'src/services/supabase.service';

@Module({
  controllers: [UserDataController],
  providers: [UserDataService, PrismaService, SupabaseService ]
})
export class UserDataModule {}
