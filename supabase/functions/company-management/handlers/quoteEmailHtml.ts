// Enes Doğanay | 23 Mayıs 2026: Teklif talebi e-posta HTML şablonu

export interface QuoteEmailParams {
    safeRequester: string;
    safeKonu: string;
    safeMesaj: string;
    safeFirmaAdi: string;
    panelUrl: string;
}

// Enes Doğanay | 23 Mayıs 2026: HTML şablonu fonksiyon — panelUrl alıcı rolüne göre belirlenir
export const buildQuoteEmailHtml = (
    { safeRequester, safeKonu, safeMesaj, safeFirmaAdi, panelUrl }:
        QuoteEmailParams,
): string =>
    `<!DOCTYPE html>
<html lang="tr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body, table, td, p, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  @media only screen and (max-width:620px) {
    .email-wrap { width:100% !important; padding:20px 8px !important; }
    .email-container { width:100% !important; }
    .section-pad { padding-left:20px !important; padding-right:20px !important; }
    .btn-td { text-align:center !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f0fdf4;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f0fdf4">
  <tr>
    <td class="email-wrap" align="center" style="padding:40px 16px;">
      <table class="email-container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; width:100%;">

        <!-- HEADER -->
        <tr>
          <td bgcolor="#064e3b" style="background-color:#064e3b; background-image:linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%); border-radius:16px 16px 0 0; padding:32px 40px 28px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td valign="middle">
                  <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:20px; font-weight:bold; color:#ffffff;">Tedport</p>
                  <p style="margin:3px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#6ee7b7; text-transform:uppercase; letter-spacing:1px;">Tedarik Portali</p>
                </td>
                <td align="right" valign="middle">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td bgcolor="#065f46" style="background-color:#065f46; border-radius:20px; padding:5px 14px;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:#a7f3d0;">TEKLIF TALEBI</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:26px; font-weight:bold; color:#ffffff; line-height:1.25;">Yeni bir teklif<br>talebi aldınız!</p>
            <p style="margin:10px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#6ee7b7; line-height:1.6;"><strong style="color:#ffffff;">${safeRequester}</strong>, Tedport üzerinden firmanızdan teklif talep etti.</p>
          </td>
        </tr>

        <!-- WHITE BODY -->
        <tr>
          <td bgcolor="#ffffff" style="background-color:#ffffff; border-radius:0 0 16px 16px; padding:0 0 32px 0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">

              <!-- Talep kartı -->
              <tr>
                <td class="section-pad" style="padding:28px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:2px solid #bbf7d0; border-radius:12px;">
                    <tr>
                      <td bgcolor="#f0fdf4" style="background-color:#f0fdf4; border-radius:10px; padding:20px 22px;">
                        <p style="margin:0 0 4px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#059669; text-transform:uppercase; letter-spacing:1.5px;">TEKLIF KONUSU</p>
                        <p style="margin:0 0 16px 0; font-family:Arial,Helvetica,sans-serif; font-size:18px; font-weight:bold; color:#0f172a; line-height:1.35;">${safeKonu}</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td bgcolor="#dcfce7" style="background-color:#dcfce7; border-radius:20px; padding:4px 12px;">
                              <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; color:#15803d;">Yeni Talep</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Talep sahibi -->
              <tr>
                <td class="section-pad" style="padding:14px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0; border-radius:10px;">
                    <tr>
                      <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:9px; padding:14px 18px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="44" valign="middle">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td width="40" height="40" bgcolor="#047857" style="background-color:#047857; border-radius:8px; text-align:center; vertical-align:middle;">
                                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:18px; line-height:40px; text-align:center; color:#ffffff;">&#128100;</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td style="padding-left:12px;" valign="middle">
                              <p style="margin:0 0 2px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; color:#94a3b8; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Teklif Talep Eden</p>
                              <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:16px; font-weight:bold; color:#0f172a;">${safeRequester}</p>
                            </td>
                            <td align="right" valign="middle">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td bgcolor="#f0fdf4" style="background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:20px; padding:4px 12px;">
                                    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#065f46; font-weight:bold;">Tedport Üyesi</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Mesaj önizleme -->
              <tr>
                <td class="section-pad" style="padding:14px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0; border-radius:10px;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0 0 8px 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; color:#94a3b8; text-transform:uppercase; letter-spacing:1px;">MESAJ</p>
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; color:#334155; line-height:1.6; font-style:italic;">&ldquo;${safeMesaj}&rdquo;</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td class="section-pad btn-td" align="center" style="padding:28px 32px 0 32px; text-align:center;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${panelUrl}" style="height:52px;v-text-anchor:middle;width:340px;" arcsize="17%" strokecolor="#047857" fillcolor="#047857">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;">Teklif Talebini Goruntuле</center>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${panelUrl}" style="display:inline-block; background-color:#047857; color:#ffffff; text-decoration:none; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; padding:15px 36px; border-radius:10px; mso-hide:all;">Teklif Talebini Görüntüle &rarr;</a>
                  <!--<![endif]-->
                  <p style="margin:12px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#94a3b8; text-align:center; line-height:1.7;">Ya da bu linki tarayıcınıza kopyalayın:<br><a href="${panelUrl}" style="color:#059669; font-size:11px; word-break:break-all;">${panelUrl}</a></p>
                </td>
              </tr>

              <!-- Adımlar -->
              <tr>
                <td class="section-pad" style="padding:24px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td bgcolor="#f8fafc" style="background-color:#f8fafc; border-radius:10px; padding:18px 20px;">
                        <p style="margin:0 0 12px 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; color:#065f46;">Nasıl yanıt veririm?</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">1.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">Yukarıdaki butona tıklayarak Teklif Talepleri sayfanıza gidin.</p></td>
                          </tr>
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">2.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">Gelen talebi inceleyin; kalemler, dosyalar ve detaylara bakın.</p></td>
                          </tr>
                          <tr>
                            <td width="22" valign="top" style="padding:4px 0;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569;">3.</p></td>
                            <td style="padding:4px 0 4px 6px;"><p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#475569; line-height:1.5;">Sohbet üzerinden mesaj gönderin veya teklifi yanıtlayın.</p></td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="section-pad" style="padding:24px 32px 0 32px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="border-top:1px solid #e2e8f0; padding-top:20px;" colspan="2"></td>
                    </tr>
                    <tr>
                      <td valign="top">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:#94a3b8; line-height:1.7;">Bu e-posta <strong style="color:#64748b;">${safeFirmaAdi}</strong> firması adına<br>Tedport tarafından otomatik olarak gönderilmiştir.<br>Sorularınız için <a href="mailto:info@tedport.com" style="color:#059669; text-decoration:none;">info@tedport.com</a></p>
                      </td>
                      <td align="right" valign="top" style="padding-left:16px; white-space:nowrap;">
                        <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; color:#065f46;">Tedport</p>
                        <p style="margin:2px 0 0 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; color:#94a3b8;">tedport.com</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
