import { AnimationProps } from "framer-motion";

export const gifVariants: AnimationProps["variants"] = {
    initial: {
        scale: 0,
    },
    visible: {
        scale: 1,
        transition: {
            type: "spring",
            duration: 0.3
        }
    },
    hover: {
        boxShadow: "0 0 8px rgba(255, 255, 255, 1)"
    }
}

export const searchHelperVariants: AnimationProps["variants"] = {
    initial: {
        y: 0,
    },
    visible: {
        y: -7,
        transition: {
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse",
        }
    },
}
