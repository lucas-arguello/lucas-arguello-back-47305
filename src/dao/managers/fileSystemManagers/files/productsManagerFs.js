import fs from "fs"; // importamos el modulo js
import { logger } from "../../../../helpers/logger.js";

export class ProductsManagerFs {
  //creo la variable path, para luego colocar en ella la ruta del archivo "productos.json"
  constructor(path) {
    this.path = path;
    this.products = [];
  }
  //Validamos si el archivo existe
  fileExist() {
    return fs.existsSync(this.path);
  }
  //se crea el metodo para crear productos
  async createProduct(productInfo) {
    try {
      if (this.fileExist()) {
        //si el archivo existe, 1ro tenemos que leer el contenido del arch,
        const contenido = await fs.promises.readFile(this.path, "utf-8");
        //2do. Transformar de tipo "string" a JSON
        const contenidoJson = JSON.parse(contenido);

        // Verificar si ya existe un producto con el mismo código
        const existingProduct = contenidoJson.find(
          (product) => product.code === productInfo.code
        );

        if (existingProduct) {
          logger.error("Error: Ya existe un producto con el mismo código.");
          return; // No se agrega el producto si ya existe un código igual.
        }

        //ahora para obtener el ultimo id
        const lastId =
          contenidoJson.length > 0
            ? contenidoJson[contenidoJson.length - 1].id
            : 0;
        const newProduct = { id: lastId + 1, ...productInfo };
        //3ro. agregamos la info del producto al [arreglo vacio] de "productos.json"
        contenidoJson.push(newProduct);

        //4to. Sobreescribimos la informac con el nuevo producto.
        await fs.promises.writeFile(
          this.path,
          JSON.stringify(contenidoJson, null, "\t")
        );
        logger.error("Producto agregado");

        return newProduct;
      } else {
        logger.error("Todos los campos son obligatorios");
        throw new Error("no es posible guardar el producto");
      }
    } catch (err) {
      logger.error(err.message);
      //lanzamos el error para poder manejarlo como un error y no como un string.
      throw err;
    }
  }

  //Este método se encarga de obtener la lista completa de todos los productos ,
  //presentes en el archivo "productos.json"
  async getProducts() {
    try {
      if (this.fileExist()) {
        //si el archivo existe, 1ro tenemos que leer el contenido del arch
        const contenido = await fs.promises.readFile(this.path, "utf-8");
        //2do. Transformar de tipo "string" a JSON
        return JSON.parse(contenido);
      }
      else {
      logger.error('No es posible leer el archivo');
      throw new Error('No es posible leer el archivo');
      } 
    }catch (err) {
      logger.error(err.message);
      throw err;
    }
    
  }

  //Este metodo se encarga de buscar en el archivo "productos.json" el producto que coincida con el id.
  async getProductById(id) {
    try {
      //leo el archivo
      const products = await this.getProducts();
      //busco por id
      const prodFound = products.find(prod => prod.id === id)
      if(prodFound) {
          return prodFound
      }
      else{
          logger.error('El producto no existe');
          throw new Error('Producto no encontrado');
      }
      
  } catch (error) {
      logger.error(error.message);
      throw new Error ('El producto es inexistente')
  }
    
  }
  //Este metodo recibe el id del producto a actualizar, así también como el campo a actualizar.
  async updateProduct(id, updatedFields) {
    try {
      if (this.fileExist()) {
        const contenido = await fs.promises.readFile(this.path, "utf-8");
        const contenidoJson = JSON.parse(contenido);

        const index = contenidoJson.findIndex((product) => product.id === id);
        if (index !== -1) {
          contenidoJson[index] = { ...contenidoJson[index], ...updatedFields };
          await fs.promises.writeFile(
            this.path,
            JSON.stringify(contenidoJson, null, "\t")
          );
          logger.error("Producto actualizado");
        }
      }
    } catch (err) {
      logger.error(err.message);
      throw err;
    }
  }
  //Este metodo recibe un id y debe eliminar el producto que tenga ese id en el archivo.
  async deleteProduct(id) {
    try {
      if (this.fileExist()) {
        const contenido = await fs.promises.readFile(this.path, "utf-8");
        const contenidoJson = JSON.parse(contenido);

        const filteredProducts = contenidoJson.filter(
          (product) => product.id !== id
        );
        await fs.promises.writeFile(
          this.path,
          JSON.stringify(filteredProducts, null, "\t")
        );
        logger.error("Producto eliminado");
      }
    } catch (err) {
      logger.error(err.message);
      throw err;
    }
  }
}



