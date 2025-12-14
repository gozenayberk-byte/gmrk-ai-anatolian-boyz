
import { SubscriptionPlan, User, EmailSettings } from "../types";

export const invoiceService = {
  /**
   * Generates a professional HTML invoice string.
   */
  generateInvoiceHTML: (user: User, plan: SubscriptionPlan, invoiceId: string, date: string): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Fatura - ${invoiceId}</title>
        <style>
          body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; text-align: center; color: #777; }
          body h1 { font-weight: 300; margin-bottom: 0px; padding-bottom: 0px; color: #000; }
          body h3 { font-weight: 300; margin-top: 10px; margin-bottom: 20px; font-style: italic; color: #555; }
          body a { color: #06f; }
          .invoice-box {
            max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #555; text-align: left;
          }
          .invoice-box table { width: 100%; line-height: inherit; text-align: left; }
          .invoice-box table td { padding: 5px; vertical-align: top; }
          .invoice-box table tr td:nth-child(2) { text-align: right; }
          .invoice-box table tr.top table td { padding-bottom: 20px; }
          .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
          .invoice-box table tr.information table td { padding-bottom: 40px; }
          .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
          .invoice-box table tr.details td { padding-bottom: 20px; }
          .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
          .invoice-box table tr.item.last td { border-bottom: none; }
          .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table cellpadding="0" cellspacing="0">
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td class="title">
                      GümrükAI
                    </td>
                    <td>
                      Fatura No: #${invoiceId}<br>
                      Oluşturma: ${date}<br>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      GümrükAI Teknoloji A.Ş.<br>
                      Levent, Büyükdere Cd. No:123<br>
                      İstanbul, Türkiye
                    </td>
                    <td>
                      Sayın ${user.name}<br>
                      ${user.email}<br>
                      ${user.title}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="heading">
              <td>Ödeme Yöntemi</td>
              <td>Tutar</td>
            </tr>
            <tr class="details">
              <td>Kredi Kartı (Iyzico Güvenli Ödeme)</td>
              <td>${plan.price}</td>
            </tr>
            <tr class="heading">
              <td>Hizmet Detayı</td>
              <td>Fiyat</td>
            </tr>
            <tr class="item">
              <td>${plan.name} Aboneliği (1 Aylık)</td>
              <td>${plan.price}</td>
            </tr>
            <tr class="item last">
              <td>KDV (%20 Dahil)</td>
              <td>-</td>
            </tr>
            <tr class="total">
              <td></td>
              <td>Toplam: ${plan.price}</td>
            </tr>
          </table>
          <br/>
          <p style="font-size:12px; text-align:center;">Bu fatura elektronik ortamda düzenlenmiştir.</p>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Simulates sending an email with the invoice and dynamic content.
   */
  sendInvoiceEmail: async (
    user: User, 
    plan: SubscriptionPlan, 
    invoiceId: string, 
    date: string, 
    emailSettings: EmailSettings
  ): Promise<boolean> => {
    
    // Replace placeholders with real data
    const replaceVariables = (template: string) => {
        return template
            .replace(/{ad_soyad}/g, user.name)
            .replace(/{email}/g, user.email)
            .replace(/{paket_adi}/g, plan.name)
            .replace(/{fiyat}/g, plan.price)
            .replace(/{tarih}/g, date)
            .replace(/{fatura_no}/g, invoiceId);
    };

    const finalSubject = replaceVariables(emailSettings.subject);
    const finalBody = replaceVariables(emailSettings.body);

    // Backend simülasyonu
    console.log(`[InvoiceService] Sending email...`);
    console.log(`FROM: ${emailSettings.senderName}`);
    console.log(`TO: ${user.email}`);
    console.log(`SUBJECT: ${finalSubject}`);
    console.log(`BODY:\n${finalBody}`);
    
    // Gerçekte burada bir SMTP servisi çağrılır.
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`[InvoiceService] Email sent successfully.`);
            resolve(true);
        }, 1500);
    });
  }
};