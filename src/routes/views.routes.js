import {Router} from "express";//importamos "routes" desde la libreria de express
import { authorization, jwtAuth } from '../middlewares/auth.js';
import { ViewsController } from '../controller/views.controller.js';
import { logger } from "../helpers/logger.js";

const router = Router();


//ruta para la vista home de todos los productos
router.get('/', jwtAuth, authorization(["Usuario", "admin", "premium"]), ViewsController.renderViewsHome);

//ruta para login
router.get('/login', authorization(["Usuario", "admin", "premium"]), ViewsController.renderViewsLogin);

//ruta para register local
router.get('/register', ViewsController.renderViewsRegister);

//ruta para el perfil de usuario
router.get('/profile', jwtAuth, authorization(["Usuario", "admin", "premium"]), ViewsController.renderViewsProfile);


//ruta para ver los productos en tiempo real y eliminar productos. 
router.get("/realtimeproducts", jwtAuth, authorization(['admin', "premium"]), ViewsController.renderViewsRealTime);

//ruta que esta vinculada al servidor de "websocket"
router.get("/chats", jwtAuth, authorization(["Usuario", "admin", "premium"]), ViewsController.renderViewsMessage);

//pagiante// localhost:8080?page=1 ... 2 ...3 ..etc
router.get('/products', jwtAuth, authorization(["Usuario", "admin", "premium"]), ViewsController.renderViewsProducts);

//ruta hardcodeada localhost:8080/cart/652832e702a5657f7db4c22e
router.get('/cart/:cid', authorization(["Usuario", "admin", "premium"]), ViewsController.renderViewsCart);

//restablecer password
router.get('/forgot-password', (req, res) => {
    res.render('forgotPassView')
  })
  
router.get('/reset-password', (req, res) => {
    const token = req.query.token
    console.log('token', token)
    res.render('resetPassView', { token } )
  })

//http://localhost:8080/mokingProducts
router.get('/mokingProducts',ViewsController.mockingProducts);

//RUTA PARA PROBAR LOGGERS SEGUN ENTORNO DE TRABAJO
//http://localhost:8080/loggerTest
router.get("/loggerTest", (req, res) => {
    logger.debug("Soy un mensaje DEBUG");
    logger.verbose("Soy un mensaje VERBOSE");
    logger.http("Soy un mensaje HTTP");
    logger.info("Soy un mensaje INFO");
    logger.warn("Soy un mensaje WARN");
    logger.error("Error fatal")

    res.json({ status: "success", message: "Petición recibida" });
  });



export {router as viewsRouter};//lo exportamos para poder importarlo en "app.js".