import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.branch.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  }

  create(organizationId: string, dto: any) {
    return this.prisma.branch.create({ data: { organizationId, ...dto } });
  }

  async update(id: string, organizationId: string, dto: any) {
    const branch = await this.prisma.branch.findFirst({ where: { id, organizationId } });
    if (!branch) throw new NotFoundException('Branch not found');
    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  async remove(id: string, organizationId: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id, organizationId } });
    if (!branch) throw new NotFoundException('Branch not found');
    return this.prisma.branch.delete({ where: { id } });
  }
}
