'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateHouseholdSchema,
  type UpdateHouseholdInput,
} from '@/lib/validations/household';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MembersList } from './members-list';
import { InviteMemberModal } from './invite-member-modal';

interface Member {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface Household {
  id: string;
  name: string;
  createdBy: string | null;
  members: Member[];
}

interface HouseholdSettingsFormProps {
  household: Household;
}

export function HouseholdSettingsForm({
  household,
}: HouseholdSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateHouseholdInput>({
    resolver: zodResolver(updateHouseholdSchema),
    defaultValues: {
      name: household.name,
    },
  });

  const onSubmit = async (data: UpdateHouseholdInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/households/${household.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update household');
      }

      toast({
        title: 'Success',
        description: 'Household updated successfully',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update household',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Household Information</CardTitle>
          <CardDescription>
            Update your household name and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Household Name</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={isLoading}
                placeholder="Enter household name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Manage household members and invitations
              </CardDescription>
            </div>
            <InviteMemberModal householdId={household.id} />
          </div>
        </CardHeader>
        <CardContent>
          <MembersList
            members={household.members}
            householdId={household.id}
            createdBy={household.createdBy}
            onMemberRemoved={() => router.refresh()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
