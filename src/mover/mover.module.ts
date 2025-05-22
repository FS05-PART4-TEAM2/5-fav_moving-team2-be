import { Module } from '@nestjs/common';
import { MoverAuthModule } from './auth/auth.module';

@Module({
  imports: [MoverAuthModule]
})
export class MoverModule {}
