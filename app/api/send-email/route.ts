import { NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(request: Request) {
  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set in .env.local');
      return NextResponse.json({ message: 'Server configuration error: Resend API key not set.' }, { status: 500 });
    }
     if (!ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not set in .env.local');
      return NextResponse.json({ message: 'Server configuration error: Admin email not set.' }, { status: 500 });
    }

    const body = await request.json();
    // De-structure all the data we now send from the frontend
    const { name, email, subject, complaint, attachmentUrl } = body;

    const emailPayload = {
      from: 'Smart Complaint Box <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `New Complaint: ${subject}`,
      // --- UPDATED: HTML now includes the complaint details and attachment link ---
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h1 style="color: #333;">New Complaint Received</h1>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p><strong>From:</strong> ${name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${email || 'Not provided'}</p>
          <h2>Complaint Details:</h2>
          <p>${complaint}</p>
          ${attachmentUrl ? `
            <hr />
            <h2>Attachment</h2>
            <p><a href="${attachmentUrl}" target="_blank" style="color: #007bff; text-decoration: none;">View Attached File</a></p>
          ` : ''}
        </div>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return NextResponse.json({ error: data.message || 'Failed to send email' }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Catch block error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}