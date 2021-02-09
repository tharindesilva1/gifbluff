import axios from "axios";
import { StatusCodes } from 'http-status-codes';
import { ITenorMediaObject } from "../typings";

interface ITenorMediaObjects {
    gif: ITenorMediaObject;
    loopedmp4: ITenorMediaObject;
    mediumgif: ITenorMediaObject;
    mp4: ITenorMediaObject;
    nanogif: ITenorMediaObject;
    nanomp4: ITenorMediaObject;
    nanowebm: ITenorMediaObject;
    tinygif: ITenorMediaObject;
    tinymp4: ITenorMediaObject;
    tinywebm: ITenorMediaObject;
    webm: ITenorMediaObject;
}

interface ITenorGifObject {
    create: number;
    hasaudio: boolean;
    id: string;
    media: ITenorMediaObjects[];
    tags: string[];
    title: string;
    itemurl: string;
    hascaption: boolean;
    url: string;
}

export interface ITenorSearchResponse {
    next: number | string;
    results: ITenorGifObject[];
    weburl: string;
}

export const getGifs = async (searchString: string, pos?: number | string): Promise<ITenorSearchResponse | undefined> => {

    const GIF_ENDPOINT = "https://api.tenor.com/v1/";

    try {
        let url = `${GIF_ENDPOINT}search?q=${searchString}&key=${process.env.TENOR_API_KEY}&limit=8`;
        if (pos) {
            url = `${url}&response&pos=${pos}`;
        }
        let response = await axios.get(url)

        if (response.status === StatusCodes.OK) {
            return response.data;
        }
    } catch (err: any) {
        console.error(`error encountered when doing gifSearch on string ${searchString} with pos ${pos}: ${err}`);
    }
}