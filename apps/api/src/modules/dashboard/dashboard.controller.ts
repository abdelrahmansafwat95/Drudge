import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('kpis')
  getKPIs(@CurrentUser('organizationId') orgId: string) {
    return this.service.getKPIs(orgId);
  }

  @Get('visits-by-status')
  getVisitsByStatus(@CurrentUser('organizationId') orgId: string) {
    return this.service.getVisitsByStatus(orgId);
  }

  @Get('recent-visits')
  getRecentVisits(@CurrentUser('organizationId') orgId: string) {
    return this.service.getRecentVisits(orgId);
  }
}
