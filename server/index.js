
const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const bcryptSalt = bcrypt.genSaltSync()
const cookieParser = require('cookie-parser')
const ws = require('ws')
const Message = require('./models/Message')
dotenv.config();
mongoose.connect(process.env.MONGO_URL)

const app = express()
app.use(express.json())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));
app.use(cookieParser())

const user = require('./models/User');



app.get('/test', (req, res) => {
    res.json('test ok!!')
})

app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);

        })
    } else {
        res.status(400).json('Couldnt get the token.')
    }

})



app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashPassword = bcrypt.hashSync(password, bcryptSalt)
        const createdUser = await user.create({ username: username, password: hashPassword })
        jwt.sign({ userId: createdUser._id, username }, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).status(201).json({
                id: createdUser._id
            });
        });
    } catch (err) {
        if (err) throw err;
        res.status(500).json('Error!!')
    }

})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await user.findOne({ username });
    if (foundUser) {
        const passwordValidity = bcrypt.compareSync(password, foundUser.password);
        if (passwordValidity) {
            jwt.sign({ userId: foundUser._id, username }, process.env.JWT_SECRET, {}, (err, token) => {
                res.cookie('token', token).json({
                    id: foundUser._id
                });
            });
        }
    }
});

const server = app.listen(4040)

const wss = new ws.WebSocketServer({ server })
wss.on('connection', (connection, req) => {
    const { cookie = '' } = req.headers;
    const tokenString = cookie.split(';').find(str => str.startsWith('token='));
    const [, token] = tokenString ? tokenString.split('=') : [];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (error, userInfo) => {
            if (error) throw error
            const { userId, username } = userInfo;
            connection.userId = userId
            connection.username = username
        })
    }



    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username })),
        }));
    });

    //console.log([...wss.clients].map(client => ({ userId: client.userId, username: client.username })));


    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());
        const { recipient, text } = messageData;

        if (recipient && text) {
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text
            });

            console.log('created message');

            [...wss.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({
                    text,
                    sender: connection.userId,
                    recipient,
                    _id: messageDoc._id
                })));
        }
    });

    connection.on('close', (code, reason) => {
        console.log(`Connection closed. Code: ${code}, Reason: ${reason}`);
    });
}); 
