import { Socket, Server } from 'socket.io'
import { IConnectionQueryParams, onConnect, onDisconnect, onPlayerGifSearch, onPlayerGifSelect, onPlayerVote, onPrivateInfoRequest, onSessionStart, validateConnectionQueryParams } from "./handlers";
import { Server as httpServer } from 'http';
import { ClientEvent, ConnectionError, IServerGifSearchRequest } from '../../typings/index';

type Next = (err?: any) => void;

let io: Server;

export const init = (server: httpServer) => {
    io = require('socket.io')(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ["GET", "POST"]
        }
    });

    io.use(async (socket: Socket, next: Next) => {
        if (socket.handshake.query) {
            const err = await validateConnectionQueryParams(socket.handshake.query as any);
            if (err &&
                [ConnectionError.INVALID_SESSION_ID,
                ConnectionError.SESSION_IN_PROGRESS,
                ConnectionError.PLAYER_NAME_TOO_LONG]
                    .includes(err)) {
                next(new Error(err));
            }

            next();
        }
    }).on("connection", async (socket: Socket) => {
        const { sessionId } = (socket.handshake.query as any) as IConnectionQueryParams;
        let { playerId } = (socket.handshake.query as any) as IConnectionQueryParams;

        playerId = playerId.trim();
        onConnect(socket, sessionId, playerId);

        socket.on(ClientEvent.START_GAME, () => {
            onSessionStart(sessionId);
        })

        socket.on(ClientEvent.PRIVATE_INFO_REQUEST, () => {
            onPrivateInfoRequest(socket, sessionId, playerId);
        })

        socket.on(ClientEvent.GIF_REQUEST, (args: IServerGifSearchRequest) => {
            const { searchString, searchPos } = args;
            onPlayerGifSearch(socket, searchString, searchPos);
        })

        socket.on(ClientEvent.SUBMIT_GIF, (gifUrl: string) => {
            onPlayerGifSelect(socket, sessionId, playerId, gifUrl);
        })

        socket.on(ClientEvent.SUBMIT_VOTE, (votedPlayerId) => {
            onPlayerVote(socket, sessionId, playerId, votedPlayerId);
        })

        socket.on("disconnect", async () => {
            onDisconnect(socket, sessionId, playerId);
        })
    })
}
export const getio = () => {
    // return previously cached value
    if (!io) {
        throw new Error("must call .init(server) before you can call .getio()");
    }
    return io;
}
