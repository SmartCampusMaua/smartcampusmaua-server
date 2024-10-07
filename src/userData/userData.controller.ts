import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response  } from 'express';
import { UserDataService } from './userData.service';
import { Request } from 'express';


@Controller('userData')
export class UserDataController {
    constructor(private userDataService: UserDataService) {}
    
    @Get('darkmode')
    async getDarkmode(@Res() res: Response, @Req() req: Request) {
      try {
        const darkModeData = await this.userDataService.getDarkModeData(req);
        // Redireciona o usuário para a página de login do provedor OAuth
        return res.json({ isDarkModeOn: darkModeData });
      } catch (error) {
        return res.json({ isDarkModeOn: false });
      }
    }

    @Get('modules')
    async getModules(@Res() res: Response) {
      try {
        
      } catch (error) {
        return res.json({ error });
      }
    }

    @Post('darkmode')
    async postDarkmode(@Res() res: Response, @Req() req: Request) {
      try {        
        const resul = await this.userDataService.setDarkModeData(req);
        if (resul == "Success")
          return res.json({ result: "OK" });
        else
          return res.json({ result: resul });
      } catch (error) {
        return res.json({ error });
      }
    }

    @Post('modules')
    async postModules(@Res() res: Response) {
      try {
        
      } catch (error) {
        return res.json({ error });
      }
    }
}

