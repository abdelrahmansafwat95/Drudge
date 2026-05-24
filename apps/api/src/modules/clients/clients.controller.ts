import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private service: ClientsService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: any) {
    return this.service.findAll(orgId, query);
  }

  @Get('stats')
  getStats(@CurrentUser('organizationId') orgId: string) {
    return this.service.getStats(orgId);
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

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.toggleActive(id, orgId);
  }

  @Get(':id/visits')
  getVisitHistory(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.getVisitHistory(id, orgId);
  }

  @Post(':id/contracts')
  addContract(@Param('id') id: string, @CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.addContract(id, orgId, dto);
  }
}
