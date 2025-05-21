import { Module } from '@nestjs/common';
import { CustomerAuthModule } from './auth/auth.module';

@Module({
  imports: [CustomerAuthModule]
})
export class CustomerModule {}
