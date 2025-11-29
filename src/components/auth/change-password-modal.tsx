'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChangePasswordForm } from './change-password-form';

export function ChangePasswordModal() {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
        onClick={() => setOpen(true)}
      >
        Change Password
      </Button>

      <DialogContent className="max-w-2xl bg-white border-[#e8dcc8]">
        <DialogHeader>
          <DialogTitle className="font-merriweather text-2xl font-bold text-[#2c2415]">
            Change Your Password
          </DialogTitle>
          <DialogDescription className="text-[#6b6250]">
            Update your password to keep your account secure
          </DialogDescription>
        </DialogHeader>

        <ChangePasswordForm onSuccess={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
