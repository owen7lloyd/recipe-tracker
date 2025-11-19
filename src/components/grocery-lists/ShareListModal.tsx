'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Share2, Copy, Check, XCircle } from 'lucide-react';

interface ShareListModalProps {
  listId: string;
  listName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareListModal({
  listId,
  listName,
  isOpen,
  onClose,
}: ShareListModalProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/grocery-lists/${listId}/share`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to generate share link');

      const data = await res.json();
      setShareUrl(data.url);
      setExpiresAt(data.expiresAt);

      toast({
        title: 'Share link created',
        description: 'Anyone with this link can view your grocery list.',
      });
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate share link',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Share link copied to clipboard',
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeLink = async () => {
    setIsRevoking(true);
    try {
      const res = await fetch(`/api/grocery-lists/${listId}/share`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to revoke share link');

      setShareUrl(null);
      setExpiresAt(null);

      toast({
        title: 'Share link revoked',
        description: 'The link has been disabled and will no longer work.',
      });
    } catch (error) {
      console.error('Error revoking share link:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke share link',
        variant: 'destructive',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setExpiresAt(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{listName}"
          </DialogTitle>
          <DialogDescription>
            Create a shareable link that anyone can use to view this grocery
            list in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <div className="text-center">
              <p className="mb-4 text-sm text-slate-600">
                No active share link for this list.
              </p>
              <Button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Share Link'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Share Link</label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expiresAt && (
                <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                  <p className="font-medium">Link expires:</p>
                  <p>{new Date(expiresAt).toLocaleDateString()}</p>
                </div>
              )}

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
                <p className="font-medium">⚠️ Read-only access</p>
                <p className="mt-1 text-xs">
                  People with this link can view the list but cannot make
                  changes.
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={handleRevokeLink}
                disabled={isRevoking}
                className="w-full"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {isRevoking ? 'Revoking...' : 'Revoke Link'}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
