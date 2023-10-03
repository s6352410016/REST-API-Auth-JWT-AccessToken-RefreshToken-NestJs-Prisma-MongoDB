import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcyrpt from 'bcrypt';
import { Token } from 'src/types/token.type';
import { JwtService } from '@nestjs/jwt';
import { UserSchema } from 'src/types/user-schema.type';
import { SignUpDto } from 'src/dto/signup.dto';
import { PrismaService } from 'src/prisma.service';
import { TokenPayload } from 'src/types/token-payload.type';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService
    ) { }

    async createToken(fullname: string, username: string): Promise<Token> {
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(
                {
                    fullname,
                    username
                },
                {
                    expiresIn: "300s",
                    secret: process.env.ACCESS_TOKEN_SECRET
                }
            ),
            this.jwtService.signAsync(
                {
                    fullname,
                    username
                },
                {
                    expiresIn: "1h",
                    secret: process.env.REFRESH_TOKEN_SECRET
                }
            ),
        ]);
        return {
            access_token,
            refresh_token
        }
    }

    async validateUser(usernameOrEmail: string, password: string): Promise<Omit<UserSchema, "password"> | null> {
        const user = await this.userService.findWithUsernameOrEmail(usernameOrEmail);
        if (user && (await bcyrpt.compare(password, user.password))) {
            const { password, ...otherDetail } = user;
            return otherDetail;
        }
        return null;
    }

    async signIn(user): Promise<Token> {
        const { fullname, username } = user;
        return await this.createToken(fullname, username);
    }

    async signUp(signUpDto: SignUpDto): Promise<Token> {
        const { fullname, username, password, email } = signUpDto;

        const userDataWithUsername = await this.userService.findWithUsernameOrEmail(username);
        const userDataWithEmail = await this.userService.findWithEmailOnly(email);

        if (userDataWithUsername || userDataWithEmail) {
            throw new BadRequestException("username or email is already exist.");
        }

        const passwordHash = await bcyrpt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                fullname,
                username,
                password: passwordHash,
                email
            }
        });
        return await this.createToken(user.fullname, user.username);
    }

    async refresh(fullname: string, username: string): Promise<Token> {
        return await this.createToken(fullname, username);
    }
}
