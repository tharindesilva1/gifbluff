"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSessionId = exports.validatePlayerId = exports.ConnectionError = exports.ClientEvent = exports.PlayerRole = exports.SessionStatus = exports.ServerEvent = void 0;
var ServerEvent;
(function (ServerEvent) {
    ServerEvent["BOOTSTRAP_STATE"] = "bootstrap_state";
    ServerEvent["PRIVATE_INFO_RESPONSE"] = "private_info_response";
    ServerEvent["PLAYER_CHANGE"] = "player_change";
    ServerEvent["SESSION_STATUS"] = "session_status";
    ServerEvent["GIF_RESPONSE"] = "gif_response";
})(ServerEvent = exports.ServerEvent || (exports.ServerEvent = {}));
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["NOT_STARTED"] = "not_started";
    SessionStatus["LOBBY"] = "lobby";
    SessionStatus["GIF_SELECT"] = "gif_select";
    SessionStatus["VOTE"] = "vote";
    SessionStatus["END"] = "end";
})(SessionStatus = exports.SessionStatus || (exports.SessionStatus = {}));
var PlayerRole;
(function (PlayerRole) {
    PlayerRole["NOT_SELECTED"] = "not_selected";
    PlayerRole["CITIZEN"] = "citizen";
    PlayerRole["IMPOSTER"] = "imposter";
})(PlayerRole = exports.PlayerRole || (exports.PlayerRole = {}));
var ClientEvent;
(function (ClientEvent) {
    ClientEvent["START_GAME"] = "start_game";
    ClientEvent["PRIVATE_INFO_REQUEST"] = "private_info_request";
    ClientEvent["GIF_REQUEST"] = "gif_request";
    ClientEvent["SUBMIT_GIF"] = "submit_gif";
    ClientEvent["SUBMIT_VOTE"] = "submit_vote";
})(ClientEvent = exports.ClientEvent || (exports.ClientEvent = {}));
var ConnectionError;
(function (ConnectionError) {
    ConnectionError["SESSION_IN_PROGRESS"] = "session_in_progress";
    ConnectionError["INVALID_SESSION_ID"] = "invalid_session_id";
    ConnectionError["PLAYER_NAME_TOO_LONG"] = "player_name_too_long";
    ConnectionError["VOTED_SELF"] = "voted_self";
    ConnectionError["GENERIC"] = "generic";
})(ConnectionError = exports.ConnectionError || (exports.ConnectionError = {}));
const validatePlayerId = (playerId) => playerId.length > 0 && playerId.length < 20;
exports.validatePlayerId = validatePlayerId;
const validateSessionId = (sessionId) => {
    const SESSION_ID_LENGTH = 5;
    const alphanumericRegex = `^[0-9A-Za-z]{${SESSION_ID_LENGTH}}$`;
    return !!sessionId.match(alphanumericRegex);
};
exports.validateSessionId = validateSessionId;
