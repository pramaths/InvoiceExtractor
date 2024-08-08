export const invoiceExtractionPrompt = (invoiceParsedData: String) =>
  `Extract the following details from the invoice data: ${invoiceParsedData}
    CUSTOMER DETAILS: Extract and summarize the customer's contact information, including name, address, and communication details.
    PRODUCTS: Extract details about the products or services purchased, including descriptions, quantities, and unit prices.
    TOTAL AMOUNT: Extract the total amount charged, including a breakdown of taxes and any discounts applied.
    PAYMENT TERMS: Identify and describe the payment terms that were agreed upon, such as due date and payment methods.
    INVOICE NUMBER: Extract the unique invoice number for reference.
    ISSUE DATE: Identify the date when the invoice was issued.
    DUE DATE: Extract the payment due date for the invoice.
    NOTES: Extract any additional notes that may be relevant to the invoice or payment conditions.

  Use this information to populate a structured database or a system for further analysis or reporting.
  from the above data generate customer_details like address, phone_number, mail etc.., products and total_amount
  `;
