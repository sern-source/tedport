-- Enes Doğanay | 9 Haziran 2026: firma_sertifikalari DELETE RLS politikası
-- Firma yöneticileri kendi firmalarının sertifikalarını silebilir

CREATE POLICY "firma_sertifikalari_manager_delete"
  ON firma_sertifikalari FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM kurumsal_firma_yoneticileri
      WHERE firma_id::text = firma_sertifikalari.firma_id::text
        AND user_id = auth.uid()
    )
  );
