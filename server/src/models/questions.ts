import { IQuestion } from "../typings/index";

const QuestionBank: IQuestion[] = [
  {
    value: "When someone steals your joke and tells it better",
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
    value: "Trying to buy a GPU in 2021",
    hint: "shortage",
  },
  {
    value: "trying to find the cheapest deal, when buying something",
    hint: "frugal",
  },
  {
    value: "How it's like to be fashionably late",
    hint: "party guests",
  },
  {
    value: "When you grab the last toilet paper, from the supermarket",
    hint: "toilet paper",
  },
  {
    value: "What it's like trying to organise a group of people",
    hint: "managing",
  },
  {
    value:
      "When you're trying to convince a bug in the code isn't as bad as it looks",
    hint: "software bugs",
  },
];

export const GetRandomQuestion = () =>
  QuestionBank[Math.floor(Math.random() * QuestionBank.length)];
