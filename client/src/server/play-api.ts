import axios from "axios"

import { StatusCodes } from "http-status-codes";
import { useState } from "react";

export const useCreateGame = async (): Promise<readonly [boolean, string]> => {
    const [loading, setLoading] = useState(true);
    const [roomId, setRoomId] = useState('');

    setRoomId(await createGameRequest());
    setLoading(false);
    return [loading, roomId] as const;
}

axios.interceptors.request.use((config) => {
    config.url = `https://gifbluff.herokuapp.com/${config.url}`;
    return config;
});


export const createGameRequest = async (): Promise<string> => {
    const res = await axios.post("session");

    if (res.status !== StatusCodes.OK || !res.data || !res.data.sessionId) {
        return "create request failed!";
    }

    return res.data.sessionId;
}