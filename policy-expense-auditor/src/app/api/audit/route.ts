import { NextRequest, NextResponse } from 'next/server';
import { extractReceiptData, runAudit, embedText } from '@/lib/ai/gemini';
import { qdrant } from '@/lib/qdrant/client';
import { createServerClient } from '@/lib/db/supabase';
import { sendAuditNotification } from '@/lib/email/resend';

export async function POST(req: NextRequest) {
  try {
    // 1. Get form data
    const formData = await req.formData();
    
    // 2. Get file
    const file = formData.get('receipt') as File;
    if (!file) return NextResponse.json({ error: 'No receipt provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 3. Extract receipt data (AI)
    const extractedData = await extractReceiptData(buffer, file.type);
    
    // 4. Get manual user data from individual fields
    const manualData = {
      merchant: formData.get('merchant') as string,
      amount: formData.get('amount') as string,
      currency: formData.get('currency') as string,
      category: formData.get('category') as string,
      expense_date: formData.get('expense_date') as string,
      business_purpose: formData.get('business_purpose') as string,
      employee_id: formData.get('employee_id') as string,
    };

    // 5. Retrieve relevant policy chunks from Qdrant (RAG)
    const queryText = manualData?.category || extractedData.category;
    const embedding = await embedText(queryText);
    const searchResult = await qdrant.search('policies', {
      vector: embedding,
      limit: 3,
    });

    // 6. Combine context and Run audit (AI)
    const policyContext = searchResult.map(r => r.payload?.content).join('\n');
    const combinedData = {
      receipt: extractedData,
      user_claim: manualData
    };
    const auditResult = await runAudit(combinedData, policyContext);

    const supabase = createServerClient();

    // 7. Insert claim into Supabase
    // We use a dummy user_id since auth is not implemented yet
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        merchant: manualData?.merchant || extractedData.merchant,
        amount: parseFloat(manualData?.amount || extractedData.amount),
        currency: manualData?.currency || extractedData.currency,
        category: manualData?.category || extractedData.category,
        receipt_storage_path: 'https://placeholder-receipt-url.com',
        status: 'pending',
        user_id: '00000000-0000-0000-0000-000000000000'
      })
      .select()
      .single();

    if (claimError) throw new Error(`Claim insertion failed: ${claimError.message}`);

    // 8. Update the claim status and insert audit log
    const { error: logError } = await supabase
      .from('audit_logs')
      .insert({
        claim_id: claim.id,
        result: auditResult.status,
        reasoning: auditResult.reasoning,
      });

    if (logError) throw new Error(`Audit log insertion failed: ${logError.message}`);

    const { error: updateError } = await supabase
      .from('claims')
      .update({ status: auditResult.status })
      .eq('id', claim.id);

    if (updateError) throw new Error(`Claim status update failed: ${updateError.message}`);

    // EMAIL NOTIFICATION
    try {
      await sendAuditNotification({
        to: "test@example.com",
        employeeName: "Employee",
        merchant: manualData?.merchant || extractedData.merchant,
        amount: parseFloat(manualData?.amount || extractedData.amount),
        currency: manualData?.currency || extractedData.currency,
        status: auditResult.status, // approved | flagged | rejected
        reason: auditResult.reasoning,
      });
    } catch (emailError) {
      // Log the error but do not fail the request
      console.error('Email notification failed:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      claim_id: claim.id,
      audit: auditResult 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Audit Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
