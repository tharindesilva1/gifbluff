import { animate, motion } from "framer-motion";
import React, { ForwardRefRenderFunction, FunctionComponent, useEffect, useRef, useState } from "react";

import styles from "./Timer.module.scss";

interface TimerProps {
    className?: string;
    timeLeft: number;
    delay: number;
}

const ringRadius = 40;
const ringStrokeWidth = 6;
const ringSize = 2 * (ringRadius + ringStrokeWidth);
const ringCenter = ringRadius + ringStrokeWidth;
const ringCircumference = 2 * Math.PI * ringRadius; // inner circumference

const Timer: ForwardRefRenderFunction<HTMLDivElement, TimerProps> = ({
    className,
    timeLeft,
    delay,
}, ref) => {
    useEffect(() => {
        setTimeout(() => {
            const controls = animate(timeLeft - (delay / 1000), 0, {
                duration: timeLeft - (delay / 1000),
                type: "tween",
                ease: "linear",
                onUpdate: (value) => {
                    const [secs, milSecs] = `${value.toFixed(2)}`.split(".");
                    if (sRef.current) sRef.current.textContent = value < 10 ? `0${secs}` : secs;
                    if (msRef.current) msRef.current.textContent = `.${milSecs}`;
                    if (svgRef.current) svgRef.current.style.strokeDashoffset = `${(value / timeLeft) * ringCircumference}`;
                }
            });
            return () => controls.stop();
        }, delay);
    }, [timeLeft]);

    const sRef = useRef<HTMLSpanElement>(null);
    const msRef = useRef<HTMLSpanElement>(null);
    const svgRef = useRef<SVGCircleElement>(null);

    return (
        <div ref={ref} className={[styles.timer, className].filter(Boolean).join(" ")}>
            <div className={styles.time}>
                <motion.span className={styles.secs} ref={sRef}></motion.span>
                <span className={styles.milSecs} ref={msRef}></span>
            </div>
            <motion.svg strokeWidth={ringStrokeWidth} width={ringSize} height={ringSize} className={styles.ringSvg}>
                <motion.circle
                    ref={svgRef}
                    strokeDasharray={ringCircumference}
                    cx={ringCenter}
                    cy={ringCenter}
                    r={ringRadius}
                    className={styles.ringProgress}>
                </motion.circle>
                <motion.circle
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={0}
                    cx={ringCenter}
                    cy={ringCenter}
                    r={ringRadius}
                    className={styles.ringTrack}>
                </motion.circle>
            </motion.svg>
        </div>
    )
}

export default motion(React.forwardRef<HTMLDivElement, TimerProps>(Timer));