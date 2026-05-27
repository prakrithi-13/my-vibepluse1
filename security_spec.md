# Security Spec: VibePulse Zero-Trust Threat Model & Rules Verification

This document specifies the Data Invariants, adversarial "Dirty Dozen" payloads, and unit test suites required to enforce attributes, relationships, type compliance, and state transitions in the VibePulse Firestore environment.

## 1. Core Data Invariants

- **Ownership & Origin Checks**: 
  - A `MusicEvent` cannot be registered (created) unless the caller maps `createdBy == request.auth.uid`.
  - A `Registration` cannot be filed unless `userId == request.auth.uid`.
  - A `UserProfile` can only be updated/created if the document ID matches `request.auth.uid` exactly.
- **Type Compliance and Range Caps**:
  - `maxCapacity` and `currentCapacity` must be strict numbers with `maxCapacity > 0` and `currentCapacity >= 0` and `currentCapacity <= maxCapacity`.
  - `price` must be a positive number.
  - All string lengths must be strictly capped (e.g., names and descriptions) to guard against resource depletion.
- **State Transition Immortals**:
  - `createdAt` and `createdBy` fields can never be updated after creation (marked immutable).
  - Transitioning any event to the completed state requires a timestamp validation, and completed events are locked from further standard user updates.
- **Verified Operations**:
  - All writes request a legitimate signed-in profile where `request.auth.token.email_verified == true` (if user is verified, or standard verified checks).

---

## 2. The "Dirty Dozen" Threat Payloads

The following 12 payloads attempt to compromise our security invariants and must be strictly blocked by the rules system:

### Payload 1: Spurious Broadcaster Elevation (Identity Spoofing)
- **Target**: `create` on `/events/{eventId}` or update creator ID.
- **Attack Vector**: Attacker seeks to create an event with another user’s UID as the `createdBy` field to spoof authorship.
- **Payload**:
```json
{
  "id": "malicious-event-1",
  "name": "Spoofed Set",
  "type": "dj",
  "maxCapacity": 100,
  "currentCapacity": 0,
  "createdBy": "legitimate_user_123", // spoofed creator ID
  "location": "Acoustic Dome",
  "address": "123 Main St",
  "description": "Unregistered sound system",
  "bannerUrl": "https://img.placeholder/vibe.jpg",
  "price": 15,
  "startTime": "2026-06-21T04:00:00Z",
  "endTime": "2026-06-21T06:00:00Z",
  "email": "box@office.com",
  "phone": "555-0101",
  "createdAt": "2026-05-21T04:59:18Z"
}
```

### Payload 2: Ghost Field Injector (Shadow Schema Update / shadow fields)
- **Target**: `update` or `create` on `/events/{eventId}`.
- **Attack Vector**: Injecting arbitrary boolean headers (e.g. `isStaffAllowedFreeEntry`, `isSystemAdminCreated`) to gain unearned privileges.
- **Payload**:
```json
{
  "isStaffAllowedFreeEntry": true, // unauthorized shadow field
  "name": "Hacked Set"
}
```

### Payload 3: Admission Ticket Theft (Relational Spoofing)
- **Target**: `create` on `/registrations/{registrationId}`.
- **Attack Vector**: User A attempts to reserve/register a ticket on behalf of User B by declaring `userId = "user_B"`.
- **Payload**:
```json
{
  "id": "ticket-steal",
  "eventId": "evt-123",
  "userId": "other-victim-user-id", // spoofed target user ID
  "createdAt": "2026-05-21T04:59:18Z"
}
```

### Payload 4: Invalid Capacity Float (Boundary Injection)
- **Target**: `create` on `/events/{eventId}`.
- **Attack Vector**: Creating an event with negative or fractional limits to break logic loops.
- **Payload**:
```json
{
  "id": "broken-capacity",
  "name": "Broken Dj Night",
  "type": "dj",
  "maxCapacity": -50, // invalid negative number
  "currentCapacity": 10
}
```

### Payload 5: Deniability / ID Poisoning
- **Target**: `create` or `update` under `/events/{poisonId}`.
- **Attack Vector**: Initiating operations with a bloated, massive 1MB string or invalid characters to test memory overflow or wallet denial.
- **Payload Doc ID**: `evt-looooong-id-poisooon-string-containing-overflows-x-1000`

### Payload 6: Ticket Price Escalation Bypass
- **Target**: `update` on `/events/{eventId}`.
- **Attack Vector**: Attacker tries to modify `price` and `email` directly instead of matching strict update key whitelist paths.
- **Payload**:
```json
{
  "price": 0.01 // unauthorized key modification
}
```

### Payload 7: Immortal Field Mutability (createdAt)
- **Target**: `update` on `/events/{eventId}`.
- **Attack Vector**: Attempting to alter `createdAt` to simulate historic presence.
- **Payload**:
```json
{
  "createdAt": "2020-01-01T00:00:00Z"
}
```

### Payload 8: Point Inflation (Privilege Escalation)
- **Target**: `update` on `/users/{userId}`.
- **Attack Vector**: User attempts to assign themselves 999,999 loyalty points and Gold tier unearned.
- **Payload**:
```json
{
  "vibePoints": 999999,
  "tier": "Gold"
}
```

### Payload 9: Client email-verification bypass
- **Target**: Any action on `/events/{eventId}`.
- **Attack Vector**: Unverified user whose `request.auth.token.email_verified` is false attempts to host or broadcast.

### Payload 10: Denial-Of-Wallet DB-lookup Flooding (O(N) List Query)
- **Target**: Blanket read/list query without strict restriction on user identity.
- **Attack Vector**: Listing `/registrations` without checking matching `userId` bounds, forcing full O(N) evaluation.

### Payload 11: Future Time-Spoofing (Temporal Integrity Breach)
- **Target**: `create` on `/events/{eventId}`.
- **Attack Vector**: Attacker provides client-spoofed timestamps instead of using `request.time` for `createdAt`.
- **Payload**:
```json
{
  "createdAt": "2050-01-01T00:00:00Z" // client spoofed time
}
```

### Payload 12: Terminal State Overwriting (Completed Locks)
- **Target**: `update` on finished posts/events.
- **Attack Vector**: Overwriting details of a festival that has already concluded.

---

## 3. Test Runner Draft spec

*(The rules must block each of these dirty vectors securely).*
