import { questionSchema, questionsSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;
  console.log("quizzzzz");

  const result = streamObject({
    model: google("gemini-1.5-pro-latest"),
    messages: [
      {
        role: "system",
        content:
          "You are a teacher. Your job is to take a document, and create a multiple choice test (with 4 questions) based on the content of the document. Each option should be roughly equal in length.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create a multiple choice test based on this document.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: questionSchema,
    output: "array",
    onFinish: ({ object }) => {
      try {
        console.log("object11@@@@", object);
        console.log("object11@@@@", object?.length);

        const res = questionsSchema.safeParse(object);
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
