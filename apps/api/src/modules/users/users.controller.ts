import { Controller, Get, Post, Put, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('MANAGER' as any)
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: any) {
    return this.usersService.findAll(orgId, query);
  }

  @Post()
  @Roles('ADMIN' as any)
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.usersService.create(orgId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.usersService.findOne(id, orgId);
  }

  @Put(':id')
  @Roles('ADMIN' as any)
  update(@Param('id') id: string, @CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.usersService.update(id, orgId, dto);
  }

  @Patch(':id/toggle-active')
  @Roles('ADMIN' as any)
  toggleActive(@Param('id') id: string, @CurrentUser('organizationId') orgId: string) {
    return this.usersService.toggleActive(id, orgId);
  }
}
