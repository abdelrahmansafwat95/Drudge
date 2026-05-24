import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChemicalsService {
  constructor(private prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.chemical.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
  }

  create(organizationId: string, dto: any) {
    return this.prisma.chemical.create({ data: { organizationId, ...dto } });
  }

  async update(id: string, organizationId: string, dto: any) {
    await this.prisma.chemical.findFirstOrThrow({ where: { id, organizationId } });
    return this.prisma.chemical.update({ where: { id }, data: dto });
  }

  async toggleActive(id: string, organizationId: string) {
    const chem = await this.prisma.chemical.findFirstOrThrow({ where: { id, organizationId } });
    return this.prisma.chemical.update({ where: { id }, data: { isActive: !chem.isActive } });
  }
}
