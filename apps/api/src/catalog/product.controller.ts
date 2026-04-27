import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { ProductService } from './product.service'

@Controller('v1/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll()
  }

  @Post()
  create(@Body() dto: { name: string; price: number; inventory?: number }) {
    return this.productService.create(dto)
  }
}
