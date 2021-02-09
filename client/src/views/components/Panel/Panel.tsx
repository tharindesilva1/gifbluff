import { motion } from "framer-motion";
import React, { ForwardRefRenderFunction, ReactNode, useEffect } from "react";


import styles from "./Panel.module.scss";

interface PanelProps {
    className?: string,
    children: ReactNode,
}


const Panel: ForwardRefRenderFunction<HTMLDivElement, PanelProps> = ({
    className,
    children
}, ref) => {
    return (
        <motion.div ref={ref} layout layoutId={"panelBg"} className={[styles.background, className].filter(Boolean).join(" ")}>
            <motion.div layout layoutId={"panelContent"} className={styles.panel}>
                {children}
            </motion.div >
        </motion.div >
    );
}


export default motion(React.forwardRef<HTMLDivElement, PanelProps>(Panel));