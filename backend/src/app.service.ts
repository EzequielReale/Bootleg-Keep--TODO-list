import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    this.logger.log('Running seed...');
    await this.seedUsers();
  }

  private async seedUsers() {
    const testUsers = [
      { email: 'user1@test.com', password: 'Password1!' },
      { email: 'user2@test.com', password: 'Password1!' },
    ];

    for (const u of testUsers) {
      const existingUser = await this.usersService.findByEmail(u.email);
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await this.usersService.create({
          email: u.email,
          password: hashedPassword,
        });
        this.logger.log(`Created test user: ${u.email}`);
      }
    }
  }

  getHello(): string {
    return 'Hello World!';
  }
}
