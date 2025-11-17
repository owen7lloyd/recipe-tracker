'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface Member {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface MembersListProps {
  members: Member[];
  householdId: string;
  createdBy: string | null;
  onMemberRemoved?: () => void;
}

export function MembersList({
  members,
  householdId,
  createdBy,
  onMemberRemoved,
}: MembersListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const isCreator = session?.user?.id === createdBy;

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${userName} from the household?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/households/${householdId}/members/${userId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      toast({
        title: 'Success',
        description: `${userName} has been removed from the household`,
      });

      onMemberRemoved?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveHousehold = async () => {
    if (
      !confirm(
        'Are you sure you want to leave this household? A new household will be created for you.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/households/${householdId}/members/${session?.user?.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to leave household');
      }

      toast({
        title: 'Success',
        description: 'You have left the household',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to leave household',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{member.name}</p>
                {member.id === createdBy && (
                  <Badge variant="secondary">Creator</Badge>
                )}
                {member.id === session?.user?.id && (
                  <Badge variant="outline">You</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>

            {session?.user?.id !== member.id && isCreator && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMember(member.id, member.name)}
              >
                <UserX className="h-4 w-4" />
              </Button>
            )}

            {session?.user?.id === member.id && !isCreator && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveHousehold}
              >
                Leave
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
