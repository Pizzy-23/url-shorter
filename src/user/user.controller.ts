import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Email is already in use.' })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const newUser = await this.userService.create(createUserDto);
    const response: UserResponseDto = {
      id: newUser.id,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
    return response;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a list of all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
}
