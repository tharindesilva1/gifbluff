
-- player disconnect
-- KEY = sessionId, ARG = playerId

local session_json = redis.call('GET', KEYS[1])

if session_json == false then
    return cjson.encode({['status'] = 404, ['msg'] = 'session not found'})
end

local session = cjson.decode(session_json)

local found_idx = -1;

for idx, player in pairs(session.players) do
    if player ~= cjson.null and player.id == ARGV[1] then
        found_idx = idx
        break
    end
end

if found_idx == -1 then
    return cjson.encode({['status'] = 404, ['msg'] = 'player not found'})
end

if (session.status == "lobby") then
    session.players[found_idx] = nil;

    local cleanedPlayers = {}
        for _, v in pairs(session.players) do
            cleanedPlayers[ #cleanedPlayers + 1 ] = v
        end
    session.players = cleanedPlayers
else
    session.players[found_idx].connected = false;
end


local updated_session_json = cjson.encode(session)
local success = redis.call('SET', KEYS[1], updated_session_json, 'KEEPTTL')

if success == false then
    return cjson.encode({['status'] = 500, ['msg'] = 'could not update session with disconnected player'})
end

return cjson.encode({['status'] = 200, ['payload'] = session})
