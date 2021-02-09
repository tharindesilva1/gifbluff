import React, { FunctionComponent } from "react";

import styles from "./LobbyView.module.scss";

import { IPlayer } from "@gif/common";
import Button from "../../components/Button";
import { motion } from "framer-motion";
import { textContainerFastVariants, textContainerVariants, textVariants } from "./LobbyViewMotion";

interface LobbyViewProps {
    sessionId: string;
    players: IPlayer[];
    onStartGame: () => void;
}

const MINIMUM_PLAYER_COUNT = 1;

const canGameStart = (playerCount: number) => {
    return playerCount >= MINIMUM_PLAYER_COUNT;
}

const renderPlayerList = (players: IPlayer[]) => {
    return (
        <motion.ul className={styles.playerList} initial={"initial"} animate={"visible"} variants={textContainerFastVariants}>
            {players.map((player, index) => <motion.li key={index} variants={textVariants} exit={{ opacity: 0 }}>{player.id}</motion.li>)}
        </motion.ul>
    )
}

export const LobbyView: FunctionComponent<LobbyViewProps> = ({
    players,
    sessionId,
    onStartGame,
}) => {

    let startText = "You need at least 1 more player to start the game"
    if (players.length === 2) startText = `you can start now, for demo purposes (although it's a bit pointless!)`
    else if (players.length > 2) startText = "everyone in? Press start"

    return (
        <>
            <motion.div className={styles.brief} initial={"initial"} animate={"visible"} variants={textContainerVariants}>
                <motion.p variants={textVariants}>Use code {<span>{sessionId}</span>} to join this lobby</motion.p>
                <motion.p variants={textVariants} exit={{ opacity: 0 }}>{startText}</motion.p>
            </motion.div>
            {renderPlayerList(players)}
            <Button className={styles.startButton} onClick={onStartGame} disabled={!canGameStart(players.length)}>
                {"Start!"}
            </Button>
        </>);
}




export default LobbyView;



