import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  findAll(organizationId: string, query?: any) {
    const where: any = { organizationId };
    if (query?.isActive !== undefined) where.isActive = query.isActive === 'true';
    if (query?.search) where.name = { contains: query.search, mode: 'insensitive' };
    return this.prisma.client.findMany({
      where,
      include: { _count: { select: { sites: true, contracts: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, organizationId },
      include: { sites: { include: { zones: true, _count: { select: { visits: true } } } }, contracts: true },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  create(organizationId: string, dto: any) {
    return this.prisma.client.create({ data: { organizationId, ...dto } });
  }

  async update(id: string, organizationId: string, dto: any) {
    const client = await this.prisma.client.findFirst({ where: { id, organizationId } });
    if (!client) throw new NotFoundException('Client not found');
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async toggleActive(id: string, organizationId: string) {
    const client = await this.prisma.client.findFirst({ where: { id, organizationId } });
    if (!client) throw new NotFoundException('Client not found');
    return this.prisma.client.update({ where: { id }, data: { isActive: !client.isActive } });
  }

  async getVisitHistory(id: string, organizationId: string) {
    await this.prisma.client.findFirstOrThrow({ where: { id, organizationId } });
    return this.prisma.visit.findMany({
      where: { site: { clientId: id } },
      include: { site: { select: { name: true } }, team: { select: { name: true } } },
      orderBy: { scheduledAt: 'desc' },
      take: 50,
    });
  }

  async addContract(clientId: string, organizationId: string, dto: any) {
    await this.prisma.client.findFirstOrThrow({ where: { id: clientId, organizationId } });
    return this.prisma.contract.create({ data: { clientId, ...dto } });
  }

  async getStats(organizationId: string) {
    const [total, active, inactive] = await Promise.all([
      this.prisma.client.count({ where: { organizationId } }),
      this.prisma.client.count({ where: { organizationId, isActive: true } }),
      this.prisma.client.count({ where: { organizationId, isActive: false } }),
    ]);
    return { total, active, inactive };
  }
}
