import { AnimationProps } from "framer-motion"

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