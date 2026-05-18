import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { CartEntity } from './entities/cart.entity';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  @ApiResponse({
    status: 200,
    description: 'Return the cart.',
    type: CartEntity,
  })
  getCart() {
    return this.cartService.findAll();
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiResponse({
    status: 201,
    description: 'Item added successfully.',
    type: CartEntity,
  })
  addToCart(@Body() addToCartDto: AddToCartDto) {
    const userId = undefined;
    return this.cartService.addToCart(userId, addToCartDto);
  }

  // @Patch('items/:id')
  // @ApiOperation({ summary: 'Update cart item quantity' })
  // @ApiResponse({ status: 200, description: 'Quantity updated.', type: CartEntity })
  // updateItem(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateCartItemDto: UpdateCartItemDto,
  // ) {
  //   const userId = undefined;
  //   return this.cartService.updateItemQuantity(userId, id, updateCartItemDto);
  // }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiResponse({ status: 200, description: 'Item removed.', type: CartEntity })
  removeItem(@Param('id', ParseIntPipe) id: number) {
    const userId = undefined;
    return this.cartService.removeItem(userId, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared.' })
  clearCart() {
    const userId = undefined;
    return this.cartService.clearCart(userId);
  }
}
