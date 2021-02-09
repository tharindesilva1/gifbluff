import { AnimationProps } from "framer-motion"

export const voteCardVariants: AnimationProps["variants"] = {
    initial: {
        scale: 0
    },
    visible: (custom) => {
        return {
            scale: 1,
            transition: {
                scale: {
                    delay: 3 + 0.5 * custom,
                }
            }
        }
    },
    hover: {
        boxShadow: "0 0 8px rgba(255, 255, 255, 1)"
    }
}

export const timerVariants: AnimationProps["variants"] = {
    initial: {
        y: 10,
        opacity: 0
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            delay: 3,
        }
    }
}

export const briefingVariants: AnimationProps["variants"] = {
    initial: {},
    visible: {
        transition: {
            staggerChildren: 1
        }
    },
    exit: {}
}

export const briefingTextVariants: AnimationProps["variants"] = {
    initial: {
        y: 10,
        opacity: 0
    },
    visible: {
        y: 0,
        opacity: 1,
    },
    exit: {
        y: 10,
        opacity: 0,
    },
}