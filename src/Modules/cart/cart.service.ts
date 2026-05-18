import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from './entities/cart.entity';
import { CartItemEntity } from './entities/cart-item.entity';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ProductEntity } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findAll() {
    return await this.cartRepository.find({
      order: { id: 'ASC' },
      relations: ['CartItems', 'CartItems.product'],
    });
  }
  async getCart(userId?: number): Promise<CartEntity> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['CartItems', 'CartItems.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId, CartItems: [] });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(
    userId: number | undefined,
    addToCartDto: AddToCartDto,
  ): Promise<CartEntity> {
    const cart = await this.getCart(userId);
    const { productId, quantity } = addToCartDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    let cartItem = cart.CartItems.find((item) => item.product.id === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.price = parseFloat(product.price_discount ?? product.price);
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
        price: parseFloat(product.price_discount ?? product.price),
      });
      cart.CartItems.push(cartItem);
    }

    await this.cartItemRepository.save(cartItem);
    return await this.getCart(userId);
  }

  // async updateItemQuantity(
  //   userId: number | undefined,
  //   itemId: number,
  //   updateCartItemDto: UpdateCartItemDto,
  // ): Promise<CartEntity> {
  //   const cartItem = await this.cartItemRepository.findOne({
  //     where: { id: itemId, cart: { userId } },
  //   });

  //   if (!cartItem) {
  //     throw new NotFoundException(`Cart item with ID ${itemId} not found in your cart`);
  //   }

  //   cartItem.quantity = updateCartItemDto.quantity;
  //   await this.cartItemRepository.save(cartItem);

  //   return await this.getCart(userId);
  // }

  async removeItem(
    userId: number | undefined,
    itemId: number,
  ): Promise<CartEntity> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { userId } },
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Cart item with ID ${itemId} not found in your cart`,
      );
    }

    await this.cartItemRepository.remove(cartItem);
    return await this.getCart(userId);
  }

  async clearCart(userId: number | undefined): Promise<void> {
    const cart = await this.getCart(userId);
    if (cart.CartItems.length > 0) {
      await this.cartItemRepository.remove(cart.CartItems);
    }
  }
}
