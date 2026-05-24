import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SitesService {
  constructor(private prisma: PrismaService) {}

  findAll(organizationId: string, query?: any) {
    const where: any = { client: { organizationId } };
    if (query?.clientId) where.clientId = query.clientId;
    if (query?.isActive !== undefined) where.isActive = query.isActive === 'true';
    return this.prisma.site.findMany({
      where,
      include: { client: { select: { id: true, name: true } }, zones: true, _count: { select: { visits: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const site = await this.prisma.site.findFirst({
      where: { id, client: { organizationId } },
      include: { client: true, zones: true, schedules: { include: { team: { select: { id: true, name: true } } } } },
    });
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  create(organizationId: string, dto: any) {
    return this.prisma.site.create({ data: { clientId: dto.clientId, name: dto.name, address: dto.address, notes: dto.notes, latitude: dto.latitude, longitude: dto.longitude } });
  }

  async update(id: string, organizationId: string, dto: any) {
    await this.prisma.site.findFirstOrThrow({ where: { id, client: { organizationId } } });
    return this.prisma.site.update({ where: { id }, data: dto });
  }

  async toggleActive(id: string, organizationId: string) {
    const site = await this.prisma.site.findFirstOrThrow({ where: { id, client: { organizationId } } });
    return this.prisma.site.update({ where: { id }, data: { isActive: !site.isActive } });
  }

  async addZone(siteId: string, organizationId: string, dto: any) {
    await this.prisma.site.findFirstOrThrow({ where: { id: siteId, client: { organizationId } } });
    return this.prisma.zone.create({ data: { siteId, name: dto.name, description: dto.description } });
  }

  async updateZone(zoneId: string, dto: any) {
    return this.prisma.zone.update({ where: { id: zoneId }, data: dto });
  }

  async deleteZone(zoneId: string) {
    return this.prisma.zone.delete({ where: { id: zoneId } });
  }

  async getStats(id: string, organizationId: string) {
    await this.prisma.site.findFirstOrThrow({ where: { id, client: { organizationId } } });
    const [total, completed, scheduled, cancelled] = await Promise.all([
      this.prisma.visit.count({ where: { siteId: id } }),
      this.prisma.visit.count({ where: { siteId: id, status: 'COMPLETED' } }),
      this.prisma.visit.count({ where: { siteId: id, status: 'SCHEDULED' } }),
      this.prisma.visit.count({ where: { siteId: id, status: 'CANCELLED' } }),
    ]);
    return { total, completed, scheduled, cancelled, completionRate: total ? Math.round((completed / total) * 100) : 0 };
  }
}
