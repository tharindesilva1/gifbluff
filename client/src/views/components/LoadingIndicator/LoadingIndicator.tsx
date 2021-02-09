import { motion } from "framer-motion";
import React, { FunctionComponent } from "react";

import styles from "./LoadingIndicator.module.scss";
import { bouncingBallVariants } from "./LoadingIndicatorMotion";

interface LoadingIndicatorProps {
    className?: string,
}

export const LoadingIndicator: FunctionComponent<LoadingIndicatorProps> = ({ className }) => {

    return (
        <div className={[styles.loadingIndicator, className].join(" ")}>
            <motion.div initial={"initial"} custom={0} animate={"animate"} variants={bouncingBallVariants} className={styles.bouncingBall} />
            <motion.div initial={"initial"} custom={1} animate={"animate"} variants={bouncingBallVariants} className={styles.bouncingBall} />
            <motion.div initial={"initial"} custom={2} animate={"animate"} variants={bouncingBallVariants} className={styles.bouncingBall} />
        </div >
    )
}

export default LoadingIndicator;