export declare enum ServerEvent {
    BOOTSTRAP_STATE = "bootstrap_state",
    PRIVATE_INFO_RESPONSE = "private_info_response",
    PLAYER_CHANGE = "player_change",
    SESSION_STATUS = "session_status",
    GIF_RESPONSE = "gif_response"
}
export declare enum SessionStatus {
    NOT_STARTED = "not_started",
    LOBBY = "lobby",
    GIF_SELECT = "gif_select",
    VOTE = "vote",
    END = "end"
}
export declare enum PlayerRole {
    NOT_SELECTED = "not_selected",
    CITIZEN = "citizen",
    IMPOSTER = "imposter"
}
export interface IPlayer {
    id: string;
    role?: PlayerRole;
    gifUrl?: string;
    connected: boolean;
    votedId?: string;
}
export interface IQuestion {
    value?: string;
    hint?: string;
}
export interface ISession {
    status: SessionStatus;
    question?: IQuestion;
    roundStartTime?: number;
    timeLeft?: number;
    players: IPlayer[];
}
export declare enum ClientEvent {
    START_GAME = "start_game",
    PRIVATE_INFO_REQUEST = "private_info_request",
    GIF_REQUEST = "gif_request",
    SUBMIT_GIF = "submit_gif",
    SUBMIT_VOTE = "submit_vote"
}
export declare enum ConnectionError {
    SESSION_IN_PROGRESS = "session_in_progress",
    INVALID_SESSION_ID = "invalid_session_id",
    PLAYER_NAME_TOO_LONG = "player_name_too_long",
    VOTED_SELF = "voted_self",
    GENERIC = "generic"
}
export interface ITenorMediaObject {
    dims: number[];
    preview: string;
    url: string;
    size: number;
    height?: number;
}
export interface IServerGifSearchRequest {
    searchString: string;
    searchPos?: number | string;
}
export interface IServerGifSearchResponse extends IServerGifSearchRequest {
    next: number | string;
    mediumGifs: ITenorMediaObject[];
    nanoGifs: ITenorMediaObject[];
    gifs: ITenorMediaObject[];
}
export declare const validatePlayerId: (playerId: string) => boolean;
export declare const validateSessionId: (sessionId: string) => boolean;
