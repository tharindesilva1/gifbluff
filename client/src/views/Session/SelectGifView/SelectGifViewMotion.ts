import { AnimationProps } from "framer-motion";

export const gifVariants: AnimationProps["variants"] = {
    initial: {
        opacity: 0,
        x: -20,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 2,
        }
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: {
            duration: 2,
        }
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
    },
}

export const briefingVariants: AnimationProps["variants"] = {
    initial: {},
    visible: {
        transition: {
            staggerChildren: 1
        }
    }
}

export const briefingTextVariants: AnimationProps["variants"] = {
    initial: {
        y: 10,
        opacity: 0
    },
    visible: {
        y: 0,
        opacity: 1
    }
}