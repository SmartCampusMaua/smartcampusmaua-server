import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    constructor(private configService: ConfigService) {}
    
    private supabaseUrl = this.configService.get<string>('SUPABASE_URL')
    private supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY')
    
    private supabase = createClient(this.supabaseUrl!, this.supabaseAnonKey!, {
        auth: {
          detectSessionInUrl: true,
          flowType: 'pkce',
      }});

    getSupabase() {
        return this.supabase
    }
}