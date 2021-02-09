import React, { ForwardRefRenderFunction, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

import styles from "./GifSelector.module.scss";

import { useDebounce } from "../../../util/useDebounce";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import { motion } from "framer-motion";
import { gifVariants, searchHelperVariants } from "./GifSelectorMotion";

interface GifSelectorProps {
    className?: string;
    gifUrls: string[][];
    searchedGifString: string;
    searching: boolean;

    onSearch: (searchString: string) => void;
    onScrollDown: (searchString: string) => void;
    onSelectGif: (gifUrl: string) => void;
}

const SEARCH_DELAY = 500;

const renderGifs = (
    urls: string[][],
    searchString: string,
    searchedGifString: string,
    searching: boolean,
    onSelectGif: (url: string) => void,
    sectionRef: React.RefObject<HTMLElement>) => {

    const columnA = urls[0];
    const columnB = urls[1];

    const renderColumn = (urls: string[]) => {
        return urls.map((url, idx) =>
            <motion.img key={idx}
                src={url}
                onClick={() => onSelectGif(url)}
                whileHover={"hover"}
                initial={"initial"}
                animate={"visible"}
                variants={gifVariants} />);
    }

    const renderColumns = () => {
        return (
            <>
                <motion.div className={[styles.column, styles.a].join(" ")}>
                    {renderColumn(columnA)}
                </motion.div>
                <motion.div className={[styles.column, styles.b].join(" ")}>
                    {renderColumn(columnB)}
                </motion.div>
                <div className={styles.scrollTracker}>
                    <LoadingIndicator />
                </div>
            </>
        );
    }

    const renderGifSearchHelper = () => {
        return (
            <motion.div initial={"initial"} animate={"visible"} variants={searchHelperVariants} className={styles.searchHelper}>
                <p> {"Search for a GIF to answer with"}</p>
                <IoIosArrowDown />
            </motion.div>
        );
    }

    return (
        <section ref={sectionRef} className={[styles.gifPreview, !searchString && styles.hidden].filter(Boolean).join(" ")}>
            {!!(urls[0] && urls[0].length && searchString === searchedGifString) && renderColumns()}
            {!searchString && renderGifSearchHelper()}
            {searching && (searchString !== searchedGifString) && <LoadingIndicator className={styles.loading} />}
            {(!searching && (urls[0] && !urls[0].length)) && <p>{"No results found. Try searching something different"}</p>}
        </section>
    )
}

const GifSelector: ForwardRefRenderFunction<HTMLDivElement, GifSelectorProps> = ({
    className,
    gifUrls,
    searchedGifString,
    searching,

    onSearch,
    onScrollDown,
    onSelectGif,
}, ref) => {

    const [searchString, setSearchString] = useState(searchedGifString);
    const debouncedSearchString = useDebounce(searchString, SEARCH_DELAY);

    const sectionRef = useRef<HTMLElement>(null);

    // the observer closing over a lot of the values makes things awkward, so we need refs over a lot of them
    const latestValsRef = useRef<{ onScrollDown: (str: string) => void, searchString: string, searchedGifString: string }>();
    latestValsRef.current = { onScrollDown, searchString, searchedGifString };

    const isScrolledToBottom = () =>
        sectionRef.current && (sectionRef.current.scrollHeight - sectionRef.current.scrollTop - sectionRef.current.clientHeight <= 1)


    useEffect(() => {
        sectionRef.current?.addEventListener("scroll", (event) => {
            if (sectionRef.current && latestValsRef.current) {
                const searchString = latestValsRef.current.searchString;
                const searchedString = latestValsRef.current.searchedGifString;
                if (searchString && searchString === searchedString)
                    if (isScrolledToBottom()) {
                        latestValsRef.current.onScrollDown(latestValsRef.current.searchString);
                    }
            }
        })
    }, [])

    useEffect(() => {
        if (sectionRef.current && latestValsRef.current && searchString && searchString === searchedGifString) {
            if (isScrolledToBottom()) {
                latestValsRef.current.onScrollDown(latestValsRef.current.searchString);
            }
        }
    }, [gifUrls])

    useEffect(() => {
        if (debouncedSearchString) onSearch(debouncedSearchString);
    }, [debouncedSearchString]);

    const inputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (searchString !== event.target.value) {
            setSearchString(event.target.value);
            if (!event.target.value) onSearch("");
        }
    }

    return (
        <section ref={ref} className={[styles.gifSelector, className].filter(Boolean).join(" ")}>
            {renderGifs(gifUrls, searchString, searchedGifString, searching, onSelectGif, sectionRef)}
            <input className={styles.searchInput} value={searchString} onChange={inputChange} placeholder={"Search Tenor"} />
        </section>
    )
}

export default motion(React.forwardRef<HTMLDivElement, GifSelectorProps>(GifSelector));