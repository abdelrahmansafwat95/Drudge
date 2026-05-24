import { Controller, Get, Post, Put, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChemicalsService } from './chemicals.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chemicals')
@ApiBearerAuth()
@Controller('chemicals')
export class ChemicalsController {
  constructor(private service: ChemicalsService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.service.findAll(orgId);
  }

  @Post()
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.update(id, orgId, dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.toggleActive(id, orgId);
  }
}
