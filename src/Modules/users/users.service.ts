import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../../utilies/enums/user-role';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminEmail = 'super-admin@ecommerce.com';
    const adminPassword = '16102000';

    const adminExists = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      await this.userRepository.save(admin);
      console.log('Super-admin user created successfully.');
    } else {
      console.log('Super-admin user already exists.');
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { email } });
  }
}
