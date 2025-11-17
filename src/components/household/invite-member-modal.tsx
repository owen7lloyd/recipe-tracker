'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Copy, Check, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Invite {
  id: string;
  code: string;
  link: string;
  expiresAt: string;
  usedBy: string | null;
  usedAt: string | null;
}

interface InviteMemberModalProps {
  householdId: string;
}

export function InviteMemberModal({ householdId }: InviteMemberModalProps) {
  const [open, setOpen] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const loadInvites = async () => {
    try {
      const response = await fetch(`/api/households/${householdId}/invites`);
      if (!response.ok) throw new Error('Failed to load invites');
      const data = await response.json();
      setInvites(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load invites',
        variant: 'destructive',
      });
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadInvites();
    }
  };

  const generateInvite = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/households/${householdId}/invite`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to generate invite');

      const newInvite = await response.json();
      setInvites([newInvite, ...invites]);

      toast({
        title: 'Success',
        description: 'Invite link generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invite',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: 'Copied',
        description: 'Invite link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const revokeInvite = async (inviteId: string) => {
    try {
      const response = await fetch(
        `/api/households/${householdId}/invites/${inviteId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to revoke invite');

      setInvites(invites.filter((inv) => inv.id !== inviteId));

      toast({
        title: 'Success',
        description: 'Invite revoked successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke invite',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Invite Household Member</DialogTitle>
          <DialogDescription>
            Generate an invite link to add someone to your household. Links
            expire after 7 days.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            onClick={generateInvite}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate New Invite Link'}
          </Button>

          {invites.length > 0 && (
            <div className="space-y-2">
              <Label>Active Invites</Label>
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center gap-2 rounded-lg border p-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {invite.code}
                      </code>
                      {invite.usedBy && (
                        <span className="text-xs text-muted-foreground">
                          (Used)
                        </span>
                      )}
                    </div>
                    <Input value={invite.link} readOnly className="text-xs" />
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(invite.link, invite.id)}
                    >
                      {copied === invite.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {!invite.usedBy && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeInvite(invite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
