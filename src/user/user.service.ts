import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserSchema } from 'src/types/user-schema.type';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async findWithUsernameOrEmail(usernameOrEmail: string): Promise<UserSchema> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        username: usernameOrEmail
                    },
                    {
                        email: usernameOrEmail
                    }
                ]
            }
        });
        return user;
    }

    async findWithEmailOnly(email: string): Promise<UserSchema> {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        });
        return user;
    }
}   
