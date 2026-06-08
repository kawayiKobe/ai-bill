import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BillModule } from './bill/bill.module';
import { CategoryModule } from './category/category.module';
import { SyncModule } from './sync/sync.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: 'ai_bill.db',
      autoSave: true,
      autoLoadEntities: true,
      synchronize: true, // dev only — use migrations in production
    }),
    AuthModule,
    BillModule,
    CategoryModule,
    SyncModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
