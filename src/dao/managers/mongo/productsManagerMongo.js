
import { logger } from '../../../helpers/logger.js';

import { productsModel } from "./models/productsModel.js";

export class ProductsManagerMongo{
    constructor(){
        this.model = productsModel;
        
    };

    //Esta funcion es para crear el producto.
        
    async createProduct(productInfo){
        try {
            const product = await this.model.create(productInfo);
            logger.info('paso por manager createProduct');
            return product;
        } catch (error) {
            //mensaje interno
            logger.error('Error en manager createProduct',error.message);
            throw new Error("No se pudo crear el producto");
        }
    };

    //Esta funcion es para obtener el listado de productos.
    async getProducts(){
        try {
            //tilice el metodo ".lean()" para que me permitiera usar la propiedad "title"
            const products = await this.model.find().lean();
            logger.info('paso por manager getProducts');
            return products;
        } catch (error) {
             //mensaje interno
             logger.error('error en manager getProducts',error.message);
            throw new Error("No se pudo obtener el listado de productos");
        }
    };

    //Esta funcion es para obtener un producto por su ID
    async getProductById(productId){
        try {
            const product = await this.model.findById(productId);
            logger.error('paso por manager getProductById');
            return product;
        } catch (error) {
             //mensaje interno
             logger.info('error en manager getProductById',error.message);
             //nmensaje al cliente
            throw new Error("No se pudo obtener el producto");
        }
    };

    //Esta funcion es para actualizar un producto seleccionado por su ID.
    async updateProduct(prodcutId, newProduct){
        try {
            logger.info('paso por manager updateProduct');
            //uso el modelo definido y el metodo de mongo
            const resultado = await this.model.findOneAndUpdate({_id: prodcutId}, newProduct, {new: true});//tambien se puede usar updateOne({_id: id}, product)
            if(!resultado){
                logger.error('No se pudo encontrar el producto, para actualizarlo');
                throw new Error('No se pudo encontrar el producto, para actualizarlo');
            }
            console.log('updateProduct con exito', resultado);
            return resultado
        } catch (error) {
            //mensaje interno
            console.log('Error en manager updateProduct',error.message);
            //nmensaje al cliente
            throw new Error('No se pudo actualizar el producto',error.message);
        }
    }
   
    //Esta funcion es para eliminar un producto seleccionado por su ID..
    async deleteProduct(productId){
        try {
            const product = await this.model.findByIdAndDelete(productId);
           
            if(!product){
                logger.error('No se pudo encontrar el producto a eliminar');
                return null;
                //throw new Error("No se pudo encontrar el producto a eliminar");
            }
            logger.info('paso por manager deleteProduct');
            
        } catch (error) {
            logger.error('Error en manager deleteProduct',error.message);
            throw new Error("No se pudo eliminar el producto");
        }
    };

    //metodo para obtener productos del paginate
    async getProductsPaginate(query, options){
        try {
            const result = await this.model.paginate(query, options);
            logger.info('paso por manager getProductsPaginate');
            return result
            
        } catch (error) {
            logger.error('error en manager getProductsPaginate',error.message);
            throw new Error('No se pudo obtener el listado de  producto',error.message);
        };
    };
};