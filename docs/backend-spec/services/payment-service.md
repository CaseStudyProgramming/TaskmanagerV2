# Payment Service Design

**Version**: 1.0
**Date**: 2026-11-09
**Status**: Future

---

## Overview

This document describes the payment service design for future monetization features. This service is currently not implemented and is planned for post-MVP.

---

## Planned Features

### Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic task management, 50 tasks max |
| **Pro** | $9.99/month | Unlimited tasks, priority support, advanced analytics |
| **Enterprise** | Custom | Team features, SSO, custom integrations |

### Payment Providers

**Planned Integration:**
- Stripe (primary)
- PayPal (secondary)
- Local payment methods (region-specific)

---

## Architecture (Future)

### Service Structure

```
internal/domain/payment/
├── entity.go              # Subscription entity
├── valueobject.go         # Tier, Status value objects
├── repository.go          # Repository interface
└── service.go             # Domain service interface

internal/application/payment/
├── command/
│   ├── create_subscription.go
│   ├── cancel_subscription.go
│   └── update_subscription.go
├── query/
│   ├── get_subscription.go
│   └── list_subscriptions.go
└── dto/

internal/infrastructure/external/
├── stripe_client.go       # Stripe API client
└── paypal_client.go       # PayPal API client
```

### Database Schema (Future)

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    started_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);
```

---

## References

- [Backend Technical Design](./README.md) - Backend architecture overview
- [Stripe Documentation](https://stripe.com/docs) - Payment provider documentation
