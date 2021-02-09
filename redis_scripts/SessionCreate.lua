-- for when a new session is created
-- KEY = sessionId, ARGV = session life time

local session_json = redis.call('GET', KEYS[1])

if session_json == false then
    local session = {['status'] = 'lobby', ['players'] = {}}
    local new_session_json = cjson.encode(session)

    local success = redis.call('SETEX', KEYS[1], ARGV[1], new_session_json);

    if success == false then
        return cjson.encode({['status'] = 500, ['msg'] = 'failed to set session'})
    end

    return cjson.encode({['status'] = 200, ['payload'] = session})
end

return cjson.encode({['status'] = 400, ['msg'] = 'session already exists'})
