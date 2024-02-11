import mongoose from 'mongoose';
import { config } from '../src/config/config.js'
import { productsModel } from '../src/dao/managers/mongo/models/productsModel.js'

await mongoose.connect(config.mongo.url)

const updateProducts = async () => {
    try {
        const adminId = '653ae4c02f49a24c98d0b603'
        const result = await productsModel.updateMany({}, { $set: {owner: adminId} }) 
        console.log( result)
    } catch (error) {
        console.log(error.message)
    }
}
//node scripts/mongo.script.js
updateProducts()