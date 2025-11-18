'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Users, Loader2 } from 'lucide-react';

interface JoinHouseholdFormProps {
  code: string;
  autoJoin?: boolean;
}

export function JoinHouseholdForm({
  code,
  autoJoin = true,
}: JoinHouseholdFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleJoin = async () => {
    if (hasAttempted) return; // Prevent duplicate attempts

    setIsLoading(true);
    setHasAttempted(true);

    try {
      const response = await fetch('/api/households/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join household');
      }

      toast({
        title: 'Success',
        description: 'You have successfully joined the household!',
      });

      // Small delay to show the success message
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setHasAttempted(false); // Allow retry on error
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to join household',
        variant: 'destructive',
      });
    }
  };

  // Auto-join when component mounts
  useEffect(() => {
    if (autoJoin && !hasAttempted) {
      handleJoin();
    }
     
  }, [autoJoin]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium">Joining household...</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we add you to the household
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Join Household</CardTitle>
        <CardDescription>
          {autoJoin
            ? 'Processing your invitation...'
            : "You've been invited to join a household. Click below to accept."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-center text-sm text-muted-foreground">
            Invite Code
          </p>
          <p className="text-center font-mono text-2xl font-bold">{code}</p>
        </div>

        {!autoJoin && (
          <div className="space-y-2">
            <Button
              onClick={handleJoin}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Joining...' : 'Join Household'}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          By joining, you will leave your current household and join the new
          one.
        </p>
      </CardContent>
    </Card>
  );
}
