import { AnimationProps } from "framer-motion"

const baseTransitions = {
    repeat: Infinity,
    duration: 0.3,
    repeatType: "reverse",
}

export const bouncingBallVariants: AnimationProps["variants"] = {
    initial: {
        backgroundColor: "#1305d8",
        y: 0,
        scaleY: 0.5,
        scaleX: 1.5,
    },
    animate: (custom) => {
        return {
            backgroundColor: "#ff0000",
            y: -25,
            scaleY: 1,
            scaleX: 1,

            transition: {
                delay: 0.05 * custom,
                y: {
                    ...baseTransitions,
                    ease: "easeOut"
                },
                scaleY: {
                    ...baseTransitions,
                    ease: "backOut"
                },
                scaleX: {
                    ...baseTransitions,
                    ease: "backOut"
                },
                backgroundColor: {
                    ...baseTransitions,
                    repeatDelay: 0.5,
                    duration: 0.1,
                    ease: "easeOut"
                },
            }
        }
    }
}