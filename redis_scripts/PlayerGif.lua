-- for when players submit gifs
-- KEY = sessionId, ARG = playerId, gifUrl

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

session.players[found_idx].gifUrl = ARGV[2]
local updated_session_json = cjson.encode(session)
local success = redis.call('SET', KEYS[1], updated_session_json, 'KEEPTTL')

if success == false then
    return cjson.encode({['status'] = 500, ['msg'] = 'could not update session with player gif'})
end

return cjson.encode({['status'] = 200, ['payload'] = session})