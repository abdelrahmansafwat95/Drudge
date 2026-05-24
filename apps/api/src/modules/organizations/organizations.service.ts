import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findMine(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(organizationId: string, dto: any) {
    return this.prisma.organization.update({
      where: { id: organizationId },
      data: { name: dto.name, email: dto.email, phone: dto.phone, address: dto.address, logoUrl: dto.logoUrl },
    });
  }

  async getStats(organizationId: string) {
    const [totalUsers, totalClients, totalSites, totalVisits, completedVisits] = await Promise.all([
      this.prisma.user.count({ where: { organizationId, isActive: true } }),
      this.prisma.client.count({ where: { organizationId, isActive: true } }),
      this.prisma.site.count({ where: { client: { organizationId } } }),
      this.prisma.visit.count({ where: { site: { client: { organizationId } } } }),
      this.prisma.visit.count({ where: { status: 'COMPLETED', site: { client: { organizationId } } } }),
    ]);
    return { totalUsers, totalClients, totalSites, totalVisits, completedVisits };
  }
}
