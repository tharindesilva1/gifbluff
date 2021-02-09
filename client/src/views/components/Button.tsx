import { motion } from "framer-motion";
import React, { ForwardRefRenderFunction } from "react";

interface ButtonProps {
    className?: string,
    onClick: () => void,
    disabled?: boolean,
    children: React.ReactNode,
}

const Button: ForwardRefRenderFunction<HTMLButtonElement, ButtonProps> = ({
    className,
    disabled = false,
    onClick,
    children,
}, ref) => {

    const whileHover = {
        y: -2,
        boxShadow: "0 0 8px rgba(255, 255, 255, 0.4)",
        textShadow: "0 0 8px rgba(255, 255, 255, 1)"
    }

    return (
        <motion.button
            ref={ref}
            disabled={disabled}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, boxShadow: "0 0 8px rgba(255, 255, 255, 0)", textShadow: "0 0 8px rgba(255, 255, 255, 0)", y: 0 }}
            whileTap={{ y: 0 }}
            whileHover={disabled ? {} : whileHover}
            className={className} onClick={onClick}>
            {children}
        </motion.button>
    );
}

export default motion(React.forwardRef<HTMLButtonElement, ButtonProps>(Button));