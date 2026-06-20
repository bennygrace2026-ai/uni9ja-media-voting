import nodemailer from 'nodemailer';

export async function sendVoteReceipt(
  voterEmail: string,
  voterName: string,
  amount: number,
  pricePaid: number,
  contestantName: string,
  txRef: string
) {
  const host = process.env.SMTP_HOST || '';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || '"UNI9JA Media" <no-reply@uni9jamedia.com>';

  const subject = `Vote Confirmation Receipt - ${txRef}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #D60000; text-align: center; margin-top: 0;">UNI9JA MEDIA</h2>
      <h3 style="text-align: center; color: #333;">Vote Confirmation Receipt</h3>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p>Hello <strong>${voterName || 'Valued Supporter'}</strong>,</p>
      <p>Thank you for supporting <strong>${contestantName}</strong> in the ongoing competition! Your vote has been officially verified and successfully cast.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Transaction Reference:</strong></td>
            <td style="padding: 6px 0; text-align: right; font-size: 14px;"><code>${txRef}</code></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Contestant Supported:</strong></td>
            <td style="padding: 6px 0; text-align: right; font-size: 14px;"><strong>${contestantName}</strong></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Number of Votes:</strong></td>
            <td style="padding: 6px 0; text-align: right; font-size: 14px;">${amount}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Amount Paid:</strong></td>
            <td style="padding: 6px 0; text-align: right; font-size: 14px;">NGN ${pricePaid.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #666; font-size: 14px;"><strong>Status:</strong></td>
            <td style="padding: 6px 0; text-align: right; font-size: 14px; color: #2e7d32; font-weight: bold;">Verified / SUCCESS</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 13px; color: #777;">If you have any questions or concerns regarding this receipt, please contact us at support@uni9jamedia.com.</p>
      <p style="font-size: 13px; color: #777; text-align: center; margin-top: 30px; border-top: 1px solid #f1f1f1; padding-top: 20px;">&copy; ${new Date().getFullYear()} UNI9JA MEDIA. All rights reserved.</p>
    </div>
  `;

  const text = `
    UNI9JA MEDIA - Vote Confirmation Receipt
    
    Hello ${voterName || 'Valued Supporter'},
    
    Thank you for supporting ${contestantName} in the ongoing competition! Your vote has been officially verified and successfully cast.
    
    Transaction Details:
    - Transaction Reference: ${txRef}
    - Contestant Supported: ${contestantName}
    - Number of Votes: ${amount}
    - Amount Paid: NGN ${pricePaid.toLocaleString()}
    - Status: Verified / SUCCESS
    
    If you have any questions, please contact support@uni9jamedia.com.
    
    © ${new Date().getFullYear()} UNI9JA MEDIA.
  `;

  console.log(`[EMAIL SYSTEM] Attempting to send vote receipt to ${voterEmail} for tx: ${txRef}`);

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from,
        to: voterEmail,
        subject,
        text,
        html,
      });
      console.log(`[EMAIL SYSTEM] Email successfully sent to ${voterEmail}`);
    } catch (error) {
      console.error(`[EMAIL SYSTEM] Failed to send email via SMTP:`, error);
    }
  } else {
    console.log(`[EMAIL SYSTEM] SMTP NOT fully configured (requires SMTP_HOST, SMTP_USER, SMTP_PASS in env). Logging email payload instead:`);
    console.log(`----------------------------------------`);
    console.log(`TO: ${voterEmail}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY (text):\n${text}`);
    console.log(`----------------------------------------`);
  }
}
