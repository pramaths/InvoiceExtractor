import { z } from 'zod';

export const InvoiceDataSchema = z.object({
  customer_details: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  products: z.array(
    z.object({
      description: z.string().optional(),
      quantity: z.number().optional(),
      unit_price: z.number().optional(),
    })
  ).optional(),
  total_amount: z.object({
    subtotal: z.number().optional(),
    taxes: z.number().optional(),
    discounts: z.number().optional(),
    final_total: z.number().optional(),
  }).optional(),
  payment_terms: z.object({
    due_date: z.string().optional(),
    payment_method: z.string().optional(),
  }).optional(),
  invoice_details: z.object({
    number: z.string().optional(),
    issue_date: z.string().optional(),
  }).optional(),
});

export const invoiceExtractionPrompt = (invoiceParsedData: string) =>
  `Extract the following details from the invoice data: ${invoiceParsedData}

  Use the provided Zod schema to extract the following information:

  CUSTOMER DETAILS:
    - Name
    - Address
    - Phone Number
    - Email

  PRODUCTS:
    - Description
    - Quantity
    - Unit Price

  TOTAL AMOUNT:
    - Subtotal
    - Taxes
    - Discounts
    - Final Total

  PAYMENT TERMS:
    - Due Date
    - Payment Method

  INVOICE DETAILS:
    - Invoice Number
    - Issue Date

  The extracted data should be structured according to the provided Zod schema, which defines the expected shape of the extracted invoice data. This will ensure that the data is well-organized and easy to work with in further analysis or reporting.
  `;
