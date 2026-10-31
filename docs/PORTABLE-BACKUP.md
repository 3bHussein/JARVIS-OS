# Portable encrypted personal backups

IMPLEMENTED — personal preview, not an external security certification.

Open **You & privacy → Encrypted backup & restore**. Choose an independent 12–256-character password, repeat it and download the file. Keep the password separately: there is no reset or recovery service. Check that your browser saved the download. Export a backup before replacing an installation or restoring another file.

The file contains the current saved workspace profile, notes and manual check-ins, including session-only records. Unsaved form drafts are excluded. WHOOP data/tokens, imported ProgressXX files, conversations, credentials and preferences are excluded. This operation does not contact an AI provider or another application.

Restoration: choose a JARVIS file (maximum 1 MiB), enter its password and unlock the preview. Review creation date, profile name and record counts. **Confirm replacement…** requires typing `RESTORE`. This replaces all personal data without merging; the current encrypted/session-only storage choice applies. A changed revision invalidates the preview, and existing server optimistic concurrency still prevents overwriting another window's saved changes. Wrong password or authentication failure does not save anything. Successful restoration resets planner, journal and profile drafts. Cancel leaves the current data untouched.

Format v1 uses Web Crypto PBKDF2-HMAC-SHA256 with a fixed 600,000 iterations, random 16-byte salt, AES-256-GCM, random 12-byte IV and format-specific authenticated additional data. Ciphertext includes the GCM authentication tag. Hex encoding and strict bounds simplify validation. Unsupported version/KDF/iteration counts are rejected before derivation; the server-vault format is separate. Validated fields are reconstructed before export and after import. Filenames contain the UTC export date; the encrypted creation timestamp is descriptive, not trusted provenance.

Processing occurs in the browser. Password fields clear after an operation or leaving the profile pane; lock unmounts private UI. Pending exports/decryptions are ignored after navigation. Plaintext byte buffers are cleared where practical, but JavaScript strings, browser memory, OS clipboard/download history and compromised devices are outside this guarantee. Encrypted backup files remain on disk until the owner removes them. Download initiation is not proof of a completed disk write. Large passwords do not compensate for a weak predictable passphrase.

Automated acceptance: BACKUP-01 authenticated multilingual roundtrip/randomization/exclusion/wrong-password/tamper; BACKUP-02 bounds/format/password rejection; BACKUP-03 maximum multilingual capacity; UI-31 download, wrong-password failure, preview, cancelled/confirmed replacement and password cleanup. Synthetic fixtures only. Physical Windows/browser download and independent cryptographic review remain open.
