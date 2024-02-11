
export class ChatRepository {

    constructor(dao){
        this.dao = dao
    }

    async getMessages(){
        return chat = await this.dao.getMessages()
    }
    async createMessage(messageInfo){
        return newChat = await this.dao.createMessage(messageInfo)
    }

    //emptyChat
}