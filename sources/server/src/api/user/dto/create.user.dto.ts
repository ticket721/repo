import {IsEmail}  from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;
    username: string;
    password: string;
    type: string;
    wallet: string;
    address: string;
}
