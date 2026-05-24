import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  private visitInclude = {
    site: { include: { client: { select: { id: true, name: true } } } },
    team: { include: { leader: { select: { id: true, firstName: true, lastName: true } } } },
    checklistItems: true,
    findings: true,
    chemicalLogs: { include: { chemical: true } },
  };

  findSchedules(organizationId: string) {
    return this.prisma.schedule.findMany({
      where: { site: { client: { organizationId } } },
      include: { site: { include: { client: { select: { id: true, name: true } } } }, team: { select: { id: true, name: true } } },
    });
  }

  createSchedule(dto: any) {
    return this.prisma.schedule.create({ data: dto });
  }

  async toggleSchedule(id: string) {
    const s = await this.prisma.schedule.findUniqueOrThrow({ where: { id } });
    return this.prisma.schedule.update({ where: { id }, data: { isActive: !s.isActive } });
  }

  findVisits(organizationId: string, query?: any) {
    const where: any = { site: { client: { organizationId } } };
    if (query?.status) where.status = query.status;
    if (query?.siteId) where.siteId = query.siteId;
    if (query?.teamId) where.teamId = query.teamId;
    if (query?.from || query?.to) {
      where.scheduledAt = {};
      if (query.from) where.scheduledAt.gte = new Date(query.from);
      if (query.to) where.scheduledAt.lte = new Date(query.to);
    }
    return this.prisma.visit.findMany({
      where,
      include: this.visitInclude,
      orderBy: { scheduledAt: 'desc' },
      take: query?.limit ? parseInt(query.limit) : 100,
    });
  }

  createVisit(dto: any) {
    return this.prisma.visit.create({ data: { siteId: dto.siteId, teamId: dto.teamId, scheduledAt: new Date(dto.scheduledAt), notes: dto.notes, scheduleId: dto.scheduleId }, include: this.visitInclude });
  }

  async findVisitById(id: string, organizationId: string) {
    const visit = await this.prisma.visit.findFirst({
      where: { id, site: { client: { organizationId } } },
      include: this.visitInclude,
    });
    if (!visit) throw new NotFoundException('Visit not found');
    return visit;
  }

  async updateVisit(id: string, dto: any) {
    return this.prisma.visit.update({ where: { id }, data: { notes: dto.notes, scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined, teamId: dto.teamId }, include: this.visitInclude });
  }

  async updateStatus(id: string, status: string) {
    const data: any = { status };
    if (status === 'IN_PROGRESS') data.startedAt = new Date();
    if (status === 'COMPLETED') data.completedAt = new Date();
    return this.prisma.visit.update({ where: { id }, data, include: this.visitInclude });
  }

  deleteVisit(id: string) {
    return this.prisma.visit.delete({ where: { id } });
  }

  async getTodayVisits(organizationId: string) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return this.prisma.visit.findMany({
      where: { site: { client: { organizationId } }, scheduledAt: { gte: start, lte: end } },
      include: this.visitInclude,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getCalendar(organizationId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const visits = await this.prisma.visit.findMany({
      where: { site: { client: { organizationId } }, scheduledAt: { gte: start, lte: end } },
      include: { site: { select: { name: true } }, team: { select: { name: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
    const calendar: Record<string, any[]> = {};
    visits.forEach((v) => {
      const key = v.scheduledAt.toISOString().split('T')[0];
      if (!calendar[key]) calendar[key] = [];
      calendar[key].push(v);
    });
    return calendar;
  }

  async toggleChecklistItem(visitId: string, itemId: string) {
    const item = await this.prisma.checklistItem.findUniqueOrThrow({ where: { id: itemId } });
    return this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted: !item.isCompleted, completedAt: !item.isCompleted ? new Date() : null },
    });
  }

  addChecklistItem(visitId: string, dto: any) {
    return this.prisma.checklistItem.create({ data: { visitId, description: dto.description } });
  }

  addFinding(visitId: string, dto: any) {
    return this.prisma.finding.create({ data: { visitId, description: dto.description, severity: dto.severity || 'LOW', location: dto.location } });
  }

  updateFinding(findingId: string, dto: any) {
    return this.prisma.finding.update({ where: { id: findingId }, data: dto });
  }

  deleteFinding(findingId: string) {
    return this.prisma.finding.delete({ where: { id: findingId } });
  }

  logChemical(visitId: string, dto: any) {
    return this.prisma.chemicalLog.create({ data: { visitId, chemicalId: dto.chemicalId, quantity: dto.quantity, notes: dto.notes }, include: { chemical: true } });
  }

  removeChemicalLog(logId: string) {
    return this.prisma.chemicalLog.delete({ where: { id: logId } });
  }

  async saveSignature(visitId: string, dto: any) {
    return this.prisma.visit.update({ where: { id: visitId }, data: { signature: dto.signature, signedBy: dto.signedBy } });
  }
}
