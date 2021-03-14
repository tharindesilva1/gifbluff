import openSocket from "socket.io-client"

import { ClientEvent, ConnectionError, IPlayer, IQuestion, IServerGifSearchRequest, IServerGifSearchResponse, ISession, ITenorMediaObject, PlayerRole, ServerEvent, SessionStatus } from "@gif/common";
import { IClientSession } from "../typings/client";
import { expose } from "comlink";


const spliceGifs = (oldGifs: ITenorMediaObject[][], newGifs: ITenorMediaObject[]) => {

    if (!newGifs.length) return [[], []];

    const oldGifsA = oldGifs[0];
    const oldGifsB = oldGifs[1];

    // the gifs come in all sizes, we're going to be rendering at a fixed width. So, we'll
    // normalise them to an arbitrary width to order them, based on height, for the two columns
    const arbitraryWidth = 42;
    const normalisedNewGifs: ITenorMediaObject[] = newGifs.map((gif) => {
        const heightScaleFactor = 42 / gif.dims[0];
        return {
            ...gif,
            dims: [arbitraryWidth, heightScaleFactor * gif.dims[1]]
        }
    })

    let columnAHeight = (oldGifsA && oldGifsA.length) ? oldGifsA[oldGifsA.length - 1].height : 0;
    let columnBHeight = (oldGifsB && oldGifsB.length) ? oldGifsB[oldGifsB.length - 1].height : 0;

    normalisedNewGifs.sort((a, b) => a.dims[1] - b.dims[1]);

    const [newGifsA, newGifsB] = normalisedNewGifs.reduce((arr: ITenorMediaObject[][], gif) => {
        if (columnAHeight! > columnBHeight!) {
            columnBHeight = columnBHeight! + gif.dims[1];
            return [arr[0], [...arr[1], gif]];
        } else {
            columnAHeight = columnAHeight! + gif.dims[1];
            return [[...arr[0], gif], arr[1]];
        }
    }, [[], []])

    newGifsA[newGifsA.length - 1].height = columnAHeight;
    newGifsB[newGifsB.length - 1].height = columnBHeight;

    return [[...oldGifsA, ...newGifsA], [...oldGifsB, ...newGifsB]];
}

export class ServerWorker {

    private socket?: SocketIOClient.Socket;
    private sessionState: IClientSession;
    private sessionUpdateCallback?: (sessionState: IClientSession) => void;

    private gifs: ITenorMediaObject[][];
    private lastGifSearch: IServerGifSearchRequest;
    private next?: string | number;

    constructor() {
        this.sessionState = { selfRole: PlayerRole.NOT_SELECTED, status: SessionStatus.NOT_STARTED, players: [] };
        this.lastGifSearch = { searchString: "" };
        this.gifs = [[], []];
    }

    private openConnection(sessionId: string, playerId: string) {
        return openSocket('https://gifbluff.herokuapp.com', { query: { sessionId, playerId } });
    }

    // TODO: timeout the socket connection
    public openWebsocket(sessionId: string, playerId: string, cb?: (success: boolean) => void): void {

        if (this.socket && this.socket.connected) return;

        this.socket = this.openConnection(sessionId, playerId);

        // sent when client refreshes, server will catch client up
        this.socket.on(ServerEvent.BOOTSTRAP_STATE, (state: ISession | ConnectionError.GENERIC) => {

            if (state === ConnectionError.GENERIC) {
                if (cb) cb(false);
            } else {
                this.sessionState.status = state.status;
                this.sessionState.players = state.players.filter(x => x);
                const selfRole = this.sessionState.players.find(player => player.id === playerId)?.role;
                this.sessionState.selfRole = selfRole ? selfRole : PlayerRole.NOT_SELECTED;
                this.sessionState.question = state.question;
                this.sessionState.timeLeft = state.timeLeft;

                if (cb) cb(true);
                this.notifySessionListener();
            }
        });
    }

    public startGame(): void {
        this.socket?.emit(ClientEvent.START_GAME);
    }

    private requestPrivateInfo() {
        this.socket?.emit(ClientEvent.PRIVATE_INFO_REQUEST);
    }

    private notifySessionListener() {
        if (this.sessionUpdateCallback) this.sessionUpdateCallback(this.sessionState);
    }

    public disconnect(): void {
        if (this.socket?.connected) {
            this.socket.disconnect();
        }
        this.sessionUpdateCallback = undefined;
    }

    public registerStateCallback(cb: (sessionState: IClientSession) => void): void {

        if (this.socket) {

            this.sessionUpdateCallback = cb;
            this.sessionUpdateCallback(this.sessionState)

            this.socket.on(ServerEvent.SESSION_STATUS, (update: { status: SessionStatus, timeLeft: number, question?: IQuestion }) => {
                this.sessionState.status = update.status;
                this.sessionState.timeLeft = update.timeLeft;

                switch (update.status) {
                    case SessionStatus.GIF_SELECT: {
                        this.requestPrivateInfo();
                        break;
                    }
                    case SessionStatus.VOTE: {
                        this.sessionState.question = update.question;
                        break;
                    }
                    case SessionStatus.END: {
                        break;
                    }
                }

                this.notifySessionListener();
            })

            this.socket.on(ServerEvent.PRIVATE_INFO_RESPONSE, (res: { role?: PlayerRole, question?: IQuestion }) => {
                if (res.role) this.sessionState.selfRole = res.role;
                if (res.question) this.sessionState.question = res.question;
                this.notifySessionListener();

            });

            this.socket.on(ServerEvent.PLAYER_CHANGE, (res: IPlayer[] | ConnectionError.VOTED_SELF) => {
                if (res !== ConnectionError.VOTED_SELF) {
                    this.sessionState.players = res.filter(x => x);
                    this.notifySessionListener();
                }
            });
        }
    }

    private handleGifResponse(prevGifs: ITenorMediaObject[][], cb: (gifUrls: string[][]) => void) {
        this.socket?.once(ServerEvent.GIF_RESPONSE, (wbsktRes: IServerGifSearchResponse) => {
            if (wbsktRes.searchString === this.lastGifSearch.searchString && wbsktRes.searchPos === this.lastGifSearch.searchPos) {
                if (cb) {
                    this.gifs = spliceGifs(prevGifs, wbsktRes.mediumGifs);
                    this.next = wbsktRes.next;
                    cb([this.gifs[0].map(gif => gif.url), this.gifs[1].map(gif => gif.url)]);
                }
            }
        });
    }

    // new search
    public getNewSearchGif(searchString: string, cb: (gifUrls: string[][]) => void): void {
        if (!searchString) {
            this.gifs = [];
            this.next = undefined;
            this.lastGifSearch = { searchString: "" };
            cb([]);
        } else if (this.socket) {
            this.socket.emit(ClientEvent.GIF_REQUEST, { searchString });
            this.lastGifSearch = { searchString };
            this.next = undefined;

            this.handleGifResponse([[], []], cb);
        }
    }

    // same search, more results. callback returns old + new gifs from paging
    public getNextGifPage(cb: (gifs: string[][]) => void): void {
        if (this.socket) {
            this.lastGifSearch = { ...this.lastGifSearch, searchPos: this.next };
            this.socket.emit(ClientEvent.GIF_REQUEST, this.lastGifSearch);

            this.handleGifResponse(this.gifs, cb);
        }
    }

    public submitGif(url: string): void {
        if (this.socket) this.socket.emit(ClientEvent.SUBMIT_GIF, url);
    }

    public submitVote(playerId: string): void {
        if (this.socket) this.socket.emit(ClientEvent.SUBMIT_VOTE, playerId);
    }
}

const worker = new ServerWorker();
expose(worker);