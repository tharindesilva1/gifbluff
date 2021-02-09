import { AnimatePresence, motion } from "framer-motion";
import { ImCross } from "react-icons/im";

import { IPlayer, IQuestion, PlayerRole, SessionStatus } from "@gif/common";

import React, { FunctionComponent } from "react";
import Timer from "../../components/Timer/Timer";

import styles from "./VotePlayerView.module.scss";
import { useSessionInfo } from "../../../SessionContext";
import { briefingTextVariants, briefingVariants, timerVariants, voteCardVariants } from "./VotePlayerViewMotion";

interface VotePlayerViewProps {
    players: IPlayer[];
    question?: IQuestion,
    role: PlayerRole;
    selfId: string;
    timeLeft: number;
}

const renderVotes = (voteCount: number) => {
    return (
        <motion.div className={styles.voteContainer}>
            <AnimatePresence>
                {Array.from(Array(voteCount).keys()).map((idx) => {
                    return (
                        <motion.div layout key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{}}>
                            <ImCross />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
}

const renderVoteCard = (
    idx: number,
    renderingPlayer: IPlayer,
    selfId: string,
    allPlayer: IPlayer[],
    onVote: (playerId: string) => void
) => {
    const voteable = selfId !== renderingPlayer.id;
    const label = `${renderingPlayer.id} ${!voteable ? "(You!)" : ""}`.trim();
    const votedBy = allPlayer.reduce((acc: string[], player) => {
        return player.votedId === renderingPlayer.id ? [...acc, player.id] : acc;
    }, [])


    return (
        <motion.div
            key={renderingPlayer.id}
            initial={"initial"}
            animate={"visible"}
            whileHover={voteable ? "hover" : ""}
            custom={idx}
            variants={voteCardVariants}
            className={[styles.voteCard, voteable && styles.voteable].filter(Boolean).join(" ")}
            onClick={() => onVote(renderingPlayer.id)}
        >
            <p>{label}</p>
            {renderingPlayer.gifUrl
                ? <img src={renderingPlayer.gifUrl} />
                : <div className={styles.placeholder}>{"No GIF selected :("}</div>}
            {renderVotes(votedBy.length)}
            {!renderingPlayer.connected && <p>{"disconnected"}</p>}
        </motion.div>
    )
}

const renderVoteDescription = (role: PlayerRole, question?: IQuestion) => {
    const isSelfImposter = role === PlayerRole.IMPOSTER;

    return (
        <>
            <motion.p key={"questionPretext"} className={styles.briefText}>
                {"The question was:"}
            </motion.p>
            <motion.p key={"question"} className={[styles.question, styles.briefText].join(" ")} variants={briefingTextVariants}>
                {`"${question?.value}"`}
            </motion.p>
            {<motion.p key={"questionPostText"} className={styles.briefText} variants={briefingTextVariants}>
                {isSelfImposter ? "Now, vote someone out" : "Vote for who you think is the imposter"}
            </motion.p>}
        </>
    );
}

export const VotePlayerView: FunctionComponent<VotePlayerViewProps> = ({
    players,
    question,
    role,
    selfId,
    timeLeft,
}) => {

    const { serverWorker } = useSessionInfo();

    const onVote = async (playerId: string) => {
        await serverWorker.submitVote(playerId);
    }
    const BRIEFING_DELAY = 3000;

    return (
        <>
            <motion.div className={styles.brief} initial={"initial"} animate={"visible"} exit={"exit"} variants={briefingVariants}>
                {<Timer className={styles.timer} timeLeft={timeLeft} delay={BRIEFING_DELAY} variants={timerVariants} />}
                {renderVoteDescription(role, question)}
            </motion.div>
            <motion.div className={styles.voteCards}>
                {players.map((player, idx) => renderVoteCard(idx, player, selfId, players, onVote))}
            </motion.div>
        </>);
}

export default VotePlayerView;