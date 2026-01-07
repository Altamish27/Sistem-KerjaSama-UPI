import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com'

export async function POST(request: NextRequest) {
  try {
    const { email, name, proposalTitle, proposalId } = await request.json()

    // DEVELOPMENT MODE: Testing Resend hanya bisa kirim ke email verified
    const isDev = process.env.NODE_ENV === 'development'
    const actualRecipient = isDev ? 'hasbiberbagi@gmail.com' : email

    const { error } = await resend.emails.send({
      from: `DKUI UPI <${EMAIL_FROM}>`,
      to: [actualRecipient],
      subject: `Konfirmasi Pengajuan Proposal - ${proposalTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #003d7a 0%, #005bb5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #003d7a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background: white; padding: 20px; border-left: 4px solid #003d7a; margin: 20px 0; }
              .dev-notice { background: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              ${isDev ? `<div class="dev-notice"><strong>🔧 DEV MODE:</strong> Email seharusnya ke <code>${email}</code></div>` : ''}
              <div class="header">
                <h1 style="margin: 0;">✅ Proposal Berhasil Dikirim!</h1>
              </div>
              
              <div class="content">
                <p>Yth. <strong>${name}</strong>,</p>
                
                <p>Terima kasih telah mengajukan proposal kerjasama dengan Universitas Pendidikan Indonesia.</p>
                
                <div class="info-box">
                  <p style="margin: 0;"><strong>Judul Proposal:</strong></p>
                  <p style="margin: 5px 0 0 0; font-size: 16px;">${proposalTitle}</p>
                </div>
                
                <h3>📋 Tahapan Selanjutnya:</h3>
                <ol>
                  <li><strong>Review oleh DKUI</strong> - Tim kami akan melakukan review awal terhadap proposal Anda</li>
                  <li><strong>Evaluasi Fakultas</strong> - Jika lolos review awal, proposal akan dievaluasi oleh fakultas terkait</li>
                  <li><strong>Kredensial Login</strong> - Jika proposal disetujui, Anda akan menerima email dengan username dan password untuk login ke dashboard</li>
                  <li><strong>Tracking Progress</strong> - Gunakan dashboard untuk memantau progress dan melengkapi dokumen</li>
                </ol>
                
                <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>💡 Catatan Penting:</strong></p>
                  <ul style="margin: 10px 0 0 0;">
                    <li>Proses review memakan waktu 3-5 hari kerja</li>
                    <li>Kami akan mengirimkan update via email di setiap tahapan</li>
                    <li>Email ini: <strong>${email}</strong> akan digunakan sebagai username login Anda</li>
                  </ul>
                </div>
                
                <p>Jika Anda memiliki pertanyaan, silakan hubungi kami:</p>
                <p style="margin: 5px 0;">
                  📧 Email: dkui@upi.edu<br/>
                  📞 Telepon: (022) 2013163
                </p>
              </div>
              
              <div class="footer">
                <p>Email ini dikirim otomatis oleh sistem. Mohon tidak membalas email ini.</p>
                <p>© 2026 DKUI - Universitas Pendidikan Indonesia</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Error sending confirmation email:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in send-confirmation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
