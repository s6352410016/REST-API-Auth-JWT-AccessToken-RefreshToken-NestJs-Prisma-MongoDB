import { Controller, UseGuards, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { Token } from 'src/types/token.type';
import { AuthService } from './auth.service';
import { SignUpDto } from 'src/dto/signup.dto';
import { AtAuthGuard } from './at-auth.guard';
import { RtAuthGuard } from './rt-auth.guard';

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Get("signIn")
    signIn(@Req() req): Promise<Token> {
        return this.authService.signIn(req.user);
    }

    @Post("signUp")
    signUp(@Body() signUpDto: SignUpDto): Promise<Token> {
        return this.authService.signUp(signUpDto);
    }

    @UseGuards(AtAuthGuard)
    @Get("user")
    authUser(@Req() req) {
        return {
            fullname: req.user.fullname,
            username: req.user.username
        }
    }

    @UseGuards(RtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("refresh")
    refresh(@Req() req): Promise<Token>{
        return this.authService.refresh(req.user.fullname , req.user.username);
    }
}
