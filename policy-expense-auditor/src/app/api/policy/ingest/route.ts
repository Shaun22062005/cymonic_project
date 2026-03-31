import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { qdrant, ensureCollection } from '@/lib/qdrant/client';
import { embedText } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('policy') as File;
    if (!file) return NextResponse.json({ error: 'No policy file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);
    const text = data.text;

    // Chunking logic (~500 chars with 50 overlap)
    const chunkSize = 500;
    const overlap = 50;
    const chunks: string[] = [];
    
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.substring(i, i + chunkSize));
    }

    await ensureCollection('policies');

    const points = await Promise.all(
      chunks.map(async (chunk) => {
        const vector = await embedText(chunk);
        return {
          id: crypto.randomUUID(),
          vector,
          payload: {
            content: chunk,
            filename: file.name,
            created_at: new Date().toISOString(),
          },
        };
      })
    );

    await qdrant.upsert('policies', {
      wait: true,
      points,
    });

    return NextResponse.json({ success: true, chunkCount: chunks.length });
  } catch (error: any) {
    console.error('Policy Ingestion Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
