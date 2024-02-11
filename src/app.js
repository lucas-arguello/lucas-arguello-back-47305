import express from "express" // importamos el modulo "express" para poder usar sus metodos.
//import session from "express-session";
//import MongoStore from "connect-mongo";
import morgan from "morgan";
import { __dirname } from "./utils.js";//importamos la variable "__dirname" que va servir como punto de acceso a los arch. desde "src"
import path from "path";
import {engine} from "express-handlebars";
import {Server} from "socket.io";
import {errorHandler } from './middlewares/errors/errorHandler.js';
import { logger } from "./helpers/logger.js";

//---------- aplico jwt
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { initializePassport } from './config/passport.config.js';
import { config } from './config/config.js';

//---------- aplico documentacion
import { swaggerSpecs } from "./config/swagger.config.js";
import swaggerUi from "swagger-ui-express";

//import { productsService } from "./dao/index.js"; 
import { productsService, chatService } from "./repositories/index.js";


//importo rutas http y las de handlebars
import { viewsRouter } from "./routes/views.routes.js";//importamos las rutas de las vistas.
import { productsRouter } from "./routes/products.routes.js";// importamos la ruta "products"
import { cartsRouter } from "./routes/carts.routes.js";// importamos la ruta "carts"
import { usersSessionsRouter } from "./routes/usersSessions.routes.js";//importamos la ruta de "users"
import { usersRouter } from "./routes/users.routes.js";

const port = config.server.port; //configuro puerto.

const app = express(); //creamos el servidor. Aca tenemos todas las funcionalidades que nos ofrece el modulo "express".

//middleware para hacer accesible la carpeta "public" para todo el proyecto.
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());


//configuramos websockets del lado del servidor (backend), vinculando el servidor http con el servidor de websocket.
//servidor de http
const httpServer = app.listen(port, () => { logger.info(`app listening at http://localhost:${port}`);  }); 
//con el metodo "listen" escuchamos ese punto de acceso "8080"
//servidor de websocket
const io = new Server(httpServer)
//conexxion a la Base de Datos


//configuracion de Handlebars
app.engine('hbs', engine({extname:'.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname,'/views') ); 

//configuracion de passport
initializePassport()//se crean las estrategias
app.use(passport.initialize())//inicializo passport dentro del servidor

//vinculamos las rutas con nuestro servidor con el metodo "use". Son "Middlewares", son funciones intermadiarias.
app.use(viewsRouter); //contiene rutas de tipo GET, porque son las que van a utilizar los usuarios en el navegador.
app.use("/api/products",productsRouter);
app.use("/api/carts",cartsRouter);
app.use("/api/sessions", usersSessionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

//

//socket server- enviamos del servidor al cliente los productos creados hasta el momentopermitimos una actualizacion 
//automatica de los productos creados. Y tambien importamos "productService" para disponer de los productos.
io.on("connection", async (socket)=> {
    logger.info("Cliente Conectado");

    try{
        //Obtengo los productos 
        const products = await productsService.getProducts();
        //y los envio al cliente
        socket.emit("productsArray", products)

        } catch (error) {
            logger.error("Error al obtener los productos", error.message);
            
        }
    

    //Recibimos los productos desde el socketClient de "realTime.js".
    socket.on("addProduct",async (productData) =>{
        try{    
            //creamos los productos
            const createProduct = await productsService.createProduct(productData);

            console.log(createProduct);
            //obtenemos los productos
            const products = await productsService.getProducts();
            //mostramos los productos
            io.emit("productsArray", products)

            } catch (error) {
                logger.error("Error al crear un producto:", error.message);
            }    
        });

    //Eliminamos los produtos.

    socket.on("deleteProduct", async (productId) => {
        try {
            // Eliminar el producto de la lista de productos por su ID
            await productsService.deleteProduct(productId);
            // Obtener la lista actualizada de productos
            const updatedProducts = await productsService.getProducts();
            // Emitir la lista actualizada de productos al cliente
            socket.emit('productsArray', updatedProducts);
            } catch (error) {
                // Manejar errores, por ejemplo, si el producto no se encuentra
                logger.error("Error al eliminar un producto:", error.message);
            }
        });

//Recibimos los mensajes desde el socketClient de "chats.js".
     
    //traigo todos los chat
    const msg = await chatService.getMessages()
    //emito los caht 
    socket.emit("chatHistory", msg)
    //recibo mensaje de cada usuario desde el cliente
    socket.on('msgChat', async (messageClient) => {//recibo el mensaje del front
        try {
            //creo los chat en la base de datos
            await chatService.createMessage(messageClient);
            //obtengo y actualizo los mensajes
            const msg = await chatService.getMessages();
            //replico y envio el mensaje a todos los usuarios
            io.emit('chatHistory', msg);//envio el mensaje
            
        } catch (error) {
            logger.error("Error al eliminar el mensaje:", error.message);
        }

    })
    

});

app.use(errorHandler);
app.use(morgan("dev"));

export { app }

