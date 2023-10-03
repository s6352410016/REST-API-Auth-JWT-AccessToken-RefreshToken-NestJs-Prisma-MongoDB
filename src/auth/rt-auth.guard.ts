import { AuthGuard } from "@nestjs/passport";

export class RtAuthGuard extends AuthGuard("jwt-refresh"){
    
}