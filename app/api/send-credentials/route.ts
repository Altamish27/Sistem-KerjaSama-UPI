import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com'

export async function POST(request: NextRequest) {
  try {
    const { to, email, name, password, tempPassword, proposalTitle, proposalId, institution } = await request.json()

    // Support both 'to' and 'email' parameter names
    const recipientEmail = to || email
    const userPassword = tempPassword || password

    if (!recipientEmail || !name || !userPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`

    // DEVELOPMENT MODE: Testing Resend hanya bisa kirim ke email verified
    // Untuk production, remove override ini dan verify domain di resend.com/domains
    const isDev = process.env.NODE_ENV === 'development'
    const actualRecipient = isDev ? 'hasbiberbagi@gmail.com' : recipientEmail

    const { error } = await resend.emails.send({
      from: `DKUI UPI <${EMAIL_FROM}>`,
      to: [actualRecipient],
      subject: `🎉 Proposal Disetujui - Akun Anda Telah Dibuat`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .credentials-box { background: white; padding: 25px; border: 2px solid #10b981; border-radius: 8px; margin: 20px 0; }
              .credential-item { margin: 15px 0; padding: 10px; background: #f0fdf4; border-radius: 5px; }
              .warning-box { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
              .dev-notice { background: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              ${isDev ? `<div class="dev-notice"><strong>🔧 DEV MODE:</strong> Email ini seharusnya dikirim ke <code>${recipientEmail}</code>, tapi testing mode Resend hanya bisa kirim ke hasbiberbagi@gmail.com</div>` : ''}
              <div class="header">
                <h1 style="margin: 0;">🎉 Selamat! Proposal Anda Disetujui</h1>
              </div>
              
              <div class="content">
                <p>Yth. <strong>${name}</strong> dari <strong>${institution}</strong>,</p>
                
                <p>Kami dengan senang hati menginformasikan bahwa proposal kerjasama Anda telah <strong>disetujui</strong> oleh tim evaluasi DKUI dan Fakultas terkait.</p>
                
                <div class="credentials-box">
                  <h3 style="margin: 0 0 15px 0; color: #10b981;">🔐 Kredensial Login Anda</h3>
                  
                  <div class="credential-item">
                    <strong>Username:</strong><br/>
                    <code style="font-size: 16px; color: #059669;">${recipientEmail}</code>
                  </div>
                  
                  <div class="credential-item">
                    <strong>Password Sementara:</strong><br/>
                    <code style="font-size: 16px; color: #059669;">${userPassword}</code>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="${loginUrl}" class="button">Login ke Dashboard</a>
                  </div>
                </div>
                
                <div class="warning-box">
                  <p style="margin: 0;"><strong>⚠️ Penting - Keamanan Akun:</strong></p>
                  <ul style="margin: 10px 0 0 0;">
                    <li>Segera ganti password sementara setelah login pertama</li>
                    <li>Jangan bagikan kredensial ini kepada siapapun</li>
                    <li>Simpan email ini di tempat yang aman</li>
                  </ul>
                </div>
                
                <h3>📊 Langkah Selanjutnya:</h3>
                <ol>
                  <li><strong>Login</strong> ke dashboard menggunakan kredensial di atas</li>
                  <li><strong>Lengkapi profil</strong> dan ganti password Anda</li>
                  <li><strong>Upload dokumen</strong> tambahan yang diperlukan</li>
                  <li><strong>Pantau progress</strong> proposal melalui dashboard tracking</li>
                  <li><strong>Berinteraksi</strong> dengan tim DKUI untuk koordinasi lanjutan</li>
                </ol>
                
                <div style="background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>📋 Proposal Anda:</strong></p>
                  <p style="margin: 5px 0 0 0; font-size: 15px;">${proposalTitle}</p>
                </div>
                
                <p>Untuk bantuan teknis atau pertanyaan terkait kerjasama, silakan hubungi:</p>
                <p style="margin: 5px 0;">
                  📧 Email: dkui@upi.edu<br/>
                  📞 Telepon: (022) 2013163<br/>
                  🏢 Kantor: Gedung DKUI UPI, Jl. Dr. Setiabudhi No. 229 Bandung
                </p>
                
                <p style="margin-top: 30px;">Kami menantikan kerjasama yang produktif dengan Anda!</p>
                
                <p>Salam,<br/><strong>Tim DKUI UPI</strong></p>
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
      console.error("Error sending credentials email:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in send-credentials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
