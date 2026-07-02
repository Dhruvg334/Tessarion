import { inngest } from '../client';
export const processSourceDocument = inngest.createFunction(
  { id: 'process-source-document', triggers: [{ event: 'tessarion/document.uploaded' }] },
  async () => { return { success: true }; }
);
