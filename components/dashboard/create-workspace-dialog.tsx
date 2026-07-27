'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X } from 'lucide-react';

import { CreateWorkspaceForm } from '@/components/workspace/create-workspace-form';

export function CreateWorkspaceDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button type="button" className="btn"><Plus size={16} />Create notebook</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="info-dialog-overlay" />
        <Dialog.Content className="dashboard-create-dialog" aria-describedby="create-notebook-description">
          <div className="dashboard-create-dialog-heading">
            <div>
              <p className="eyebrow">New notebook</p>
              <Dialog.Title>Create a focused learning workspace</Dialog.Title>
              <Dialog.Description id="create-notebook-description">
                Give the notebook a clear subject and an optional study purpose.
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close"><X size={18} /></Dialog.Close>
          </div>
          <CreateWorkspaceForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
