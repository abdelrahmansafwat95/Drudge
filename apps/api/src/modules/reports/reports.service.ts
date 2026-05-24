import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.report.findMany({
      where: { organizationId },
      include: { visit: { include: { site: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, organizationId },
      include: { visit: { include: { site: { include: { client: true, zones: true } }, team: true, checklistItems: true, findings: true, chemicalLogs: { include: { chemical: true } } } } },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async generateVisitReport(organizationId: string, dto: any) {
    const visit = await this.prisma.visit.findFirst({
      where: { id: dto.visitId, site: { client: { organizationId } } },
      include: { site: { include: { client: true, zones: true } }, team: { include: { leader: true } }, checklistItems: true, findings: true, chemicalLogs: { include: { chemical: true } } },
    });
    if (!visit) throw new NotFoundException('Visit not found');

    const title = `Visit Report - ${visit.site.name} - ${new Date(visit.scheduledAt).toLocaleDateString()}`;

    const report = await this.prisma.report.create({
      data: {
        organizationId,
        visitId: dto.visitId,
        title,
        type: 'VISIT',
        language: dto.language || 'en',
        fileUrl: null,
      },
    });

    return { ...report, visitData: visit };
  }

  async generateMonthlyReport(organizationId: string, dto: any) {
    const { year, month } = dto;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const visits = await this.prisma.visit.findMany({
      where: { site: { client: { organizationId } }, scheduledAt: { gte: start, lte: end } },
      include: { site: { include: { client: { select: { name: true } } } }, team: { select: { name: true } } },
    });

    const summary = {
      total: visits.length,
      completed: visits.filter((v) => v.status === 'COMPLETED').length,
      cancelled: visits.filter((v) => v.status === 'CANCELLED').length,
      scheduled: visits.filter((v) => v.status === 'SCHEDULED').length,
    };

    const title = `Monthly Report - ${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;

    const report = await this.prisma.report.create({
      data: { organizationId, title, type: 'MONTHLY', language: dto.language || 'en' },
    });

    return { ...report, summary, visits };
  }

  async remove(id: string, organizationId: string) {
    await this.prisma.report.findFirstOrThrow({ where: { id, organizationId } });
    return this.prisma.report.delete({ where: { id } });
  }
}
