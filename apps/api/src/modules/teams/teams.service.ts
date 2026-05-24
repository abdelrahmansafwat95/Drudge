import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.team.findMany({
      where: { organizationId },
      include: { leader: { select: { id: true, firstName: true, lastName: true } }, members: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } } },
      orderBy: { name: 'asc' },
    });
  }

  create(organizationId: string, dto: any) {
    return this.prisma.team.create({
      data: { organizationId, name: dto.name, branchId: dto.branchId, leaderId: dto.leaderId },
    });
  }

  async update(id: string, organizationId: string, dto: any) {
    const team = await this.prisma.team.findFirst({ where: { id, organizationId } });
    if (!team) throw new NotFoundException('Team not found');
    return this.prisma.team.update({ where: { id }, data: { name: dto.name, branchId: dto.branchId } });
  }

  async remove(id: string, organizationId: string) {
    const team = await this.prisma.team.findFirst({ where: { id, organizationId } });
    if (!team) throw new NotFoundException('Team not found');
    return this.prisma.team.delete({ where: { id } });
  }

  async addMember(teamId: string, userId: string, organizationId: string) {
    await this.prisma.team.findFirstOrThrow({ where: { id: teamId, organizationId } });
    return this.prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId } },
      update: {},
      create: { teamId, userId },
    });
  }

  async removeMember(teamId: string, userId: string) {
    return this.prisma.teamMember.delete({ where: { teamId_userId: { teamId, userId } } });
  }

  async setLeader(teamId: string, userId: string, organizationId: string) {
    await this.prisma.team.findFirstOrThrow({ where: { id: teamId, organizationId } });
    return this.prisma.team.update({ where: { id: teamId }, data: { leaderId: userId } });
  }

  async getPerformance(organizationId: string) {
    const teams = await this.prisma.team.findMany({
      where: { organizationId },
      include: {
        _count: { select: { visits: true } },
        visits: { where: { status: 'COMPLETED' }, select: { id: true } },
      },
    });
    return teams.map((t) => ({
      id: t.id,
      name: t.name,
      totalVisits: t._count.visits,
      completedVisits: t.visits.length,
      completionRate: t._count.visits ? Math.round((t.visits.length / t._count.visits) * 100) : 0,
    }));
  }
}
