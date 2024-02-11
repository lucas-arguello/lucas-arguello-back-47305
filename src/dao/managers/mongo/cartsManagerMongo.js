import { cartsModel } from "./models/cartsModel.js";
import { logger } from "../../../helpers/logger.js";


export class CartsManagerMongo{
    constructor() {
        this.model = cartsModel;
                
        };
        
        //Esta funcion es para obtener el listado de carritos.
        async getCarts () {
                try {

                    const carts = await this.model.find();
                    logger.info('getCarts ok');
                    return carts

                }catch(error){
                    logger.error('error en manager get carrito: ', error.message);
                    throw new Error("No se pudieron obtener el listado de carritos", error.message);

                };
        };

        //Esta funcion es para obtener un carrito por su ID.
        async getCartsId(cartId) {

                try {//el id lo traigo igual que la DB _id
                    const cart = await this.model.findById(cartId).populate("products.productId").lean();
                    logger.info('getCartsId ok');
                    return cart;
                } catch (error) {
                    logger.error('get carrito', error.message);
                    throw new Error('No se pudo obtener el carrito ', error.message);
                }
        }

        //Esta funcion es para crear el carrito.
        async createCart(){
            try {

                const newCart = {}
                const cart = await this.model.create(newCart);
                logger.info('createCart ok');
                return cart

            } catch (error) {
                logger.error('Error en manager createCart', error.message);
                throw new Error('No se pudo crear el carrito ', error.message);
            }
    }

        //Esta funcion es para agregar productos por su ID, al carrito seleccionado por su ID.
        async addProduct(cartId, productId) {
            try {
                let quantity = 1
                const cart = await this.model.findById(cartId);
    
                if(cart){
                    const { products } = cart;
                    const productExist = products.find((prod) => prod.productId._id.toString() === productId);
                    if(productExist){
                        productExist.quantity += quantity;
                    }else{
                        cart.products.push({ productId: productId, quantity: quantity }); 
    
                    }
                    const result = await this.model.findByIdAndUpdate(cartId, cart, { new: true }).populate('products.productId');
                    logger.info('addProduct ok');
                    return result
                }else{
                    logger.error('error en manager addProduct');
                    throw new Error("No se pudo encontrar el carrito");
                }
            } catch (error) {
                logger.error('Error en manager addProduct', error.message);
                throw new Error('No se pudo agregar el producto ', error.message);
            }
        }

        //Esta funcion deberá actualizar el carrito con un arreglo de productos
        async updateCartId(cartId, newProduct) {
                try {
                    const cart = await this.getCartsId(cartId)
                    if(cart){
                        if(!cart || cart.length === 0){
                            logger.error('El carrito no contiene productos');
                            throw new Error("el carrito no contiene productos");
                        }else{
                            cart.products = newProduct
        
                            const result = await this.model.findByIdAndUpdate(cartId, cart, { new: true })
                            logger.info('updateCartId ok');
                            return result
                        }
                    }else{
                        logger.info('updateCartId ok');
                        throw new Error("No se pudo encontrar el carrito");
                    }
                    
                } catch (error) {
                    logger.error('Error en manager updateCartId', error.message);
                    throw new Error('No se pudo actualizar el carrito', error.message);
                }
        }
            
        //Esta funcion deberá poder actualizar SÓLO la cantidad de ejemplares del producto por 
        //cualquier cantidad pasada desde req.body
        
        async updateProductInCart(cartId, productId, newQuantity) {
            try {
                const cart = await this.getCartsId(cartId)
                if(cart){
                
                    const productIndex =  cart.products.findIndex((prod) => prod.productId._id.toString() === productId)
                              
                    if(productIndex >= 0){
                        cart.products[productIndex].quantity = newQuantity
                        const result = await this.model.findByIdAndUpdate(cartId, cart, { new: true })
                        logger.info('updateProductInCart ok');
                        return result
                    }else{
                        logger.error('error en manager updateProductInCart');
                        throw new Error("No se pudo encontrar el producto");
                    }
                }else{
                    logger.error('error en manager updateProductInCart');
                    throw new Error("No se pudo encontrar el carrito");
                }
    
            } catch (error) {
                logger.error('Error en manager updateProductInCart', error.message);
                throw new Error('No se pudo actualizar el carrito ', error.message);
            }
        }
        

        //Esta funcion es para eliminar un carrito por su ID.
        async deleteCartId(cartId) {
                try {
                    const cart = await this.getCartsId(cartId);
                    if (!cart) {
                        logger.error('error en manager deleteCartId');
                        throw new Error("No se pudo encontrar el carrito a eliminar");
                    }else{
                        await this.model.findByIdAndDelete(cartId)
                    }
                    const result = await this.model.findByIdAndUpdate(cartId, cart, { new: true });
                    logger.info('paso por deleteCartId');
                    return result;
                } catch (error) {
                    logger.error('Error en manager deleteCartId:', error.message);
                    throw new Error('No se pudo eliminar el carrito ', error.message);
                }
        }
            
        //DELETE api/carts/:cid/products/:pid . Esta funcion deberá eliminar del carrito el producto seleccionado.
        async deleteProductInCart(cartId, productId) {
                try {
                    const cart = await this.model.findById(cartId);
        
                    if(cart){
                        const productExist = cart.products.find((prod) => prod.productId._id.toString() === productId.toString());
                                                                    
                        if (productExist) {
                            const newProducts = cart.products.filter((prod) => prod.productId._id.toString() !== productId.toString());
                            cart.products = newProducts
                            const result = await this.model.findByIdAndUpdate(cartId, cart, { new: true })
                            .populate('products.productId');
                            logger.info('deleteProductInCart');
                            return result
                        }else{
                            logger.error('error en manager deleteProductInCart');
                            throw new Error("No se pudo encontrar el producto a eliminar");
                        }
                    }else{
                        logger.error('error en manager deleteProductInCart');
                        throw new Error("No se pudo encontrar el carrito");
                    }
        
                } catch (error) {
                    logger.error('Error en manager deleteProductInCart', error.message);
                    throw new Error('No se pudo eliminar el carrito ', error.message);
                }
        }         
};

