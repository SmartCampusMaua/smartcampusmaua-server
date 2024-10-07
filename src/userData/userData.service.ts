import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { Request } from 'express';
import { SupabaseService } from 'src/services/supabase.service';

@Injectable()
export class UserDataService {    
    constructor(private prisma: PrismaService, private supabaseClient: SupabaseService) {}
    
    private supabase = this.supabaseClient.getSupabase()

    async getDarkModeData(req: Request) {   
        const session = await this.supabase.auth.getUser(req.cookies["_session"])
        const userData = await this.prisma.user.findUnique({
            where: {
                userId: session.data.user.id
            }})
        return userData.darkmode
    }

    async setDarkModeData(req: Request) {  
        const session = await this.supabase.auth.getUser(req.cookies["_session"])
        const reqBody = await req.body["darkmode"]
        try {
            await this.prisma.user.update({
                where: {
                    userId: session.data.user.id
                },
                data: {
                    darkmode: reqBody,
            }})
            return "Success"
        } catch (error) {
            return error
        }              
    }
}