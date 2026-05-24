import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Scheduling')
@ApiBearerAuth()
@Controller('scheduling')
export class SchedulingController {
  constructor(private service: SchedulingService) {}

  @Get('schedules')
  findSchedules(@CurrentUser('organizationId') orgId: string) {
    return this.service.findSchedules(orgId);
  }

  @Post('schedules')
  createSchedule(@Body() dto: any) {
    return this.service.createSchedule(dto);
  }

  @Patch('schedules/:id/toggle')
  toggleSchedule(@Param('id') id: string) {
    return this.service.toggleSchedule(id);
  }

  @Get('visits')
  findVisits(@CurrentUser('organizationId') orgId: string, @Query() query: any) {
    return this.service.findVisits(orgId, query);
  }

  @Post('visits')
  createVisit(@Body() dto: any) {
    return this.service.createVisit(dto);
  }

  @Get('visits/today')
  todayVisits(@CurrentUser('organizationId') orgId: string) {
    return this.service.getTodayVisits(orgId);
  }

  @Get('visits/calendar')
  calendar(@CurrentUser('organizationId') orgId: string, @Query('year') year: string, @Query('month') month: string) {
    return this.service.getCalendar(orgId, parseInt(year) || new Date().getFullYear(), parseInt(month) || new Date().getMonth() + 1);
  }

  @Get('visits/dispatch')
  dispatch(@CurrentUser('organizationId') orgId: string) {
    return this.service.getTodayVisits(orgId);
  }

  @Get('visits/:id')
  findVisitById(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.findVisitById(id, orgId);
  }

  @Put('visits/:id')
  updateVisit(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateVisit(id, dto);
  }

  @Patch('visits/:id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }

  @Delete('visits/:id')
  deleteVisit(@Param('id') id: string) {
    return this.service.deleteVisit(id);
  }

  @Patch('visits/:id/checklist/:itemId')
  toggleChecklistItem(@Param('id') visitId: string, @Param('itemId') itemId: string) {
    return this.service.toggleChecklistItem(visitId, itemId);
  }

  @Post('visits/:id/checklist')
  addChecklistItem(@Param('id') visitId: string, @Body() dto: any) {
    return this.service.addChecklistItem(visitId, dto);
  }

  @Post('visits/:id/findings')
  addFinding(@Param('id') visitId: string, @Body() dto: any) {
    return this.service.addFinding(visitId, dto);
  }

  @Put('visits/findings/:findingId')
  updateFinding(@Param('findingId') findingId: string, @Body() dto: any) {
    return this.service.updateFinding(findingId, dto);
  }

  @Delete('visits/findings/:findingId')
  deleteFinding(@Param('findingId') findingId: string) {
    return this.service.deleteFinding(findingId);
  }

  @Post('visits/:id/chemicals')
  logChemical(@Param('id') visitId: string, @Body() dto: any) {
    return this.service.logChemical(visitId, dto);
  }

  @Delete('visits/chemicals/:logId')
  removeChemicalLog(@Param('logId') logId: string) {
    return this.service.removeChemicalLog(logId);
  }

  @Post('visits/:id/signature')
  saveSignature(@Param('id') visitId: string, @Body() dto: any) {
    return this.service.saveSignature(visitId, dto);
  }
}
