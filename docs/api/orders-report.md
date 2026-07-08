# Orders Report — Order Statistics API

Extracted from `shc-reports-api-full.pdf`, section **"10. Orders Report"** (PDF pages 39–44).

That section documents two sibling APIs sharing one query-parameter set:
1. **Order Statistics** — aggregate summary. Powers Revenue at a glance (`totalTransactions`,
   `totalAmount`, `clubAmount`, `stripeFeeAmount`, etc.).
2. **Order Report** — line-item endpoint. Powers Sales by department (aggregated client-side from
   individual rows, since the department-level aggregate endpoint was rejected as inaccurate — see
   `docs/api/sales-by-department.md`). Documented in full further below.

Both share the same query parameters (below).

## Endpoint

```
GET /v2/reports/orderStatistics
```

## Query Parameters

| Parameter | Type | Description | Example |
|---|---|---|---|
| `locations` | String | ID of the locations to filter (comma-separated, blank for "All"). | `9` |
| `department` | String | Department name to filter (blank for "All"). | `Cafe` |
| `orderType` | String | Type of the order — one of `class`, `service`, `plan`, `product`, `smoothie`, `workout`, `program`, `inventory` — blank for "All". | `class` |
| `statusType` | String | Status of the order — one of `pending`, `success`, `failed`, `transferred`, `refunded`, `frozen` — blank for "All". | `success` |
| `inventoryId` | String | ID of the inventory item to filter (blank for "All"). | `8243` |
| `paymentMethod` | String | Payment method filter — one of `abcfinancial`, `stripe`, `apple-app-store`, `cash`, `check`, `clubautomation`, `complimentary`, `credit-card`, `gift-card`, `google-play-google`, `jonas`, `manual`, `manual-import`, `none`, `reward-points`, `stripe` — blank for "All". | `stripe` |
| `fromDate` | String | Starting date for the report. Format `DD-MMM-YY`. | `2-Dec-24` |
| `toDate` | String | Ending date for the report. Format `DD-MMM-YY`. | `2-Dec-24` |
| `searchText` | String | Search term to filter by name, email, or other text fields. | `a` |
| `fetchFromDbOnly` | Boolean | Fetch results only from the database. | `false` |
| `skip` | Integer | Number of records to skip for pagination. | `0` |

## Sample Requests

(As given in the PDF — note these use the doc's generic example host
`staging-tcc.smarthealthclubs.com`, **not** our confirmed working host
`staging-cir-wa.smarthealthclubs.com`; only the path/query shape is meaningful here.)

**Example 1 — all filters set to "All":**
```
GET /v2/reports/orderStatistics?locations=&department=&orderType=&statusType=&inventoryId=&paymentMethod=&fromDate=2-Dec-24&toDate=2-Dec-24&searchText=&fetchFromDbOnly=false&skip=0
```

**Example 2 — specific filters applied:**
```
GET /v2/reports/orderStatistics?locations=9&department=Cafe&orderType=class&statusType=success&inventoryId=8243&paymentMethod=stripe&fromDate=2-Dec-24&toDate=2-Dec-24&searchText=&fetchFromDbOnly=false&skip=0
```

## Response Shape

```json
{
  "totalTransactions": 12,
  "amount": 163,
  "taxAmount": 13.01,
  "totalAmount": 176.01,
  "stripeFeeAmount": 23.21,
  "convenienceFeeAmount": 3.96,
  "clubAmount": 148.84,
  "memoryUsage": "6951 KB"
}
```

| Field | Type | Description |
|---|---|---|
| `totalTransactions` | Integer | Total number of transactions in the given date range. |
| `amount` | Decimal | Total base amount of orders. |
| `taxAmount` | Decimal | Total tax amount for the orders. |
| `totalAmount` | Decimal | Total amount including tax and fees. |
| `stripeFeeAmount` | Decimal | Total Stripe fees charged. |
| `convenienceFeeAmount` | Decimal | Total convenience fee charged. |
| `clubAmount` | Decimal | Final club amount after deductions (Stripe and fees). |
| `memoryUsage` | String | Memory usage during the API processing (in KB). |

---

## Order Report (line-item)

## Endpoint

```
GET /v2/reports/orderReport
```

Same query parameters as Order Statistics above, including `skip` for pagination.

## Sample Request

```
GET /v2/reports/orderReport?locations=&department=&orderType=&statusType=success&inventoryId=&paymentMethod=&fromDate=2-Dec-24&toDate=2-Dec-24&searchText=&fetchFromDbOnly=false&skip=0
```

## Response Shape

```json
{
  "orderReports": [
    {
      "TransactionId": 61977,
      "ParentTransactionId": null,
      "UserId": 655156,
      "MemberName": "Vijay Prajapati",
      "Barcode": null,
      "OrderedBy": "Gaurav Kulkarni",
      "AgreementNumber": null,
      "Email": "vijay+yhc@cakesofttech.com",
      "OrderType": "service",
      "OrderName": "2-dec-semi-private",
      "Location": "Deerfield-Hillsboro",
      "Department": "Fitness Training",
      "PaymentMethod": "Stripe",
      "Amount": "",
      "Discount": "",
      "TaxPercent": "0.0000%",
      "Tax": "",
      "TotalAmount": "$0",
      "StripePayoutFee": "",
      "StripeFee": 0,
      "ConvenienceFeePercent": 0,
      "ConvenienceFee": "",
      "ClubAmount": 0,
      "Refund": 0,
      "RefundStatus": null,
      "RefundResponse": "",
      "RefundOrCancelOrFreezeResponse": "",
      "RefundTime": "",
      "RefundId": null,
      "CanRefund": false,
      "OrderStatus": "Success",
      "OrderDate": "Mon, Dec 02, 2024",
      "OrderTime": "5:24 AM",
      "ChargeId": null,
      "BalanceQuantity": 0,
      "PurchasedQuantity": 1,
      "TrainerFullName": "17m1",
      "FamilyMembers": "",
      "GLCode": "",
      "IsProrated": false,
      "PurchaseResponse": null,
      "Response": "Status : Succeeded</br>",
      "ResponseText": "Status : Succeeded</br>",
      "CanCancelSubscription": false,
      "CanFreezeSubscription": false,
      "IsRecurring": false,
      "RecurringChargeStatus": "pending",
      "FreezedByFullName": null,
      "FreezeStartDate": null,
      "FreezeEndDate": null,
      "FreezeDateTime": null,
      "RecurringChargeCancelDateTime": null,
      "RecurringFrequency": null,
      "NextChargeDate": null,
      "FollowingChargeDate": null,
      "Notes": []
    }
  ],
  "skip": 0,
  "nextSkip": 50,
  "nextPage": false,
  "memoryUsage": "7163 KB"
}
```

**Type inconsistency confirmed in live data — treat the doc's stated types loosely.** Several
"Decimal"/money fields come back as JSON numbers in some rows and as `"$"`-prefixed or empty
strings in others (e.g. `"TotalAmount": "$0"` vs. a plain number elsewhere; `"ClubAmount": 0` here
despite the doc calling it a String). **Any client code summing these must parse defensively**
(strip `$`/`,`, coerce to number, default to 0 on anything unparseable) rather than trusting the
declared type.

**Pagination is required.** `skip`/`nextSkip`/`nextPage` at the top level: keep requesting with
`skip = nextSkip` while `nextPage` is `true`; stop when it's `false`. A single page is not the full
result set — this endpoint has been observed returning ~50 rows per page.

**Field name drift confirmed live — the "User*" fields below are wrong.** Fetching a real response
and inspecting actual key names (while diagnosing a real bug: Sales by department's member/
non-member split silently read as 100% non-member because it read `Barcode`, which doesn't exist)
found the live API actually returns `UserBarcode`, `UserAgreementNumber`, `UserFullName`, and
`UserEmail` — not the `Barcode`/`AgreementNumber`/`MemberName`/`Email` names below, which are only
what the PDF states. **Confirmed correct so far: `UserBarcode` only** (that's the one the bug fix
needed and verified). The other three are marked below but not independently re-verified — check a
live response before relying on them.

| Field | Type (per doc) | Description |
|---|---|---|
| `TransactionId` | Integer | Unique identifier for the order transaction. |
| `ParentTransactionId` | Integer | Parent transaction ID for recurring/linked transactions, if any. |
| `UserId` | Integer | Unique identifier of the user associated with the transaction. |
| `MemberName` ⚠️ live key is `UserFullName`, unverified | String | Name of the member who made the order. |
| `Barcode` ⚠️ live key is `UserBarcode`, confirmed | String \| null | Barcode of the product or service ordered. |
| `OrderedBy` | String | Name of the user who placed the order. |
| `AgreementNumber` ⚠️ live key is `UserAgreementNumber`, unverified | String | Agreement number associated with the order, if applicable. |
| `Email` ⚠️ live key is `UserEmail`, unverified | String | Email address of the member who made the order. |
| `OrderType` | String | Type of the order (e.g., class, service, product). |
| `OrderName` | String | Name or description of the order. |
| `Location` | String | Location where the order was placed. |
| `Department` | String | Department associated with the order. |
| `PaymentMethod` | String | Payment method used for the order (e.g., Stripe, Cash). |
| `Amount` | String | Base amount of the order (before discounts and taxes). |
| `Discount` | String | Discount applied to the order. |
| `TaxPercent` | String | Tax percentage applied to the order. |
| `Tax` | String | Tax amount charged. |
| `TotalAmount` | String | Total amount for the order (including taxes and discounts). |
| `StripePayoutFee` | String | Stripe payout fee for the transaction. |
| `StripeFee` | String | Stripe processing fee for the transaction. |
| `ConvenienceFeePercent` | String | Percentage of the convenience fee applied. |
| `ConvenienceFee` | String | Amount of the convenience fee charged. |
| `ClubAmount` | String | Net amount received by the club after deductions. |
| `Refund` | Integer | Amount refunded for the order, if applicable. |
| `RefundStatus` | String | Status of the refund (e.g., completed, pending). |
| `RefundResponse` | String | Detailed response for the refund request. |
| `RefundOrCancelOrFreezeResponse` | String | Response for refund, cancel, or freeze actions. |
| `RefundTime` | String | Timestamp of the refund transaction. |
| `RefundId` | Integer | Unique identifier for the refund transaction. |
| `CanRefund` | Boolean | Indicates whether the transaction is eligible for a refund. |
| `OrderStatus` | String | Status of the order (e.g., Success, Failed). |
| `OrderDate` | String | Date when the order was placed. |
| `OrderTime` | String | Time when the order was placed. |
| `ChargeId` | String | Unique identifier for the charge, if applicable. |
| `BalanceQuantity` | Integer | Remaining balance quantity for the order. |
| `PurchasedQuantity` | Integer | Quantity purchased in the order. |
| `TrainerFullName` | String | Name of the trainer associated with the service ordered, if applicable. |
| `FamilyMembers` | String | Family members associated with the order, if any. |
| `GLCode` | String | General ledger code for the transaction. |
| `IsProrated` | Boolean | Indicates whether the order amount was prorated. |
| `PurchaseResponse` | String | Response message for the purchase request. |
| `Response` | String | Full response of the payment gateway or system for the order. |
| `ResponseText` | String | Response text summarizing the payment or order status. |
| `CanCancelSubscription` | Boolean | Indicates if the subscription order can be canceled. |
| `CanFreezeSubscription` | Boolean | Indicates if the subscription order can be frozen. |
| `IsRecurring` | Boolean | Indicates if the order is a recurring transaction. |
| `RecurringChargeStatus` | String | Status of the recurring charge (e.g., pending, active). |
| `FreezedByFullName` | String | Name of the user who initiated the freeze action, if applicable. |
| `FreezeStartDate` | String | Start date of the freeze period, if applicable. |
| `FreezeEndDate` | String | End date of the freeze period, if applicable. |
| `FreezeDateTime` | String | Timestamp of the freeze action. |
| `RecurringChargeCancelDateTime` | String | Timestamp when the recurring charge was canceled. |
| `RecurringFrequency` | String | Frequency of the recurring charge (e.g., monthly, annually). |
| `NextChargeDate` | String | Next scheduled charge date for recurring transactions. |
| `FollowingChargeDate` | String | Date of the charge following the next one in recurring orders. |
| `Notes` | Array | Additional notes or metadata associated with the order. |
| `skip` | Integer | The current number of records skipped (top-level, not per-row). |
| `nextSkip` | Integer | The number of records to skip for the next page (top-level). |
| `nextPage` | Boolean | Whether there is a next page of results (top-level). |
| `memoryUsage` | String | Memory usage during API processing (in KB, top-level). |
