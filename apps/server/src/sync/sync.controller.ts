import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncService } from './sync.service';
import { SyncPushDto, SyncPullDto } from './dto/sync-push.dto';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  push(@Request() req: any, @Body() dto: SyncPushDto) {
    return this.syncService.pushBills(req.user.id, dto.bills);
  }

  @Post('pull')
  pull(@Request() req: any, @Body() dto: SyncPullDto) {
    return this.syncService.pullBills(req.user.id, dto.lastSyncAt);
  }
}
