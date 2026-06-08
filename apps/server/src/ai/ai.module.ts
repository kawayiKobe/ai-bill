import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { BillModule } from '../bill/bill.module';

@Module({
  imports: [BillModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
