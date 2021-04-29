import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import Messages from './dbMessagess.js';
dotenv.config()

// app configration
const app = express();
const port = process.env.port || 5000;

const pusher = new Pusher({
    appId: "1192884",
    key: "c25154802c53eef5fed4",
    secret: "fbaf0399a5f0d8fce78f",
    cluster: "eu",
    useTLS: true
});

//middlewere
app.use(express.json());
app.use(cors())

//db config 
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.x1vlg.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})


const db = mongoose.connection;
db.once('open', () => {
    console.log("db connected");

    const msgCollection = db.collection("messages");
    const changeStream = msgCollection.watch();
    changeStream.on('change', (change) => {
        // console.log("a change occors", change);
        if (change.operationType === 'insert') {
            const messageDitails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
                {
                    name: messageDitails.name,
                    messages: messageDitails.message,
                    timeStamp: messageDitails.timeStamp,
                    received: messageDitails.received
                }
            )
        } else {
            console.log("err tiggering pusher");
        }
    })
})

//api rout 
app.get('/', (req, res) => {
    res.status(200).send("hellow world.")
})

app.post('/messages/new', (req, res) => {
    const dbMessages = req.body;
    Messages.create(dbMessages, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.get('/messages/sync', (req, res) => {

    Messages.find((err, data) => {
        if (err) {
            req.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})


//listiner
app.listen(port, () => {
    console.log(`listinign from localhost  ${port}`);
})





