import { Controller, Get, Post, Put, Delete, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
export class TeamsController {
  constructor(private service: TeamsService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.service.findAll(orgId);
  }

  @Post()
  @Roles('MANAGER' as any)
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.create(orgId, dto);
  }

  @Get('performance')
  performance(@CurrentUser('organizationId') orgId: string) {
    return this.service.getPerformance(orgId);
  }

  @Put(':id')
  @Roles('MANAGER' as any)
  update(@Param('id') id: string, @CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.update(id, orgId, dto);
  }

  @Delete(':id')
  @Roles('MANAGER' as any)
  remove(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.remove(id, orgId);
  }

  @Post(':id/members/:userId')
  @Roles('MANAGER' as any)
  addMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.addMember(id, userId, orgId);
  }

  @Delete(':id/members/:userId')
  @Roles('MANAGER' as any)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.service.removeMember(id, userId);
  }

  @Put(':id/leader/:userId')
  @Roles('MANAGER' as any)
  setLeader(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser('organizationId') orgId: string) {
    return this.service.setLeader(id, userId, orgId);
  }
}
