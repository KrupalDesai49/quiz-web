import { Flashcard, flashcardSchema, flashcardsSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;
  console.log("flashcardsssss");

  const result = streamObject({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "system",
        content:
          "You are a teacher. Your job is to take a document and create exactly 3 flashcards in question and answer style based on the content of the document. Make sure the output is an array with 3 flashcards.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create EXACTLY 3 question and answer flashcards based on this document.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],

    schema: flashcardSchema,
    output: "array",

    onFinish: ({ object }) => {
      try {
        console.log("object11@@@@", object);
        console.log("object11@@@@", object?.length);

        // const exactlyThree = object ? object.slice(0, 3) : [];

        // while (exactlyThree.length < 3) {
        //   exactlyThree.push({
        //     question: "Additional question needed",
        //     answer: "Additional answer needed",
        //   });
        // }

        const res = flashcardsSchema.safeParse(object);
        console.log("object11@@@@", res);
        if (!res.success) {
          const errorMessages = res.error.errors
            .map((e) => e.message)
            .join("\n");
          throw new Error(errorMessages);
        }
        console.log("DONEEEEEE");
      } catch (err) {
        console.log(err);
      }
    },
  });

  return result.toTextStreamResponse();
}
