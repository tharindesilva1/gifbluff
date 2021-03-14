import bodyParser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';

import httpRouter from './controllers/http';
import * as socketio from './controllers/socket/socket';
import * as sessions from './models/sessions'

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
}))

app.use(morgan('combined'))
app.use(bodyParser.json());
app.use(httpRouter);

sessions.init();
const server = app.listen(process.env.PORT || 3000, () => {
    console.log("running server");
});

socketio.init(server);
