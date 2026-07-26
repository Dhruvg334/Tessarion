'use client';

import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

export function InfoDialog({ trigger, title, description, children }: {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <AnimatePresence>
        <Dialog.Portal>
          <Dialog.Overlay className="info-dialog-overlay" />
          <LazyMotion features={domAnimation} strict>
            <Dialog.Content asChild>
              <m.section
                className="info-dialog-content"
                initial={reduced ? false : { opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                <div className="info-dialog-heading">
                  <div>
                    <Dialog.Title>{title}</Dialog.Title>
                    {description ? <Dialog.Description>{description}</Dialog.Description> : null}
                  </div>
                  <Dialog.Close aria-label="Close" className="icon-button"><X size={17} /></Dialog.Close>
                </div>
                <div className="info-dialog-body">{children}</div>
              </m.section>
            </Dialog.Content>
          </LazyMotion>
        </Dialog.Portal>
      </AnimatePresence>
    </Dialog.Root>
  );
}
