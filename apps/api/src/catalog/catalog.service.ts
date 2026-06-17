import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const productInclude = {
  category: true,
  seller: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.ProductInclude;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async listProducts(categoryId?: string) {
    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    });

    return products.map((product) => this.serializeProduct(product));
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, status: ProductStatus.ACTIVE },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException('product not found');
    }

    return this.serializeProduct(product);
  }

  async listSellerProducts(sellerId: string) {
    const products = await this.prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: productInclude,
    });

    return products.map((product) => this.serializeProduct(product));
  }

  async createSellerProduct(
    sellerId: string,
    body: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      images?: string[];
    },
  ) {
    const payload = await this.validateProductInput(body);

    const product = await this.prisma.product.create({
      data: {
        ...payload,
        sellerId,
        status: ProductStatus.ACTIVE,
      },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async updateSellerProduct(
    sellerId: string,
    productId: string,
    body: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      categoryId?: string;
      images?: string[];
      status?: ProductStatus;
    },
  ) {
    const existing = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!existing || existing.sellerId !== sellerId) {
      throw new NotFoundException('product not found');
    }

    const data: Prisma.ProductUpdateInput = {};
    if (body.name !== undefined) {
      if (!body.name.trim()) throw new BadRequestException('name is required');
      data.name = body.name.trim();
    }
    if (body.description !== undefined) {
      if (!body.description.trim()) throw new BadRequestException('description is required');
      data.description = body.description.trim();
    }
    if (body.price !== undefined) {
      if (Number(body.price) <= 0) throw new BadRequestException('price must be greater than 0');
      data.price = Number(body.price);
    }
    if (body.stock !== undefined) {
      if (!Number.isInteger(body.stock) || body.stock < 0) {
        throw new BadRequestException('stock must be a non-negative integer');
      }
      data.stock = body.stock;
    }
    if (body.categoryId !== undefined) {
      await this.ensureCategory(body.categoryId);
      data.category = { connect: { id: body.categoryId } };
    }
    if (body.images !== undefined) {
      data.images = this.normalizeImages(body.images);
    }
    if (body.status !== undefined) {
      data.status = body.status;
    }

    const product = await this.prisma.product.update({
      where: { id: productId },
      data,
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  async archiveSellerProduct(sellerId: string, productId: string) {
    const existing = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!existing || existing.sellerId !== sellerId) {
      throw new NotFoundException('product not found');
    }

    const product = await this.prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.ARCHIVED },
      include: productInclude,
    });

    return this.serializeProduct(product);
  }

  private async validateProductInput(body: {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    categoryId?: string;
    images?: string[];
  }) {
    const name = body.name?.trim();
    const description = body.description?.trim();
    const price = Number(body.price);
    const stock = Number(body.stock);

    if (!name || !description || !body.categoryId) {
      throw new BadRequestException('name, description, categoryId are required');
    }
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException('price must be greater than 0');
    }
    if (!Number.isInteger(stock) || stock < 0) {
      throw new BadRequestException('stock must be a non-negative integer');
    }

    await this.ensureCategory(body.categoryId);

    return {
      name,
      description,
      price,
      stock,
      images: this.normalizeImages(body.images),
      categoryId: body.categoryId,
    };
  }

  private async ensureCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new BadRequestException('category not found');
    }
  }

  private normalizeImages(images?: string[]) {
    return (images || []).filter(Boolean).map((image) => image.trim()).filter(Boolean);
  }

  private serializeProduct(product: Prisma.ProductGetPayload<{ include: typeof productInclude }>) {
    return {
      ...product,
      price: Number(product.price),
    };
  }
}
