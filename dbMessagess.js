import Mongoose from "mongoose";


const WhatsAppSchema = Mongoose.Schema({
    message: String,
    name: String,
    timeStamp: String,
    received: Boolean
})

export default Mongoose.model('messages', WhatsAppSchema)