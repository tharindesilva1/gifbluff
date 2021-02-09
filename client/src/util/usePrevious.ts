import { useEffect, useRef } from "react";

export const usePrevious = <T>(value: T): T | undefined => {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    // Return previous value (happens before update in useEffect above)
    return ref.current;
}