import { Socket } from "socket.io";
import { findSession, connectPlayer, GIF_SELECT_TIME, sessionTimeouts, sessionStatusUpdate, VOTE_TIME, disconnectPlayer, setPlayerGif, setPlayerVote, deleteSession } from "../../models/sessions";
import { getGifs } from "../../requests/getGifs";
import { ConnectionError, IPlayer, IServerGifSearchResponse, ISession, ITenorMediaObject, PlayerRole, ServerEvent, SessionStatus, validatePlayerId, validateSessionId } from "../../typings";
import { getio } from "./socket";

export interface IConnectionQueryParams {
    sessionId: string,
    playerId: string,
}

export const validateConnectionQueryParams = async (params: IConnectionQueryParams) => {
    const { sessionId, playerId } = params;

    if (!validateSessionId(sessionId)) return ConnectionError.INVALID_SESSION_ID;
    const sanitisedPlayerName = playerId.trim();
    if (!validatePlayerId(sanitisedPlayerName)) return ConnectionError.PLAYER_NAME_TOO_LONG;

    return;
}

export const onConnect = async (socket: Socket, sessionId: string, playerId: string) => {
    const res = await connectPlayer(sessionId, playerId);
    if (res) {
        socket.join(sessionId);
        socket.to(sessionId).emit(ServerEvent.PLAYER_CHANGE, stripPlayerRoles(res.players));
        socket.emit(ServerEvent.BOOTSTRAP_STATE, sanitiseBootstrapState(res, playerId));
    }
    else {
        socket.emit(ServerEvent.BOOTSTRAP_STATE, ConnectionError.GENERIC);
        socket.disconnect();
    }
}

export const onSessionStart = async (sessionId: string) => {
    const voteTimeout = setTimeout(async () => {
        await onSessionVote(sessionId);
    }, GIF_SELECT_TIME);

    sessionTimeouts.set(sessionId, voteTimeout);
    const res = await sessionStatusUpdate(sessionId, SessionStatus.GIF_SELECT, Date.now());

    if (res) {
        const payload = { status: SessionStatus.GIF_SELECT, timeLeft: GIF_SELECT_TIME / 1000 };
        getio().to(sessionId).emit(ServerEvent.SESSION_STATUS, payload);
    }
    else getio().to(sessionId).emit(ServerEvent.SESSION_STATUS, ConnectionError.GENERIC);
}

export const onPrivateInfoRequest = async (socket: Socket, sessionId: string, playerId: string) => {
    const session = await findSession(sessionId);

    if (session) {
        const player = session.players.find(player => player.id === playerId);
        const question = player?.role === PlayerRole.IMPOSTER ? { hint: session.question?.hint } : { value: session.question?.value };
        if (player && question) return socket.emit(ServerEvent.PRIVATE_INFO_RESPONSE, { role: player.role, question });
    }

    socket.emit(ServerEvent.PRIVATE_INFO_RESPONSE, ConnectionError.GENERIC);
}

export const onSessionVote = async (sessionId: string) => {
    const session = await findSession(sessionId);
    if (session && session.players) {
        const playerGifs = session.players.map((player) => {
            if (!player) return;
            return { playerId: player.id, gifUrl: player.gifUrl };
        });

        const res = await sessionStatusUpdate(sessionId, SessionStatus.VOTE, Date.now());

        if (res) {
            const io = getio();
            const payload = { status: SessionStatus.VOTE, timeLeft: VOTE_TIME / 1000, question: res.question }
            io.to(sessionId).emit(ServerEvent.SESSION_STATUS, payload);
            io.to(sessionId).emit(ServerEvent.PLAYER_CHANGE, stripPlayerRoles(res.players));
        }

        const endGameTimeout = setTimeout(async () => {
            await onSessionEnd(sessionId);
        }, VOTE_TIME);

        sessionTimeouts.set(sessionId, endGameTimeout);
    }
}


export const onSessionEnd = async (sessionId: string) => {
    const session = await findSession(sessionId);
    const io = getio();

    if (session) {
        io.to(sessionId).emit(ServerEvent.SESSION_STATUS, { status: SessionStatus.END });
        io.to(sessionId).emit(ServerEvent.PLAYER_CHANGE, session?.players);
        // io.in(sessionId).sockets.sockets.forEach((socket) => {
        //     socket.disconnect();
        // })
        await deleteSession(sessionId);
    } else {
        io.to(sessionId).emit(ServerEvent.PLAYER_CHANGE, ConnectionError.GENERIC);
    }
}

export const onDisconnect = async (socket: Socket, sessionId: string, playerId: string) => {
    const res = await disconnectPlayer(sessionId, playerId);
    if (res) getio().to(sessionId).emit(ServerEvent.PLAYER_CHANGE, stripPlayerRoles(res.players));
}

export const onPlayerGifSelect = async (socket: Socket, sessionId: string, playerId: string, gifUrl: string) => {
    const res = await setPlayerGif(sessionId, playerId, gifUrl);
}

export const onPlayerGifSearch = async (socket: Socket, searchString: string, searchPos?: number | string) => {
    const tenorResponse = await getGifs(searchString, searchPos);
    if (tenorResponse) {
        const next = tenorResponse.next;
        const nanoGifs: ITenorMediaObject[] = tenorResponse.results.map(result => result.media[0].nanogif);
        const mediumGifs: ITenorMediaObject[] = tenorResponse.results.map(result => result.media[0].mediumgif);
        const gifs: ITenorMediaObject[] = tenorResponse.results.map(result => result.media[0].gif);

        const response: IServerGifSearchResponse = { searchString, searchPos, next, nanoGifs, mediumGifs, gifs };
        socket.emit(ServerEvent.GIF_RESPONSE, response);
    }
}

export const onPlayerVote = async (socket: Socket, sessionId: string, playerId: string, votedPlayerId: string) => {
    if (playerId === votedPlayerId) {
        socket.emit(ServerEvent.PLAYER_CHANGE, ConnectionError.VOTED_SELF);
    } else {
        const res = await setPlayerVote(sessionId, playerId, votedPlayerId);
        if (res) getio().to(sessionId).emit(ServerEvent.PLAYER_CHANGE, stripPlayerRoles(res.players));
    }
}

const sanitiseBootstrapState = (session: ISession, playerId: string) => {
    const sanitisedPlayers = session.players.map(player => {
        if (!player) return;
        else if (player.id === playerId) return player;
        const { role, ...rolelessPlayer } = player;
        return rolelessPlayer;
    })

    const playerRole = session.players.find(player => player && player.id === playerId)?.role;

    let sanitisedQuestions = session.question;

    if (session.status !== SessionStatus.VOTE) {
        sanitisedQuestions = {
            hint: playerRole === PlayerRole.IMPOSTER ? session.question?.hint : undefined,
            value: playerRole === PlayerRole.CITIZEN ? session.question?.value : undefined,
        };
    }

    if (session.roundStartTime) {
        const totalTime = session.status === SessionStatus.GIF_SELECT ? GIF_SELECT_TIME : VOTE_TIME;
        const timeSinceRoundStart = (Date.now() - session.roundStartTime);
        session.timeLeft = timeSinceRoundStart < totalTime ? (totalTime - timeSinceRoundStart) / 1000 : 0;
    }

    return { ...session, question: sanitisedQuestions, players: sanitisedPlayers };
}

const stripPlayerRoles = (players: IPlayer[]) => {
    return players.map(player => {
        if (!player) return;
        const { role, ...otherProps } = player;
        return otherProps;
    })
}