import { cartsService, productsService, ticketService } from "../repositories/index.js";
import { v4 as uuidv4 } from 'uuid';
import { logger } from "../helpers/logger.js";

export class CartsController {

    static getCarts = async (req, res) => {
        try {
            const carts = await cartsService.getCarts();
            logger.error('error getCarts controller', error.message);
            res.json({ message: "Listado de carritos", data: carts });
        } catch (error) {
            logger.error('error getCarts controller', error.message);
            res.json({ status: "error", message: error.message });
        }
    }

    static getCartsId = async (req, res) => {
        try {
            const idcarts = req.params.cid; //obtengo el parametro cid de la URL
            logger.info('getCartsId controller');
            //tarigo el caarito por medio de la populacion
            const carts = await cartsService.getCartsId(idcarts);
            if(carts){
                logger.info('getCartsId controller exist');
                res.json({ message: "Carrito encontrado", data: carts });
            }else{
                logger.info('getCartsId controller no exist');
                res.json({ status: "error", message: "Carrito no encontrado"});
            }
            
          } catch (error) {
            logger.error('error getCartsId controller', error.message);
            res.json({ status: "error", message: error.message });
          }
    }

    static createCart = async (req, res) => {
        try {
            const newCart = await cartsService.createCart();
            logger.info('createCart controller');
            res.json({ message: "Carrito creado", data: newCart });
        } catch (error) {
            logger.error('error createCart controller', error.message);
            res.json({ status: "error", message: error.message });
        }
    }

    static updateCartId = async (req, res) => {
        try {
            logger.info('updateCartId controller');

            const { cid: idCart } = req.params; //obtengo el id del carrito
            const newProduct = req.body;//obtengo el producto
            const updatedCart = await cartsService.updateCartId(idCart, newProduct);// le paso el id y el cuerpo 
            res.json({ message: "Carrito actualizado con exito", data: updatedCart });
        }
        catch (error) {
            logger.error('error updateCartId controller', error.message);
            res.json({ status: "error",  message: error.message });
        }
    }

    static addProduct = async (req, res) => {
        try {
            const { cid: idCarts, pid: idProduct } = req.params;
            const cart = await cartsServiceartsService.getCartsId(idCarts);
            const user = req.user.role;
            const userPremium = req.user._id.toString();
            const productOwner = cart.owner.toString();
            if((productOwner === userPremium) && (user === "admin")) {
                res.json({status: "error", message: "No puedes agregar un producto a un carrito" })
            }else{
                const product = await cartsService.addProduct(cart, idProduct);
                res.json({ message: "success", data: product });
            }

            res.json({ message: "Producto agregado al carrito", data: result });
        } catch (error) {
            logger.info( error.message);
            res.json({ status: "error", message: error.message });
        }
    }

    static updateProductInCart = async (req, res) => {
        try {
            logger.info('updateProductInCart controller');
            const { cid: idCarts, pid: idProduct } = req.params;
            const newQuantity  = req.body.newQuantity;
            const updatedCart = await cartsService.updateProductInCart(idCarts, idProduct, newQuantity);
            res.json({ message: "success", data: updatedCart });
        }
        catch (error) {
            logger.error('error updateProductInCart controller', error.message);
            res.json({ status: "error",  message: error.message });
        }
    }

    static deleteCartId = async (req, res) => {
        try {
            logger.info('deleteCartId controller');
            const { cid: idCarts } = req.params;
            const deletedCart = await cartsService.deleteCartId(idCarts);
            res.json({ message: "Carrito eliminado con exito", data: deletedCart });
            }
        catch (error) {
            logger.error('error deleteCartId controller', error.message);
            res.json({ status: "error",  message: error.message });
        }
    }

    static deleteProductInCart = async (req, res) => {
        try {
            logger.info('deleteProductInCart controller');
            const { cid: idCarts, pid: idProduct } = req.params;
            const deletedProduct = await cartsService.deleteProductInCart(idCarts, idProduct);
            res.json({ message: "Producto eliminado del carrito", data: deletedProduct });
        }
        catch (error) {
            logger.error('error deleteProductInCart controller', error.message);
            res.json({ status: "error",  message: error.message });
        }
    }
    
    static purchaseCart = async (req, res) => {
        try {
            logger.info('Estoy en purchaseCart controller');

            const { cid: idCarts } = req.params;;
            const cart = await cartsService.getCartsId(idCarts)
            
            //verifico que el carrito no este vacio
            if(cart.products.length > 0){
                //tiket de la compra y los rechazados
                const ticketProducts = []
                const rejectedProducts = []
                //varifico el stock de cada producto
                for(let i = 0; i < cart.products.length; i++){

                    const cartProduct = cart.products[i]
                    
                    const productInfo = cartProduct.productId
                    
                    //comparo la quantity con el stock
                    if(cartProduct.quantity <= productInfo.stock){
                        //console.log('Cantidad', cartProduct.quantity, 'stock', productInfo.stock);
                        //agrego el producto al tiket
                        ticketProducts.push(cartProduct)
                       // console.log('tiketProducts:', ticketProducts);
                        //resto el stock del producto comprado
                        const newStock = productInfo.stock -= cartProduct.quantity
                        //console.log('newStock:', newStock);
                    }else{
                        //console.log('Guardo los Rechazado')
                        //agrego los productos rechazados
                        rejectedProducts.push(cartProduct)
                    }
                }
                
                //calculo el total de la compra
                const total = ticketProducts.reduce((acc, item) => acc + item.quantity * item.productId.price, 0)
                //console.log('total:', total);
                const newTicket = {
                    code: uuidv4(), 
                    purchase_datetime: new Date(),
                    amount: total,
                    purchaser: req.user.email,
                }
                
                const tiket = await ticketService.createTiket(newTicket);
                //res.json({ status: "success", message: "Compra realizada", data: tiket });

                if(rejectedProducts.length >=1 && ticketProducts.length >=1){
                    //console.log('Compra con Rechazos', rejectedProducts);
                   
                     //recorro el carrito para borrar los productos
                    for(let i = 0; i < ticketProducts.length; i++){
                        //datos del producto, stock, y carrito
                        let productIdInCart = ticketProducts[i]
                        let productId = productIdInCart.productId._id
                        let stock = productIdInCart.productId.stock
                        
                        //actualizo el stock del producto en db y limpio el carrito 
                        await productsService.updateProduct(productId, {stock:stock})
                        await cartsService.deleteProductInCart(idCarts, productId)
                    }
                                        
                    logger.info('Compra realizada y borro el producto del carrito, dejo el rechazado');
                    res.json({ status: "success", message: "Compra realizada, con rechazos", data: rejectedProducts });

                }else if(rejectedProducts.length >=1 && ticketProducts.length == 0){
                    logger.error('No se puede comprar por falta de stock')

                    res.json({ status: "error", message: "no se puede comprar por falta de stock", data: rejectedProducts });
                    

                }else{
                    for(let i = 0; i < ticketProducts.length; i++){
                        let productIdInCart = ticketProducts[i]
                        let productId = productIdInCart.productId._id
                        let stock = productIdInCart.productId.stock
                                                
                        //actualizo el stock del producto
                        await productsService.updateProduct(productId, {stock:stock})
                        //elimino el producto del carrito
                        await cartsService.deleteProductInCart(idCarts, productId)
                    
                    }
                                        
                    logger('compra realizada(sin rechazos), actualizo el stock y borro el producto del carrito');
                    res.json({ status: "success", message: "compra realizda con exito", data: ticketProducts });
                }
                
            }else{
                logger.error('Controller Purchase,  El carrito esta vacio');
                res.json({ status: "error", message: "El carrito no tiene productos" });
            }
        }
        catch (error) {
            logger.error('error purchaseCart controller', error.message);
            res.json({ status: "error",  message: error.message });
        } 
    }
}