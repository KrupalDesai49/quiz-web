import { z } from "zod";

export const questionSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      "Four possible answers to the question. Only one should be correct. They should all be of equal lengths."
    ),
  answer: z
    .enum(["A", "B", "C", "D"])
    .describe(
      "The correct answer, where A is the first option, B is the second, and so on."
    ),
});

export const flashcardSchema = z.object({
  question: z
    .string()
    .max(200, "The question must not be more than 200 characters")
    .describe("The question text"),
  answer: z
    .string()
    .max(200, "The answer must not be more than 200 characters")
    .describe("The answer text"),
});

export type Question = z.infer<typeof questionSchema>;
export type Flashcard = z.infer<typeof flashcardSchema>;

export const questionsSchema = z.array(questionSchema).length(4);

export const flashcardsSchema = z.array(flashcardSchema).length(3);
