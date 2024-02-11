//import { cartsDao } from "../dao/index.js";

export class CartsRepository {

    constructor(dao) {
       this.dao = dao 
    }

    async getCarts() {
        return carts = await this.dao.getCarts();
        
    }
    async getCartsId(cartId) {
        return cartId = await this.dao.getCartsId(cartId);
    }
    async createCart() {
        return cart = await this.dao.createCart();
    }
    async addProduct(cartId, productId) {
        return productInCart = await this.dao.addProduct(cartId, productId);
    }
    async updateCartId(cartId, newProduct) {
        return cartIdUpdated = await this.dao.updateCartId(cartId, newProduct);
    } 
    async updateProductInCart(cartId, productId, newQuantity) {
        return productInCartUpdated = await this.dao.updateProductInCart(cartId, productId, newQuantity);
    }
    async deleteCartId(cartId) {
        return cartIdDeleted = await this.dao.deleteCartId(cartId);
    }
    async deleteProductInCart(cartId, productId) {
        return productInCartDeleted = await this.dao.deleteProductInCart(cartId, productId);
    }

    async purchaseCart(cartId) {
        return cartPurchased = await this.dao.purchaseCart(cartId);
    }
}