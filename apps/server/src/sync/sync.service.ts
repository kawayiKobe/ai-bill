import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Bill } from '../bill/entities/bill.entity';
import { SyncBillDto } from './dto/sync-push.dto';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
  ) {}

  async pushBills(userId: string, bills: SyncBillDto[]) {
    const results: { id: string; serverId: string; status: 'created' | 'updated' | 'conflict' }[] = [];

    for (const clientBill of bills) {
      const existing = await this.billRepo.findOne({
        where: { syncId: clientBill.id, userId },
        withDeleted: true,
      });

      if (existing) {
        // Last Write Wins: compare updatedAt
        const clientUpdated = new Date(clientBill.updatedAt);
        const serverUpdated = new Date(existing.updatedAt);

        if (clientUpdated >= serverUpdated) {
          if (clientBill.deletedAt) {
            await this.billRepo.softRemove(existing);
          } else {
            Object.assign(existing, {
              amount: clientBill.amount,
              type: clientBill.type,
              categoryId: clientBill.categoryId,
              note: clientBill.note,
              date: clientBill.date,
            });
            await this.billRepo.save(existing);
          }
          results.push({ id: clientBill.id, serverId: existing.id, status: 'updated' });
        } else {
          results.push({ id: clientBill.id, serverId: existing.id, status: 'conflict' });
        }
      } else {
        const newBill = this.billRepo.create({
          amount: clientBill.amount,
          type: clientBill.type,
          categoryId: clientBill.categoryId,
          note: clientBill.note,
          date: clientBill.date,
          userId,
          syncId: clientBill.id,
        });
        const saved = await this.billRepo.save(newBill);

        if (clientBill.deletedAt) {
          await this.billRepo.softRemove(saved);
        }

        results.push({ id: clientBill.id, serverId: saved.id, status: 'created' });
      }
    }

    return { results };
  }

  async pullBills(userId: string, lastSyncAt?: string) {
    const where: any = { userId };
    if (lastSyncAt) {
      where.updatedAt = MoreThan(new Date(lastSyncAt));
    }

    const bills = await this.billRepo.find({
      where,
      withDeleted: true,
      relations: { category: true },
      order: { updatedAt: 'DESC' },
    });

    return {
      bills: bills.map((b) => ({
        id: b.id,
        amount: Number(b.amount),
        type: b.type,
        categoryId: b.categoryId,
        categoryName: b.category?.name,
        note: b.note,
        date: b.date,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        deletedAt: b.deletedAt?.toISOString() || null,
        syncId: b.syncId,
      })),
      syncedAt: new Date().toISOString(),
    };
  }
}
