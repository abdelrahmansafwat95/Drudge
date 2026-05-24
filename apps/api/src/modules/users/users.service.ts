import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, query?: any) {
    const where: any = { organizationId };
    if (query?.role) where.role = query.role;
    if (query?.isActive !== undefined) where.isActive = query.isActive === 'true';
    if (query?.branchId) where.branchId = query.branchId;

    const users = await this.prisma.user.findMany({
      where,
      include: { branch: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(({ passwordHash, refreshTokens, ...u }) => u);
  }

  async findOne(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      include: { branch: true, teamMembers: { include: { team: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshTokens, ...safe } = user;
    return safe;
  }

  async create(organizationId: string, dto: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password || 'Admin@123', 12);
    const user = await this.prisma.user.create({
      data: {
        organizationId,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        branchId: dto.branchId,
      },
    });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async update(id: string, organizationId: string, dto: any) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role,
        branchId: dto.branchId,
      },
    });
    const { passwordHash, ...safe } = updated;
    return safe;
  }

  async toggleActive(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, organizationId } });
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    const { passwordHash, ...safe } = updated;
    return safe;
  }
}
