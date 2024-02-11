import { generateProducts } from "../helpers/mock.js";
import { cartsService, productsService } from "../repositories/index.js";
import { logger } from "../helpers/logger.js";


export class ViewsController {
    
    static renderViewsHome = async (req, res) => {
        try {
            
            //si no esta logeado lo redirige a login
            if(!req.user){
                logger.Error('error al iniciar sesion');
                res.render('login', 
                { 
                    style: "login.css",
                    error: 'Error al iniciar session, para navegar debe iniciar session'
                })
            }else{
                //si esta logueado lo redirige a home
                const products = await productsService.getProducts();
    
                if(products.length === 0){
                    res.render('home', 
                    { 
                        style: "home.css",
                        message: 'No hay productos'
                    });
                    logger.console.error('No hay productos');
                    throw new Error('No hay productos');
                }
                if(req.user.role === 'admin'){
                    logger.info('ususario logueado', req.user);
                    res.render('home', 
                    { 
                        style: "home.css",
                        userAdmin: true,
                        products : products,
                        userFirst_name: req.user.first_name,
                        userLast_name: req.user.last_name,
                        userRole: req.user.role
                        
                    });
                    
                }else{
                    logger.info('ususario logueado');
                    res.render('home', 
                    {
                        style: "home.css",
                        products : products,
                        userFirst_name: req.user.first_name,
                        userLast_name: req.user.last_name,
                        userRole: req.user.role
                        
                    });
                }
            }
            logger.info('ususario logueado');
        } catch (error) {
            logger.error('error al renderizar home', error.message);
            res.status(500).json({ message: error.message }); 
        }
       
    }

    static renderViewsLogin = async (req, res) => {
        try {
            logger.info('renderizo login');
            res.render('login', { style: "login.css"});
        } catch (error) {
            logger.error('error al renderizar login', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static renderViewsRegister = async (req, res) => {
        try {
            
            logger.info('renderizo register');
            res.render('register', { style: "register.css"});
        } catch (error) {
            logger.error('error al renderizar register', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static renderViewsProfile = async (req, res) => { //agrego JWT y saco session
        try {
            //para poder hacer el testing 
            if(req.query.test === 'true'){
                
                const user = await usersSessionsService.getUserById(req.user._id);
                delete user.password
                return res.json({body: user})
            }
            if(!req.user){
                logger.Error('error al iniciar sesion');
                res.render('login', 
                { 
                    style: "login.css",
                    error: 'Para navegar debe iniciar session'
                })
            }else{  
                if(req.user.age === 0 && req.user.role === 'admin'){
                    logger.info('ususario logueado, renderizo profile', req.user);
                    //usuario admin
                    res.render('profile', 
                    {
                        style: "profile.css",
                        userAdmin: true,
                        userFirst_name: req.user.first_name,
                        userEmail: req.user.email,
                        userRole: req.user.role,
                        message: 'Se ha registrado con exito'
                    })
                }else if(req.user.age === 0 && req.user.role === 'Usuario' ) {
                    logger.info('ususario logueado, renderizo profile', req.user);
                    //usuario github                
                    res.render('profile', 
                    {
                        style: "profile.css",
                        userGithub: true,
                        userFirst_name: req.user.first_name,
                        userUsername: req.user.last_name,
                        userEmail: req.user.email,
                        userRole: req.user.role,
                        message: 'Se ha registrado con exito'
                    });
                }else{
                    logger.info('ususario logueado, renderizo profile');
                    //usuario registrado desde la page
                    res.render('profile', 
                    {
                        style: "profile.css",
                        userUser: true,
                        userFirst_name: req.user.first_name,
                        userLast_name: req.user.last_name,
                        userAge: req.user.age,
                        userEmail: req.user.email,
                        userRole: req.user.role,
                        message: 'Se ha registrado con exito'
                    })
                }
            }
        } catch (error) {
            logger.error('error al renderizar register', error.message);
            res.status(500).json({ message: error.message });
        }
    }

    static renderViewsRealTime = async (req, res) => {
        try {
            if(!req.user){
                res.render('login', 
                { 
                    style: "login.css",
                    error: 'Para navegar debe iniciar session'
                })
            }else{
                res.render('realTime',{style: "realTime.css",}
                );
            }
            
        } catch (error) {
            res.status(500).json({ message: error.message });        
        }
    }

    static renderViewsMessage = async (req, res) =>{
        try {
            if(!req.user){
                res.render('login', 
                { 
                    style: "login.css",
                    error: 'Para navegar debe iniciar session'
                })
            }else{
                res.render('chats', {style: "chat.css",});
            }
            
        } catch (error) {
            res.status(500).json({ message: error.message });
            
        }
    }

    static renderViewsProducts = async (req, res) => {
        try {
            if(!req.user){
                logger.Error('error al iniciar sesion');
                res.render('login', 
                { 
                    style: "login.css",
                    error: 'Para navegar debe iniciar session'
                })
            }else{
                const { limit= 4, page=1 } = req.query;
                const query = {};
                const options = {
                    limit,
                    page,
                    sort: { price: 1 },   
                    lean: true
                }
                const result = await productsService.getProductsPaginate(query, options);
                //console.log('products', result);
                //obtengo la ruta del servidor 
                const baseUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                const dataProducts = {
                    style: "paginate.css",
                    status:'success',
                    payload: result,
                    totalPages: result.totalPages,
                    prevPage: result.prevPage ,
                    nextPage: result.nextPage,
                    page: result.page,
                    pagingCounter: result.pagingCounter,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage,
                    prevLink: result.hasPrevPage ? 
                    `${baseUrl.replace(`page=${result.page}`, `page=${result.prevPage}`)}` 
                    : null,
                    nextLink: result.hasNextPage ? baseUrl.includes("page") ? 
                    baseUrl.replace(`page=${result.page}`, `page=${result.nextPage}`) :
                    baseUrl.concat(`?page=${result.nextPage}`) : null
        
                }
               
                logger.info('Productos paginados')
                res.render('productsPaginate', dataProducts);
            }
    
        } catch (error) {
            logger.error('error al renderizar products paginate', error.message);
            res.status(500).json({ message: error.message });
            
        }
    }

    static renderViewsCart = async (req, res) => {
        const cartId = '6525e395443bd76c765dd0ee'
        try {
            const cart = await cartsService.getCartsId(cartId);
            
            if(!cart){
                return res.status(404).send('No se pudo encontrar el carrito');
            }else{
                
                res.status(200).render('cart', {
                     style: "cart.css",
                     products: cart.products 
                    });
                
            }
        } catch (error) {
            logger.error('error al renderizar cart', error.message);
            return res.status(500).json({ message: error.message });
        }
    }

    static mockingProducts = async (req, res) => {
        try {
            let products = []
            for (let i = 0; i < 100; i++) {
                const items = generateProducts()
                products.push(items)
            }
            logger.info("moking products")
            res.json({status: "success", data: products})
        } catch (error) {
            logger.error('error mockingProducts controller', error.message);
            res.json( { status: "error", message: error.message });
        }
    }
};