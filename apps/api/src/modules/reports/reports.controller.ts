import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.service.findAll(orgId);
  }

  @Post('visit')
  generateVisitReport(@CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.generateVisitReport(orgId, dto);
  }

  @Post('monthly')
  generateMonthlyReport(@CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.generateMonthlyReport(orgId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.findOne(id, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.remove(id, orgId);
  }
}
