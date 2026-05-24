import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private service: OrganizationsService) {}

  @Get('me')
  findMine(@CurrentUser('organizationId') orgId: string) {
    return this.service.findMine(orgId);
  }

  @Put('me')
  update(@CurrentUser('organizationId') orgId: string, @Body() dto: any) {
    return this.service.update(orgId, dto);
  }

  @Get('stats')
  getStats(@CurrentUser('organizationId') orgId: string) {
    return this.service.getStats(orgId);
  }
}
