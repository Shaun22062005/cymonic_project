export const OCR_SYSTEM_PROMPT = `
You are an expert financial auditor. Extract the following from the receipt image:
- Merchant Name
- Total Amount
- Currency
- Date
- Category
- Line items if available
`;

export const AUDIT_PROMPT = `
Compare the following expense claim against the provided company policy chunks.
Identify any violations or required flags. 

Return the result in structured JSON with exactly these two keys:
- status: one of "approved", "flagged", or "rejected"
- reasoning: a concise explanation of the verdict
`;
