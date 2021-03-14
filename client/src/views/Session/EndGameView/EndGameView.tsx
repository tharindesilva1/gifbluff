import { motion } from "framer-motion";


import { IPlayer, PlayerRole } from "@gif/common";

import React, { FunctionComponent } from "react";

import styles from "./EndGameView.module.scss";
import { briefingTextVariants, briefingVariants } from "./EndGameViewMotion";
import Button from "../../components/Button";

interface EndGameViewProps {
    players: IPlayer[];
    role: PlayerRole;
    selfId: string;
    onGoHome: () => void;
}

const renderEndDescription = (players: IPlayer[]) => {
    const imposter = players.find(player => player.role === PlayerRole.IMPOSTER);

    return (
        <>
            <motion.p className={[styles.briefText, styles.endDescription].join(" ")} variants={briefingTextVariants}>
                {"And the imposter was..."}
            </motion.p>
            {imposter && <motion.p className={styles.imposterName} variants={briefingTextVariants} >{imposter.id}</motion.p>}
        </>
    );
}

const renderResults = (players: IPlayer[], role: PlayerRole, onGoHome: () => void) => {

    const votesTally = players.reduce((tally: { [key: string]: number }, player) => {
        if (player.votedId) {
            tally[player.votedId] = tally[player.votedId] ? tally[player.votedId] + 1 : 1;
        }
        return tally;
    }, {});
    const votesOnly = Object.values(votesTally);
    const mostVotes = Math.max(...votesOnly);
    const hasNoTies = votesOnly.filter(votes => votes === mostVotes).length === 1;

    const renderWin = () => <motion.p className={[styles.briefText, styles.result].join(" ")} variants={briefingTextVariants} >{"You win!"}</motion.p>
    const renderLose = () => <motion.p className={[styles.briefText, styles.result].join(" ")} variants={briefingTextVariants}>{"You lose!"}</motion.p>
    const renderHomeButton = () => <Button onClick={onGoHome}>{"Home"}</Button>

    if (hasNoTies) {
        const mostVotedId = Object.keys(votesTally).find(key => votesTally[key] === mostVotes);
        const mostVotedPlayerRole = players.find(player => player.id === mostVotedId)?.role;

        return (
            <>
                <motion.p>{`${mostVotedId} received the greatest number of votes`}</motion.p>
                {renderEndDescription(players)}
                {mostVotedPlayerRole !== role ? renderWin() : renderLose()}
                {renderHomeButton()}
            </>
        );
    } else {
        return (
            <>
                <p>{"There was no majority vote"}</p>
                {role === PlayerRole.IMPOSTER ? null : renderEndDescription(players)}
                {role === PlayerRole.IMPOSTER ? renderWin() : renderLose()}
                {renderHomeButton()}
            </>
        );
    }
}


const EndGameView: FunctionComponent<EndGameViewProps> = ({
    players,
    role,
    onGoHome,
}) => {
    return (
        <>
            <motion.div className={styles.brief} initial={"initial"} animate={"visible"} exit={"exit"} variants={briefingVariants}>
                {renderResults(players, role, onGoHome)}
            </motion.div>
        </>);
}

export default EndGameView;