-- change session status
-- KEY = sessionId,
-- ARG = status, citizenQuestion, imposterQuestion, timestamp
-- ARG = status, timestamp

local session_json = redis.call('GET', KEYS[1])

if session_json == false then
    return cjson.encode({['status'] = 404, ['msg'] = 'session not found'})
end

local session = cjson.decode(session_json)

session.status = ARGV[1]

if session.status == 'gif_select' then
    local question = {}
    question.value = ARGV[2]
    question.hint = ARGV[3]
    session.question = question
    session.roundStartTime = ARGV[4]
    local imposterIdx = math.random(table.getn(session.players))

    for idx, player in pairs(session.players) do
        if idx == imposterIdx then
            player.role = 'imposter'
        else
            player.role = 'citizen'
        end
    end

elseif session.status == 'vote' then
    session.roundStartTime = ARGV[2]
end

local updated_session_json = cjson.encode(session)
local success = redis.call('SET', KEYS[1], updated_session_json, 'KEEPTTL')

if success == false then
    return cjson.encode({['status'] = 500, ['msg'] = 'failed to update session with status'})
end

return cjson.encode({['status'] = 200, ['payload'] = session})
