
const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const bcryptSalt = bcrypt.genSaltSync()
const cookieParser = require('cookie-parser')
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

const mongoUrl = 'mongodb+srv://serkan:9Lt8dAnPlkkqiAmC@cluster0.dzlq7cc.mongodb.net/?retryWrites=true&w=majority'

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

app.listen(4040)

//9Lt8dAnPlkkqiAmC

