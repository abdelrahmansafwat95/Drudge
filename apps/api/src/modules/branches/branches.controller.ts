import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.service.findAll(orgId);
  }

  @Post()
  @Roles('ADMIN' as any)
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.create(orgId, dto);
  }

  @Put(':id')
  @Roles('ADMIN' as any)
  update(@Param('id') id: string, @CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.update(id, orgId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN' as any)
  remove(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.remove(id, orgId);
  }
}
