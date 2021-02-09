import { useEffect, useState } from "react"

export const useDebounce = <T>(searchString: T, debounceTime: number): T => {

    const [debouncedSearchString, setDebouncedSearchString] = useState(searchString);

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setDebouncedSearchString(searchString);
        }, debounceTime)
        // clean up will happen in the next render, before the searchString is set, we'll use this time to reset the debounce timer
        return () => {
            clearTimeout(debounceTimeout)
        }
    }, [searchString, debounceTime])

    return debouncedSearchString;
}

