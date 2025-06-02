import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ReceivedQuotationMockController } from "./mock.controller";

@Module({
  imports: [AuthModule],
  controllers: [ReceivedQuotationMockController],
})
export class MockApiModule {}
