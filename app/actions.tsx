"use server";

import { streamObject } from "ai";
import { atsResumeAnalysisPrompt } from "@/utils/prompts";
import { createStreamableValue } from "ai/rsc";

import { z } from "zod";

import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict', // strict mode, enable when using the OpenAI API
});

export async function generate(input: string) {
  'use server';

  const stream = createStreamableValue();
  
//   const model = google("models/gemini-1.5-pro-latest",
//     {
//       safetySettings: [
//         {
//           category: 'HARM_CATEGORY_HATE_SPEECH',
//           threshold: 'BLOCK_NONE',
//         },
//         {
//           category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
//            threshold: 'BLOCK_NONE',
//         },
//         {
//           category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
//            threshold: 'BLOCK_NONE',
//         },
//         {
//           category: 'HARM_CATEGORY_HARASSMENT',
//            threshold: 'BLOCK_NONE',
//         },
//       ],

//   });
  const gpt_model=openai('gpt-4-turbo');

  (async () => {
    const { partialObjectStream } = await streamObject({
      model:gpt_model,
      system:
        `Generate the and score, strenghts and feedback for given resume. 6 points should be miniminum for each category.
        If its not a resume just provide null and say not a resume
        `,
      prompt: `
      Give me and score out of 100, strengths, feedback for this resume, here is the extracted text from the resume:\n\n${input} 
      give output based on this parameters ${atsResumeAnalysisPrompt}. Based on this we need generate the strenghts and feedback for each category.
      `,
      schema: z.object({
        score: z
          .string()
          .describe(
            "Score out of 100; it should be like x/100 where x is the score."
          ),
        strengths: z
          .array(z.string())
          .describe(
            "Highlight the strengths of the resume in pointwise format."
          ),
        feedbacks: z
          .array(z.string())
          .describe(
            "Give feedback on the resume and suggestions for improvement in pointwise format."
          ),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
