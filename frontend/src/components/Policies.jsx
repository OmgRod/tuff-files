import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Policies() {
  return (
    <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldAlert size={32} color="var(--primary)" />
        <h2>Terms of Service & Privacy Policy</h2>
      </div>

      <div style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
        <h3 style={{ color: 'var(--text-main)', marginTop: '2rem', marginBottom: '1rem' }}>1. Acceptable Use Policy</h3>
        <p>
          By using TuffFiles, you agree to not upload, share, or distribute any material that is illegal, unlawful, or violates the rights of any third party. This includes, but is not limited to, copyrighted material distributed without permission, malicious software (malware), and any content that violates local, national, or international laws. We reserve the right to immediately delete any files and ban any accounts found to be in violation of these terms without prior notice.
        </p>

        <h3 style={{ color: 'var(--text-main)', marginTop: '2rem', marginBottom: '1rem' }}>2. Data Liability and Disclaimer</h3>
        <p>
          TuffFiles is provided on an "as-is" and "as-available" basis. While we strive to protect your data, <strong>we are not responsible for any data loss, corruption, or unintentional data leaks</strong>. 
        </p>
        <p style={{ marginTop: '1rem', color: 'var(--error)', fontWeight: 'bold' }}>
          Do NOT upload highly sensitive, personal, or confidential information to this platform. You use this service entirely at your own risk.
        </p>

        <h3 style={{ color: 'var(--text-main)', marginTop: '2rem', marginBottom: '1rem' }}>3. Privacy Policy</h3>
        <p>
          We store minimal information required to operate the service: your username, securely hashed password, and the metadata of the files you upload. We do not sell your data to third parties. If you set a file to "Public" or "Unlisted", you acknowledge that the file can be downloaded by anyone who possesses the link or views the public feed.
        </p>
      </div>
    </div>
  );
}
