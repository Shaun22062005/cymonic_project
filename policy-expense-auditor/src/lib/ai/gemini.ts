import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { OCR_SYSTEM_PROMPT, AUDIT_PROMPT } from './prompts';

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const receiptSchema = {
  type: SchemaType.OBJECT,
  properties: {
    merchant: { type: SchemaType.STRING },
    amount: { type: SchemaType.NUMBER },
    currency: { type: SchemaType.STRING },
    date: { type: SchemaType.STRING },
    category: { type: SchemaType.STRING },
  },
  required: ['merchant', 'amount', 'currency', 'date', 'category'],
};

export async function extractReceiptData(imageBuffer: Buffer, mimeType: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: receiptSchema,
    },
    systemInstruction: OCR_SYSTEM_PROMPT,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType,
      },
    },
    'Extract the receipt data according to the schema.',
  ]);

  return JSON.parse(result.response.text());
}

export async function runAudit(expenseData: any, policyContext: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
    systemInstruction: AUDIT_PROMPT,
  });

  const prompt = `
    Policy Context: ${policyContext}
    Expense Data: ${JSON.stringify(expenseData)}
    
    Audit this expense against the policy.
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY!
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] }
      })
    }
  )
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Embedding API error: ${error}`)
  }
  const data = await response.json()
  return data.embedding.values
}
