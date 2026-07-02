# Tessarion Storage Plan

## Buckets

**1. source_documents (Private Bucket)**
- This bucket will hold all user-uploaded source materials (PDFs, text files, etc.).
- **Public Access**: Disabled.
- **Path Convention**: [user_id]/[workspace_id]/[document_id]/[original_filename]
- **Security**:
  - Direct public access is disallowed.
  - Access is granted through authenticated server routes verifying RLS and workspace ownership.
  - Future iterations will include file validation (size limits, MIME type verification, malware scanning) before finalizing uploads.
