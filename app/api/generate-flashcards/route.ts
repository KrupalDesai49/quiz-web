import { createFlashcardsSchema, flashcardSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files, count } = await req.json();
  const firstFile = files[0].data;
  console.log(`Generating ${count} flashcards`);

  const result = streamObject({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "system",
        content: `You are a teacher. Your job is to take a document and create exactly ${count} flashcards in question and answer style based on the content of the document. Make sure the output is an array with ${count} flashcards.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Create EXACTLY ${count} question and answer flashcards based on this document.`,
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
        console.log("Generated flashcards:", object);
        console.log("Count:", object?.length);

        const schema = createFlashcardsSchema(count);
        const res = schema.safeParse(object);

        if (!res.success) {
          const errorMessages = res.error.errors
            .map((e) => e.message)
            .join("\n");
          throw new Error(errorMessages);
        }
        console.log("DONE");
      } catch (err) {
        console.log(err);
      }
    },
  });

  return result.toTextStreamResponse();
}
