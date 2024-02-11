import fs from "fs"; // importamos el modulo js
import { logger } from "../../../helpers/logger.js";

class CartsManagerFs {
    //creo la variable path, para luego colocar en ella la ruta del archivo "productos.json"
    constructor(path){
        this.carts = [];
        this.path = path;
        
    };
    //Validamos si el archivo existe
    fileExist(){
        return fs.existsSync(this.path)
    }

    //Este metodo es para obtener el listado de carritos existentes.
    async getCarts() {
        try {
          if (this.fileExist()) {

            const contenidoString = await fs.promises.readFile(this.path, "utf-8");// leemos el archivo
            return JSON.parse(contenidoString);//convertimos el arch de formato String a JSON.
          } else {
            logger.error("No es posible leer el archivo");
            throw new Error("No es posible obtener los carritos");
          }
        } catch (error) {
            logger.error(error.message);
            throw error;
        }
      }

    //Este metodo es para crear carritos.
    async createCart(){
        try{
                const carts = await this.getCarts();//leemos los carritos existentes.

                //creamos un generador de ID de cada nuevo carrito.
                let newId;
                const lastId = carts.length > 0 ? carts[carts.length - 1].id : 0;
                newId = lastId + 1;
                const newCart = { id: newId, products:[],};

                //agregamos la info del carrito al [arreglo vacio] de "carts.json"
                carts.push(newCart);

                //sobreescribo el archivo y guardamos los cambios en el "cart.json"
                await fs.promises.writeFile(this.path,JSON.stringify(carts, null, "\t") );
                
                
                return newCart;
            
        }catch(error){
            logger.error(error.message);
            throw error();
        };

    };
    //Este metodo es para obtener un solo carrito existente.
    async getCartsById(id) {
        try {
          
            const carts = await this.getCarts();//leemos los carritos existentes.

            //busco el carrito por su id
            const existingCart = carts.find(cart => cart.id === id);
                    if(existingCart){
                        return existingCart; 
                        } else {
                            throw new Error("Carrito no encontrado");
                            }
            } catch (error) {
            console.log(error.message);
            throw new Error("El carrito no existe");
            }
      };

    //Este metodo es para agregar productos al carrito.
    async addProduct(cartId, productId, quantity) {
        try {
        //leemos los carritos existentes.
        const carts = await this.getCarts();
        
        //busco el carrito por id
        const existingCart = carts.find(cart => cart.id === cartId);
            if (existingCart) {
                //si existe el carrito, busco el producto por id
                const productFound = existingCart.products.find(prod => prod.id === productId);
                    if(productFound) {
                            //si existe el producto, se suma la cantidad
                            productFound.quantity += quantity;
                        }else{
                            //si NO existe el producto, se agrega al carrito
                            existingCart.products.push({ 
                                id: productId,
                                quantity: quantity
                                });
                            }
                //sobreescribo el archivo y guardamos los cambios en el "cart.json"
                await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"))
                return existingCart
            
            } else {
                logger.error("El carrito no existe");
                throw new Error("El carrito no existe");
            }
        } catch (error) {
            logger.error(error.message);
            throw error;
            }
  };

    
    // deleteCart(){};

};

export {CartsManagerFs};