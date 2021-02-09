import { ITenorMediaObject } from "@gif/common";
import { useState } from "react"

export const useGifStore = (): readonly [ITenorMediaObject[], (searchString: string, gifs: ITenorMediaObject[]) => void] => {
    const [lastSearch, setLastSearch] = useState<string>();
    const [storedGifs, setStoredGifs] = useState<ITenorMediaObject[]>([]);


    const setGifs = (searchString: string, gifs: ITenorMediaObject[]) => {
        if (lastSearch !== searchString) {
            setStoredGifs(gifs);
            setLastSearch(searchString);
        } else {
            setStoredGifs([...storedGifs, ...gifs]);
        }
    }

    return [storedGifs, setGifs] as const;

}