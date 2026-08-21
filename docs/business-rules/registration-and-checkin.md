# Registration & Check-in Desk Business Rules

## 1. Athlete Registration Module
- **Purpose**: Receptionist or Admin registers a new member with their personal profile, webcam photo, membership tier, duration, and manual payment confirmation.
- **Audit Tagging**:
  - `registeredByStaffId`: User ID of the logged-in staff member.
  - `registeredByStaffName`: Full name of the staff member.
  - `registeredAt`: Exact timestamp of registration.

- **Profile Picture**:
  - Live webcam preview with snapshot capture or file upload.
  - Automatically downscaled/compressed into lightweight image data for database storage.
  - Accessible across modules (specifically Check-in Desk) for visual verification before locker key handover.

- **Membership Tiers & Duration**:
  - Dynamically configured plans (Over 18, Youth, Classes, VIP Elite).
  - Duration (1 to 12 months) automatically computes expiration date and total fee.

- **Manual Payment Recording (Offline Reception Desk)**:
  - **Payment Status**: `PAID` ("Payment Received") or `PENDING` ("Payment Pending").
  - **Payment Method**: `CARD` (POS Terminal), `CASH` (Front desk cash drawer), `BANK_TRANSFER` (Direct wire transfer / QR).

## 2. 3-Day Pending Payment Grace Period Rule
- If `paymentStatus` is `PENDING`:
  - **Days 1–3**: Member is granted grace access with a prominent yellow pending payment badge.
  - **Day 4+ (> 3 Days)**: **Gym entry is strictly DENIED**. Staff is blocked from issuing a locker key until payment is confirmed.
- **Resolving Payment at Check-in Desk**:
  - Staff can locate the member at the Front Desk terminal.
  - Staff clicks **"Confirm Payment Received"**, selects the payment method (`Card`, `Cash`, `Transfer`), and sets status to `PAID`.
  - The original `registeredAt` timestamp remains unchanged.

## 3. Check-in Desk & Locker Matrix
- **Visual Identity Verification**: Receptionist scans/searches athlete. The athlete's captured profile photo is displayed.
- **Interactive Locker Matrix (Lockers 1–80)**:
  - Visual grid with color codes: `Available` (Green), `Occupied` (Blue/Indigo), `Maintenance` (Gray).
  - Assigning a locker key checks in the member and reserves that locker.
- **Real-Time Occupancy**:
  - Check-in increments live occupancy counter across the application (Dashboard, Header).
  - Checkout frees the locker key, decrements occupancy, and calculates total session duration for the Analytics traffic graphs.
