import { proxy } from "comlink";
import React, { FunctionComponent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { IQuestion, PlayerRole } from "@gif/common";

import styles from "./SelectGifView.module.scss";

import { useSessionInfo } from "../../../SessionContext";
import GifSelector from "../../components/GifSearchInput/GifSelector";
import { briefingTextVariants, briefingVariants, timerVariants } from "./SelectGifViewMotion";
import Timer from "../../components/Timer/Timer";
import Button from "../../components/Button";

interface SelectGifViewProps {
    question?: IQuestion,
    role: PlayerRole,
    timeLeft: number;
}

const renderRoleText = (role: PlayerRole) => {
    return role === PlayerRole.IMPOSTER ?
        <motion.p className={styles.questionHelperText} variants={briefingTextVariants}>You are the <span className={styles.imposter}> imposter</span></motion.p> :
        <motion.p className={styles.questionHelperText} variants={briefingTextVariants}>You are a <span className={styles.notImposter}> not the imposter</span></motion.p>;
}

const renderQuestion = (question?: IQuestion) => {
    if (question?.value) {
        return (
            <>
                <motion.p className={styles.questionHelperText} variants={briefingTextVariants}> {"Here's the question:"} </motion.p>
                <motion.p className={styles.questionText} variants={briefingTextVariants}>{`"${question.value}"`}</motion.p>
            </>
        );
    }

    return (
        <>
            <motion.p className={styles.questionHelperText} variants={briefingTextVariants}> {"You can't see the real question but here's a hint:"} </motion.p>
            {<motion.p className={styles.questionText} variants={briefingTextVariants}>{`"${question?.hint}"`}</motion.p>}
        </>
    );
}

const SelectGifView: FunctionComponent<SelectGifViewProps> = ({
    question,
    role,
    timeLeft,
}) => {

    const { serverWorker } = useSessionInfo();
    const [gifState, setGifState] = useState<{ gifUrls: string[][], searchString: string }>({ gifUrls: [], searchString: "" });
    const [isSearchingGif, setIsSearchingGif] = useState(false);
    const [selectedGif, setSelectedGif] = useState<string>("");

    const onNextGifPage = async () => {
        const callback = (gifUrls: string[][]) => setGifState(gifState => { return { ...gifState, gifUrls } });
        await serverWorker.getNextGifPage(proxy(callback));
    }

    const onGifSearch = async (searchString: string) => {
        setIsSearchingGif(true);
        const callback = (gifUrls: string[][]) => {
            setIsSearchingGif(false);
            setGifState({ searchString, gifUrls });
        }
        await serverWorker.getNewSearchGif(searchString, proxy(callback));
    }

    const onSelectGif = async (gifUrl: string, notifyServer = true) => {
        setSelectedGif(gifUrl);
        if (notifyServer) await serverWorker.submitGif(gifUrl);
    }

    const renderSelectedGif = () => {
        return (
            <motion.div
                key={"selectedGif"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={styles.selectedGif}
            >
                <img src={selectedGif} />
                <Button onClick={() => onSelectGif("", false)}>{"Change"}</Button>
            </motion.div>

        )
    }

    const BRIEFING_DELAY = 3000;

    return (
        <>
            <motion.div className={styles.briefContainer} initial={"initial"} animate={"visible"} variants={briefingVariants}>
                {renderRoleText(role)}
                {renderQuestion(question)}
            </motion.div>
            <Timer className={styles.timer} delay={BRIEFING_DELAY} initial={"initial"} animate={"visible"} variants={timerVariants} timeLeft={timeLeft} />
            <motion.div className={styles.gifSection} initial={"initial"} animate={"visible"} exit={"exit"}>
                <AnimatePresence exitBeforeEnter>
                    {!selectedGif && <GifSelector
                        key={"gifSelector"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className={styles.gifSelector}
                        searching={isSearchingGif}
                        onSelectGif={onSelectGif}
                        onSearch={onGifSearch}
                        onScrollDown={onNextGifPage}
                        gifUrls={gifState.gifUrls}
                        searchedGifString={gifState.searchString}
                    />}
                    {selectedGif && renderSelectedGif()}
                </AnimatePresence>
            </motion.div>
        </>
    )
}

export default SelectGifView;