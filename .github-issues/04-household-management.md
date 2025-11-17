# Household Management

**Phase:** 1 - Foundation
**Priority:** P0
**Estimate:** 4 days

## Description

Implement household creation, invitation system, member management, and multi-user sharing functionality.

## Tasks

### Household CRUD
- [ ] Create household during registration
- [ ] `GET /api/households/:id` endpoint
- [ ] `PUT /api/households/:id` endpoint (update name, settings)
- [ ] `DELETE /api/households/:id/members/:userId` (remove member)

### Invitation System
- [ ] `POST /api/households/:id/invite` - Generate invite code/link
- [ ] `POST /api/households/join` - Join household with code
- [ ] Generate unique 8-character invite codes
- [ ] Store invites with expiration (7 days)
- [ ] Email invitation support (optional for MVP)

### Member Management
- [ ] List household members
- [ ] Show member roles (creator vs member)
- [ ] Remove members (creator only)
- [ ] Leave household functionality
- [ ] Transfer ownership (optional for MVP)

### Business Logic
- [ ] Validate user can only belong to one household
- [ ] Household creator becomes admin
- [ ] Prevent admin from leaving without transfer
- [ ] Cascade delete household data when household deleted
- [ ] Handle orphaned users (create new household)

### UI Components
- [ ] `HouseholdSettings` page
- [ ] `InviteMemberModal` dialog
- [ ] `MembersList` component
- [ ] `JoinHouseholdForm` page
- [ ] Invite link copy button
- [ ] Member role badges

### Data Access Control
- [ ] Middleware to verify household access
- [ ] Helper function to get user's household_id from session
- [ ] Ensure all queries filter by household_id

## Acceptance Criteria

- [ ] New users automatically get a household
- [ ] Users can invite others via code or link
- [ ] Invite codes work for 7 days then expire
- [ ] Users can join household with valid invite
- [ ] Users see all household members
- [ ] Household creators can remove members
- [ ] Members can leave household
- [ ] User can only be in one household at a time
- [ ] All household data isolated per household
- [ ] Invites can be revoked
- [ ] Clear error messages for invalid invites

## Technical Details

### Database Changes

```sql
CREATE TABLE household_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  code VARCHAR(8) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  used_by UUID REFERENCES users(id),
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invites_code ON household_invites(code);
CREATE INDEX idx_invites_household ON household_invites(household_id);
```

### API Implementation

```typescript
// POST /api/households/:id/invite
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Verify user is in this household
  const user = await db.user.findUnique({
    where: { id: session.user.id }
  })

  if (user.household_id !== params.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // Generate unique code
  const code = generateInviteCode()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const invite = await db.householdInvite.create({
    data: {
      household_id: params.id,
      code,
      created_by: session.user.id,
      expires_at: expiresAt
    }
  })

  return Response.json({
    code,
    link: `${process.env.NEXTAUTH_URL}/join/${code}`,
    expires_at: expiresAt
  })
}
```

### Invite Code Generation

```typescript
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Exclude similar chars
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
```

### Household Access Middleware

```typescript
export async function requireHousehold(session: Session, household_id: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { household_id: true }
  })

  return user?.household_id === household_id
}
```

## Dependencies

- [ ] #02 Database Schema
- [ ] #03 Authentication System
- Households and users tables exist

## Testing

- [ ] Unit tests for invite code generation
- [ ] Test invite creation and validation
- [ ] Test invite expiration
- [ ] Test joining household
- [ ] Test household access control
- [ ] Test user can only be in one household
- [ ] E2E test: Invite → Join → Share data

## Resources

- PRD Section 3.1: User Management (US-1.1)
- Implementation Plan: Section 1.3 Household Management
