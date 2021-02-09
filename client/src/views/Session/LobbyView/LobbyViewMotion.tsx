import { AnimationProps } from "framer-motion";

export const textContainerVariants: AnimationProps["variants"] = {
    initial: {},
    visible: {
        transition: {
            staggerChildren: 1
        }
    }
}

export const textContainerFastVariants: AnimationProps["variants"] = {
    initial: {},
    visible: {
        transition: {
            delayChildren: 2,
            staggerChildren: 0.25
        }
    }
}

export const textVariants: AnimationProps["variants"] = {
    initial: {
        y: 10,
        opacity: 0
    },
    visible: {
        y: 0,
        opacity: 1

    }

}