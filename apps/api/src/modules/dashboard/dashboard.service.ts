import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKPIs(organizationId: string) {
    const [totalClients, totalSites, totalTeams, activeAgents, totalVisits, completedVisits, scheduledVisits, inProgressVisits] = await Promise.all([
      this.prisma.client.count({ where: { organizationId, isActive: true } }),
      this.prisma.site.count({ where: { client: { organizationId }, isActive: true } }),
      this.prisma.team.count({ where: { organizationId, isActive: true } }),
      this.prisma.user.count({ where: { organizationId, isActive: true, role: { in: ['AGENT', 'TEAM_LEADER'] } } }),
      this.prisma.visit.count({ where: { site: { client: { organizationId } } } }),
      this.prisma.visit.count({ where: { site: { client: { organizationId } }, status: 'COMPLETED' } }),
      this.prisma.visit.count({ where: { site: { client: { organizationId } }, status: 'SCHEDULED' } }),
      this.prisma.visit.count({ where: { site: { client: { organizationId } }, status: 'IN_PROGRESS' } }),
    ]);

    const completionRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;

    return {
      totalClients,
      totalSites,
      totalTeams,
      activeAgents,
      totalVisits,
      completedVisits,
      scheduledVisits,
      inProgressVisits,
      completionRate,
    };
  }

  async getVisitsByStatus(organizationId: string) {
    const statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    const counts = await Promise.all(
      statuses.map((status) =>
        this.prisma.visit.count({ where: { site: { client: { organizationId } }, status: status as any } }),
      ),
    );
    return statuses.map((status, i) => ({ status, count: counts[i] }));
  }

  async getRecentVisits(organizationId: string) {
    return this.prisma.visit.findMany({
      where: { site: { client: { organizationId } } },
      include: {
        site: { include: { client: { select: { name: true } } } },
        team: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    });
  }
}
