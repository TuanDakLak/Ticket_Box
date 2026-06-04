# TicketBox Web App — Task Progress

## Phase 1: Init & Design System
- [/] Khởi tạo Next.js 15 App trong `apps/web-app/`
- [ ] Cấu hình `tailwind.config.ts` với Sonic Pulse tokens
- [ ] Setup `globals.css` với fonts và CSS variables
- [ ] Cấu hình `next.config.ts`

## Phase 2: Shared Layout Components
- [ ] `TopNavBar.tsx`
- [ ] `BottomNavBar.tsx`
- [ ] `Footer.tsx`
- [ ] Root `layout.tsx`

## Phase 3: Atomic UI Components
- [ ] `Button.tsx`
- [ ] `Badge.tsx`
- [ ] `Card.tsx`
- [ ] `Input.tsx`
- [ ] `Tabs.tsx`
- [ ] `Avatar.tsx`

## Phase 4: Feature Components + Pages

### 4.1 Explore Events (/)
- [ ] `HeroCarousel.tsx`
- [ ] `ConcertCard.tsx`
- [ ] `ConcertCardFeatured.tsx`
- [ ] `SellingFastBadge.tsx`
- [ ] `app/page.tsx`

### 4.2 Concert Detail (/concerts/[id])
- [ ] `TicketTierCard.tsx`
- [ ] `app/concerts/[id]/page.tsx`

### 4.3 Seat Selection (/concerts/[id]/seats)
- [ ] `VenueMap.tsx`
- [ ] `SeatGrid.tsx`
- [ ] `SeatLegend.tsx`
- [ ] `FloatingCheckoutBar.tsx`
- [ ] `app/concerts/[id]/seats/page.tsx`

### 4.4 Checkout (/checkout/[orderId])
- [ ] Checkout `layout.tsx` (no nav/footer)
- [ ] `CustomerInfoForm.tsx`
- [ ] `PaymentMethodPicker.tsx`
- [ ] `OrderSummaryCard.tsx`
- [ ] `CountdownTimer.tsx`
- [ ] `app/checkout/[orderId]/page.tsx`

### 4.5 Processing Payment
- [ ] `ProcessingAnimation.tsx`
- [ ] `app/checkout/[orderId]/processing/page.tsx`

### 4.6 Order Confirmed
- [ ] `ETicketCard.tsx`
- [ ] `app/orders/[orderId]/confirmed/page.tsx`

### 4.7 My Tickets
- [ ] `TicketListItem.tsx`
- [ ] `app/my-tickets/page.tsx`

### 4.8 User Profile
- [ ] `ProfileHeader.tsx`
- [ ] `ProfileNav.tsx`
- [ ] `ActivityTimeline.tsx`
- [ ] `app/profile/page.tsx`

### 4.9 Support
- [ ] `app/support/page.tsx`

## Phase 5: Types & API Layer
- [ ] `types/concert.ts`, `types/ticket.ts`, `types/order.ts`, `types/user.ts`
- [ ] `lib/api/client.ts`, `lib/api/concerts.ts`, `lib/api/orders.ts`
- [ ] `lib/utils.ts`, `lib/constants.ts`

## Phase 6: Verification
- [ ] Chạy `npm run dev` kiểm tra
- [ ] Verify tất cả 9 trang render đúng
- [ ] Kiểm tra responsive Mobile/Desktop
