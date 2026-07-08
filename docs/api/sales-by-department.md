# Sales by Department API

Extracted from `shc-reports-api-full.pdf`, section **"11. Orders Summary"** (PDF pages 47–52).

That section documents three sibling endpoints, all taking just `fromDate`/`toDate`/
`fetchFromDbOnly`:
1. **Payments Received** (`GET /v2/reports/orderSummaryPaymentsReceived`) — per payment-method
   totals (`PaymentMethod`, `FailedAmount`, `RefundedAmount`, `SuccessAmount`, `TotalAmount`). Not
   pulled here — out of scope until a widget needs it.
2. **Successful Sales by Departments** — the target of this doc (below).
3. **Refunded Payments** (`GET /v2/reports/orderSummaryRefundedPayments`) — three period-relative
   refund totals. Not pulled here either.

## Endpoint

```
GET /v2/reports/orderSummarySalesByDepartment
```

## Query Parameters

| Parameter | Type | Required | Description | Example |
|---|---|---|---|---|
| `fromDate` | String | Yes | Start date for the report. | `2-Dec-24` |
| `toDate` | String | Yes | End date for the report. | `2-Dec-24` |
| `fetchFromDbOnly` | Boolean | No | Defaults to `false`. If `true`, fetches data directly from the database. | `false` |

Notably **no `locations`/`department`/`orderType` filters** — unlike Order Statistics, this
endpoint always returns every department in one call; there's nothing to scope down.

## Sample Request

```
GET /v2/reports/orderSummarySalesByDepartment?fromDate=2-Dec-24&toDate=2-Dec-24&fetchFromDbOnly=false
```

## Response Shape

```json
{
  "salesByDepartments": [
    {
      "Department": "FitnessTraining",
      "DepartmentName": "FitnessTrainingg",
      "ClubAmount": null,
      "ClubTaxAmount": null,
      "ClubAmountInclusiveTax": null,
      "StripeAmount": null,
      "StripeTaxAmount": null,
      "StripeAmountInclusiveTax": null,
      "GooglePlayStoreAmount": null,
      "GooglePlayStoreTaxAmount": null,
      "GooglePlayStoreAmountInclusiveTax": null,
      "AppleAppStoreAmount": null,
      "AppleAppStoreTaxAmount": null,
      "AppleAppStoreAmountInclusiveTax": null,
      "TotalAmount": null
    }
  ],
  "salesByDepartmentHeaders": [
    { "Sr": 1, "Header": "DepartmentName", "HeaderTitle": "Department Name" },
    { "Sr": 2, "Header": "stripe", "HeaderTitle": "Stripe" },
    { "Sr": 3, "Header": "Total", "HeaderTitle": "Total" }
  ],
  "memoryUsage": "6957 KB"
}
```

**Doc/sample mismatch, worth knowing** (same pattern as `orders-report.md`): the PDF's own
"Response Fields" table (below) only lists the base `*Amount` fields — it omits every `*TaxAmount`
and `*AmountInclusiveTax` field that's actually present in its own sample response. Per the
Revenue-at-a-glance wiring, **treat live response shapes as source of truth over the PDF**; this
table is what the doc states, not a guarantee of completeness.

| Field | Type | Description |
|---|---|---|
| `Department` | String | Code or identifier for the department. |
| `DepartmentName` | String | Display name of the department. |
| `ClubAmount` | Decimal | Club earnings for the department. |
| `ClubTaxAmount` | Decimal | *(in sample, not in doc's table)* |
| `ClubAmountInclusiveTax` | Decimal | *(in sample, not in doc's table)* |
| `StripeAmount` | Decimal | Stripe earnings for the department. |
| `StripeTaxAmount` | Decimal | *(in sample, not in doc's table)* |
| `StripeAmountInclusiveTax` | Decimal | *(in sample, not in doc's table)* |
| `GooglePlayStoreAmount` | Decimal | Earnings via Google Play Store. |
| `GooglePlayStoreTaxAmount` | Decimal | *(in sample, not in doc's table)* |
| `GooglePlayStoreAmountInclusiveTax` | Decimal | *(in sample, not in doc's table)* |
| `AppleAppStoreAmount` | Decimal | Earnings via Apple App Store. |
| `AppleAppStoreTaxAmount` | Decimal | *(in sample, not in doc's table)* |
| `AppleAppStoreAmountInclusiveTax` | Decimal | *(in sample, not in doc's table)* |
| `TotalAmount` | Decimal | Total earnings for the department. |
| `salesByDepartmentHeaders` | Array | List of headers for department-wise sales (display metadata, not sales data itself). |
| `memoryUsage` | String | Memory usage during API processing (in KB). |

---

## Redesign feasibility

Investigation only — nothing built. For the planned redesign: per-department sub-line broken down
by member / non-member / membership tier, plus payment method moved to a hover detail.

### 1. Member segmentation — does Sales by Department expose it?

**No.** Confirmed by inspection of the full response shape above: the only dimensions are
`Department`/`DepartmentName` and per-processor dollar amounts. There is no member-status,
membership-tier, or any member-related field anywhere in this endpoint. This matches the
expectation in the ask.

### 2. Does the line-item Order Report support it instead?

Checked `GET /v2/reports/orderReport`'s full field list (documented in `orders-report.md`'s sibling
section of the same PDF chapter — "10. Orders Report," API 2). It has `Department` and
`Amount`/`TotalAmount` (both needed for a department aggregation), but **no clean member-vs-
non-member indicator and no membership-tier/plan field**. The complete field list is:

```
TransactionId, ParentTransactionId, UserId, MemberName, Barcode, OrderedBy, AgreementNumber,
Email, OrderType, OrderName, Location, Department, PaymentMethod, Amount, Discount, TaxPercent,
Tax, TotalAmount, StripePayoutFee, StripeFee, ConvenienceFeePercent, ConvenienceFee, ClubAmount,
Refund, RefundStatus, RefundResponse, RefundOrCancelOrFreezeResponse, RefundTime, RefundId,
CanRefund, OrderStatus, OrderDate, OrderTime, ChargeId, BalanceQuantity, PurchasedQuantity,
TrainerFullName, FamilyMembers, GLCode, IsProrated, PurchaseResponse, Response, ResponseText,
CanCancelSubscription, CanFreezeSubscription, IsRecurring, RecurringChargeStatus,
FreezedByFullName, FreezeStartDate, FreezeEndDate, FreezeDateTime,
RecurringChargeCancelDateTime, RecurringFrequency, NextChargeDate, FollowingChargeDate, Notes
```

The closest thing to a member-status signal is `AgreementNumber` ("Agreement number associated
with the order, **if applicable**") — its presence/absence could be used as an unreliable *proxy*
for member vs. non-member, but it's not a purpose-built flag and isn't documented as one. There is
no `MembershipType`/`Tier`/`PlanName`/`MembershipLevel` field on this endpoint at all.

For reference, a `MembershipTypes` field **does** exist elsewhere in the doc — but on the unrelated
**Member Booking Report** (`GET /v2/reports/memberBookingReport`, "Membership type of the booked
member"), a class-attendance report with no `Amount`/sales fields at all, so it can't be joined
into a sales breakdown without a separate correlated call per member. Also saw the literal string
`"Non-member"` appear inside an Appointment Booking Report's `Barcode` field (a comma-separated
text list, not a structured flag) — not a usable data field either.

**No endpoint inspected so far exposes a clean member/non-member or tier field alongside sales
amounts.** A members/agreements report (not yet located in the doc) would likely be needed, joined
by `UserId`/`AgreementNumber` — that's a further investigation, not attempted here.

### 3. Payment methods on hover — which endpoint(s) support it?

**Both, in different ways:**
- **Sales by Department (aggregate, this doc)** already returns a **fixed processor split**
  per department: Club / Stripe / Google Play / Apple App Store amounts (+ tax variants). This is
  effectively "payment method breakdown per department" out of the box, in the one call this widget
  already needs — no extra request required.
- **Order Report (line-item)** has an explicit `PaymentMethod` field per transaction, with the
  full method enum from the Order Statistics query params (`abcfinancial`, `stripe`,
  `apple-app-store`, `cash`, `check`, `clubautomation`, `complimentary`, `credit-card`, `gift-card`,
  `google-play-google`, `jonas`, `manual`, `manual-import`, `none`, `reward-points`) — more granular
  than the aggregate's fixed 4-processor split, but requires fetching and aggregating line items
  client-side instead of one pre-summed call.

## Conclusion

- **Payment-methods-on-hover is buildable from the aggregate Sales by Department report alone** —
  no new endpoint needed. (For the *full* payment-method enum, e.g. cash/gift-card/reward-points
  rather than just the 4 processors, the line-item Order Report would be needed instead — a
  trade-off worth a product decision if the extra methods matter.)
- **Member/non-member/tier segmentation is not supported by either report.** The aggregate report
  has no member fields at all; the line-item Order Report has a department+amount to aggregate on,
  but no reliable member-status or tier field — only the weak `AgreementNumber` proxy. This part of
  the redesign **is not buildable from either endpoint identified so far**; it would need a
  different, not-yet-located report (or a per-member follow-up call), which is out of scope for
  this investigation.
