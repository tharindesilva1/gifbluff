import { StatusCodes } from 'http-status-codes';
import redis, { RedisClient } from 'redis';
import { promisify } from 'util';
import { ISession, SessionStatus } from '../typings/index';
import { GetRandomQuestion } from './questions';

let client: RedisClient;
let get: (key: string) => Promise<string | null>;
let del: (key: string) => Promise<number>;
let evalSha: (sha: string, keyCount: number, ...args: any) => Promise<string>;

// ms
const SESSION_LIFE_TIME = 1000 * 60 * 1000;
export const GIF_SELECT_TIME = 33 * 1000;
export const VOTE_TIME = 23 * 1000;

const REDIS_RECONNECT_DELAY = 10 * 1000;

export enum RedisAction {
    SESSION_CREATE = "63723856b9c579fe5f21f8c4046ac23a6a647a87",
    SESSION_STATUS_UPDATE = "2bdeaa16d777cf00b48250846017a6bcede73a6b",
    PLAYER_CONNECT = "50623ff463f59f18eb2b2d6efa253c920f58fddd",
    PLAYER_DISCONNECT = "f0df17da56473d32580cc85978e716afbbfcf58a",
    PLAYER_GIF_SELECT = "7def8a9c4ddb37a99401e2f576c0902b8042384b",
    PLAYER_VOTE = "42f6b16b1ab2537529eb425e01f8fb005d6b7f1b",
}

interface RedisResponse {
    status: StatusCodes;
    msg?: string;
    payload?: ISession;
}

const connect = () => redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT as unknown as number,
    password: process.env.REDIS_KEY,
});

export const init = () => {
    client = connect();

    let isErrorLoggable = true;
    client.on('error', (err) => {
        if (isErrorLoggable) console.error(`error while connecting to redis: ${err}, reconnecting...`);
        isErrorLoggable = false;
        setTimeout(() => isErrorLoggable = true, 10 * 60 * 1000);
        setTimeout(connect, REDIS_RECONNECT_DELAY);
    });

    get = promisify(client.GET).bind(client);
    del = promisify(client.DEL).bind(client);
    evalSha = promisify(client.EVALSHA).bind(client);
}

export const findSession = async (id: string): Promise<ISession | null> => {
    const rawData = await get(id).catch(err => console.log(err))
    return rawData ? JSON.parse(rawData) : null;
}

export const deleteSession = async (id: string) => {
    const rawData = await del(id).catch(err => console.log(err))
}

export const generateId = async () => {
    const get5CharAlphanumeric = () => Date.now().toString(36).slice(-5);
    let id = get5CharAlphanumeric();
    while (await findSession(id)) {
        id = get5CharAlphanumeric();
    }
    return id;
}

const genericPlayerChange = async (
    sessionId: string,
    playerId: string,
    action: RedisAction,
    errorMsg: string,
    ...args: any): Promise<ISession | undefined> => {
    const res = await evalSha(action, 1, sessionId, playerId, ...args).catch((err) => {
        console.error(`${errorMsg}: ${err}`);
        return;
    })

    if (!res) {
        console.error(errorMsg);
        return;
    }

    const { status, msg, payload }: RedisResponse = JSON.parse(res);

    if (status !== StatusCodes.OK) {
        console.error(`${errorMsg}: ${msg}`);
        return;
    }

    return payload;
}


export const setPlayerVote = async (sessionId: string, playerId: string, votedPlayerId: string): Promise<ISession | undefined> => {
    return await genericPlayerChange(
        sessionId,
        playerId,
        RedisAction.PLAYER_VOTE,
        `error at player gif select, ${playerId} from ${sessionId} with vote ${votedPlayerId}`,
        votedPlayerId,
    );
}

export const setPlayerGif = async (sessionId: string, playerId: string, gifUrl: string): Promise<ISession | undefined> => {
    return await genericPlayerChange(
        sessionId,
        playerId,
        RedisAction.PLAYER_GIF_SELECT,
        `internal redis error at player gif select, ${playerId} from ${sessionId} with url ${gifUrl}`,
        gifUrl,
    );
}

export const connectPlayer = async (sessionId: string, playerId: string): Promise<ISession | undefined> => {
    return await genericPlayerChange(
        sessionId,
        playerId,
        RedisAction.PLAYER_CONNECT,
        `internal redis error at connect player ${playerId} from ${sessionId}`,
    );
}

export const disconnectPlayer = async (sessionId: string, playerId: string): Promise<ISession | undefined> => {
    return await genericPlayerChange(
        sessionId,
        playerId,
        RedisAction.PLAYER_DISCONNECT,
        `internal redis error at disconnect player ${playerId} from ${sessionId}`,
    );
}

export const sessionCreate = async (sessionId: string): Promise<ISession | undefined> => {
    const res = await evalSha(RedisAction.SESSION_CREATE, 1, sessionId, SESSION_LIFE_TIME / 1000).catch((err) => {
        console.error(`error at create session ${sessionId}: ${err} `);
        return;
    })

    if (!res) {
        console.error(`internal redis error at create session ${sessionId}`);
        return;
    }

    const { status, msg, payload }: RedisResponse = JSON.parse(res);

    if (status !== StatusCodes.OK) {
        console.error(`internal redis error at create session ${sessionId}: ${msg}`);
        return;
    }

    return payload;
}

export const sessionStatusUpdate = async (sessionId: string, sessionStatus: SessionStatus, roundStartTime: number): Promise<ISession | undefined> => {

    let res;
    if (sessionStatus === SessionStatus.GIF_SELECT) {
        const question = GetRandomQuestion();
        res = await evalSha(RedisAction.SESSION_STATUS_UPDATE, 1, sessionId, sessionStatus, question.value, question.hint, roundStartTime).catch((err) => {
            console.error(`error at session status update for ${sessionId} with ${sessionStatus}: ${err}`);
            return;
        })
    } else {
        res = await evalSha(RedisAction.SESSION_STATUS_UPDATE, 1, sessionId, sessionStatus, roundStartTime).catch((err) => {
            console.error(`error at session status update for ${sessionId} with ${sessionStatus}: ${err}`);
            return;
        })
    }

    if (!res) {
        console.error(`internal redis error at session status update for ${sessionId} with ${sessionStatus}`);
        return;
    }

    const { status, msg, payload }: RedisResponse = JSON.parse(res);

    if (status !== StatusCodes.OK) {
        console.error(`internal redis error at session status update for ${sessionId} with ${sessionStatus}: ${msg}`);
        return;
    }

    return payload;
}

export const sessionTimeouts = new Map<string, NodeJS.Timeout>();