import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sites')
@ApiBearerAuth()
@Controller('sites')
export class SitesController {
  constructor(private service: SitesService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: any) {
    return this.service.findAll(orgId, query);
  }

  @Post()
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.create(orgId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.findOne(id, orgId);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.update(id, orgId, dto);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.getStats(id, orgId);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.toggleActive(id, orgId);
  }

  @Post(':id/zones')
  addZone(@Param('id') id: string, @CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.addZone(id, orgId, dto);
  }

  @Put('zones/:zoneId')
  updateZone(@Param('zoneId') zoneId: string, @Body() dto: any) {
    return this.service.updateZone(zoneId, dto);
  }

  @Delete('zones/:zoneId')
  deleteZone(@Param('zoneId') zoneId: string) {
    return this.service.deleteZone(zoneId);
  }
}
