import { SessionStatus } from "@gif/common";
import { AnimateSharedLayout, motion } from "framer-motion";
import React, { FunctionComponent } from "react";

import styles from "./StageTracker.module.scss";

interface StageTrackerProps {
    className?: string;
    status: SessionStatus;
}

const StageTracker: FunctionComponent<StageTrackerProps> = ({
    className,
    status
}) => {
    const stages = {
        [SessionStatus.LOBBY]: {
            title: "Lobby",
            colour: "#ff0400"
        },
        [SessionStatus.GIF_SELECT]: {
            title: "Question",
            colour: "#ff0088"
        },
        [SessionStatus.VOTE]: {
            title: "Vote",
            colour: "#d902ff"
        },
        [SessionStatus.END]: {
            title: "Result",
            colour: "#300bff"
        }
    }

    if (status) {
        return (
            <AnimateSharedLayout>
                <ol className={[styles.gameTracker, className].filter(Boolean).join(" ")}>
                    {Object.entries(stages).map(([key, val]) => {
                        const isCurrent = key === status;

                        return (
                            <motion.li
                                key={key}
                                className={[styles.stage, isCurrent && styles.current].filter(Boolean).join(" ")}
                                style={{ color: isCurrent ? val.colour : "#333" }}
                                animate
                            >
                                {val.title}
                            </motion.li>
                        );
                    })}
                </ol>
            </AnimateSharedLayout>
        );
    } else return null;
}

export default StageTracker;