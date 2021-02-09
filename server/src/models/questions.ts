import { IQuestion } from "../typings/index";

const QuestionBank: IQuestion[] = [
    {
        value: "When your supposed friend steals your joke",
        hint: "trust issues",
    },
    {
        value: "When you try to fit in with the younger generation",
        hint: "fellow kids",
    },
    {
        value: "What it's like when the internet goes out",
        hint: "stone age",
    },
    {
        value: "When your friend ditches saving you, for a kill, in League",
        hint: "betrayal",
    },
    {
        value: "How you feel about people that pick ignite, over teleport, at top",
        hint: "chads",
    },
    {
        value: "When you unironically play the Bongcloud Attack, in chess",
        hint: "chess",
    },
    {
        value: "When you see a Guateburger sign, in GeoGuessr",
        hint: "South America in GeoGuessr",
    },
    {
        value: "Trying to buy a GPU in 2021",
        hint: "shortage",
    },
    {
        value: "When you're trying to find the cheapest deal",
        hint: "frugal",
    },
    {
        value: "How you feel about people that say they'll be back in 15 mins but end up taking an hour",
        hint: "lying",
    },
    {
        value: "When you beat a Souls boss, first try",
        hint: "pro gamer moments",
    },
    {
        value: "What it's like trying to pick a movie to watch, over discord",
        hint: "movie night",
    },
]

export const GetRandomQuestion = () => QuestionBank[Math.floor(Math.random() * QuestionBank.length)];
