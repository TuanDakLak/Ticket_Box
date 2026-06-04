# TicketBox Web App — Implementation Plan

## Mục tiêu

Implement toàn bộ 9 màn hình UI từ `stitch_ticketbox_full_cycle_ui_system` vào `apps/web-app` sử dụng **Next.js 15 App Router + TypeScript + TailwindCSS**, theo chuẩn kiến trúc phần mềm giúp dễ mở rộng và nâng cấp.

---

## Màn hình cần triển khai

| # | Thư mục thiết kế | Route Next.js | Mô tả |
|---|---|---|---|
| 1 | `ticketbox_explore_events` | `/` | Trang chủ - Khám phá sự kiện |
| 2 | `ticketbox_concert_ticketing_flow` | `/concerts/[id]` | Chi tiết sự kiện |
| 3 | `ticketbox_select_your_seats` | `/concerts/[id]/seats` | Chọn ghế ngồi |
| 4 | `ticketbox_checkout` | `/checkout/[orderId]` | Thanh toán |
| 5 | `ticketbox_processing_payment` | `/checkout/[orderId]/processing` | Đang xử lý |
| 6 | `ticketbox_order_confirmed` | `/orders/[orderId]/confirmed` | Xác nhận đơn hàng |
| 7 | `ticketbox_my_tickets` | `/my-tickets` | Vé của tôi |
| 8 | `ticketbox_user_profile` | `/profile` | Hồ sơ cá nhân |
| 9 | `ticketbox_support` | `/support` | Hỗ trợ |

---

## Cấu trúc thư mục chuẩn (Feature-Based Architecture)

```
apps/web-app/
├── src/
│   ├── app/                          # Next.js App Router (Pages)
│   │   ├── layout.tsx                # Root layout (fonts, global styles)
│   │   ├── page.tsx                  # Trang chủ - Explore Events
│   │   ├── concerts/[id]/
│   │   │   ├── page.tsx              # Concert Detail
│   │   │   └── seats/page.tsx        # Seat Selection
│   │   ├── checkout/[orderId]/
│   │   │   ├── page.tsx              # Checkout
│   │   │   ├── layout.tsx            # Checkout layout (no nav/footer)
│   │   │   └── processing/page.tsx   # Processing Payment
│   │   ├── orders/[orderId]/confirmed/page.tsx
│   │   ├── my-tickets/page.tsx
│   │   ├── profile/page.tsx
│   │   └── support/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # Atomic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── index.ts
│   │   ├── layout/                   # Layout components
│   │   │   ├── TopNavBar.tsx
│   │   │   ├── BottomNavBar.tsx
│   │   │   └── Footer.tsx
│   │   ├── concert/                  # Feature: Concerts
│   │   │   ├── HeroCarousel.tsx
│   │   │   ├── ConcertCard.tsx
│   │   │   ├── ConcertCardFeatured.tsx
│   │   │   └── SellingFastBadge.tsx
│   │   ├── seat/                     # Feature: Seat Selection
│   │   │   ├── VenueMap.tsx
│   │   │   ├── SeatGrid.tsx
│   │   │   ├── SeatLegend.tsx
│   │   │   └── FloatingCheckoutBar.tsx
│   │   ├── checkout/                 # Feature: Checkout
│   │   │   ├── CustomerInfoForm.tsx
│   │   │   ├── PaymentMethodPicker.tsx
│   │   │   ├── OrderSummaryCard.tsx
│   │   │   └── CountdownTimer.tsx
│   │   ├── payment/
│   │   │   └── ProcessingAnimation.tsx
│   │   ├── ticket/
│   │   │   ├── ETicketCard.tsx
│   │   │   └── TicketListItem.tsx
│   │   └── profile/
│   │       ├── ProfileHeader.tsx
│   │       └── ActivityTimeline.tsx
│   │
│   ├── lib/
│   │   ├── utils.ts                  # cn(), format helpers
│   │   ├── constants.ts              # Routes, enums
│   │   └── api/                      # API client (backend-ready)
│   │       ├── client.ts
│   │       ├── concerts.ts
│   │       ├── orders.ts
│   │       └── tickets.ts
│   │
│   ├── types/                        # TypeScript types (khớp Prisma schema)
│   │   ├── concert.ts
│   │   ├── ticket.ts
│   │   ├── order.ts
│   │   └── user.ts
│   │
│   └── styles/globals.css
│
├── tailwind.config.ts                # Sonic Pulse Design Tokens
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Lý do chọn kiến trúc Feature-Based

> [!IMPORTANT]
> Kiến trúc theo **Feature-Sliced Design** — mỗi feature (concert, seat, checkout, ticket) nhóm riêng:
> - **Thêm tính năng mới**: Tạo folder trong `components/` + page trong `app/`, không ảnh hưởng code cũ
> - **Xóa tính năng**: Xóa 1 folder, không lo side-effect
> - **Onboarding**: Dev mới đọc 1 folder hiểu 1 tính năng
> - **Testing**: Unit test dễ dàng theo từng feature

---

## Technology Stack

| Công nghệ | Phiên bản | Lý do |
|---|---|---|
| **Next.js** | 15 (App Router) | SSR/SSG, file-based routing, layout nesting |
| **TypeScript** | 5.x | Type safety, nhất quán với NestJS backend |
| **TailwindCSS** | 3.x | Dùng trong thiết kế gốc, custom Sonic Pulse tokens |
| **clsx + tailwind-merge** | latest | Class merging utility |
| **Google Fonts** | CDN | Montserrat + Inter theo thiết kế |
| **Material Symbols** | CDN | Icon set theo thiết kế |

---

## Execution Phases

### Phase 1 — Init & Design System
- Khởi tạo Next.js App trong `apps/web-app/`
- Cấu hình `tailwind.config.ts` với Sonic Pulse tokens đầy đủ
- Setup `globals.css` với fonts và CSS variables

### Phase 2 — Shared Layout Components
- `TopNavBar`, `BottomNavBar`, `Footer`
- `CheckoutShell` (layout không có nav/footer)

### Phase 3 — Atomic UI Components
- `Button` (variants: primary, secondary, ghost, pill)
- `Badge`, `Card`, `Input`, `Tabs`, `Avatar`

### Phase 4 — Feature Components + Pages
1. **Explore Events** `/` — HeroCarousel, ConcertCard grid
2. **Concert Detail** `/concerts/[id]` — Detail + TicketTierSelector
3. **Seat Selection** `/concerts/[id]/seats` — VenueMap + SeatGrid + FloatingBar
4. **Checkout** `/checkout/[orderId]` — Form + Payment + Summary + Countdown
5. **Processing** — ProcessingAnimation (shimmer + orbit)
6. **Order Confirmed** — ETicketCard + QRCode
7. **My Tickets** — TicketListItem + Tab filter
8. **User Profile** — ProfileHeader + Nav + Activity
9. **Support** — Hero Search + FAQ Bento + Contact Cards

### Phase 5 — API Layer (Backend-Ready)
- `src/lib/api/` với interfaces khớp Prisma schema

---

## Open Questions

> [!IMPORTANT]
> **1. Mock Data vs Live API?** Tôi sẽ dùng static mock data để implement UI, nhưng cấu trúc `src/lib/api/` sẵn sàng swap sang real API. Đồng ý?

> [!NOTE]
> **2. Checkout Layout** — Tạo `app/checkout/layout.tsx` riêng không có Header/Footer theo đúng thiết kế. Confirm?

> [!NOTE]
> **3. Animations** — Implement bằng CSS thuần (không dùng Framer Motion). Đồng ý?

---

## Verification Plan

- `npm run dev` + mở browser verify từng page
- So sánh với HTML gốc trong `stitch_ticketbox_full_cycle_ui_system`
- Kiểm tra responsive Mobile/Desktop cho từng trang
