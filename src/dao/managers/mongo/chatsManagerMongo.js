import { chatsModel } from "./models/chatsModel.js";
import { logger } from "../../../helpers/logger.js";


export class ChatsManagerMongo{
                constructor(){
                    this.model = chatsModel;
                };

                async createMessage(messageInfo){
                    try {

                        const message = await this.model.create(messageInfo);

                        return message

                    }catch(error){
                        logger.error('add message', error.message);
                        throw new Error ("No se pudo agregar el mensaje");
                    };
                };

                async getMessages() {
                    try {
                        const messagesList = await this.model.find();
                       
                        return messagesList
                    }catch (error){
                        logger.error('get chat', error.message);
                        throw new Error ("No se pudo conseguir el listado de mensajes")
                    };
                };
}