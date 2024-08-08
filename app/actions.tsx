"use server";

import { streamObject } from "ai";
import { invoiceExtractionPrompt } from "@/utils/prompts";
import { createStreamableValue } from "ai/rsc";

import { z } from "zod";

import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractInvoiceDetails(input: string) {
  'use server';

  const stream = createStreamableValue();
  
  const gpt_model = openai('gpt-4-turbo');  

  (async () => {
    const { partialObjectStream } = await streamObject({
      model: gpt_model,
      system: `Extract specific invoice details from the provided text. Return structured data for further processing.`,
      prompt: `
      Analyze the provided invoice text and extract structured details using the following guidelines:\n\n${input}
      ${invoiceExtractionPrompt(input)}
      `,
      schema: z.object({
        customer_details: z
          .string()
          .describe("Customer's information."),
        products: z
            .string().
            describe("List of products or services purchased."),
        total_amount: z
          .string()
          .describe("Total amount charged, including all taxes and discounts."),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
