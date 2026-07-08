# Attendance & Fill Trends — Member Booking Report

Extracted from `shc-reports-api-full.pdf`, section **"3. Booking Report"** (PDF pages 9–13).
Feeds the "Attendance & fill trends" widget (Zone 4, People).

## Endpoint

```
GET /v2/reports/memberBookingReport
```

## Description

Retrieves a detailed booking report for members, including event details, attendee status, and
instructor information. Filters can be applied based on location, department, class, instructors,
status, from date, to date and search terms.

## Query Parameters

| Parameter | Type | Description | Example |
|---|---|---|---|
| `locations` | String | Location IDs to filter the report (leave blank for "All"). | `9` |
| `department` | String | Name of the department to filter (leave blank for "All"). | `Cafe` |
| `classId` | String | ID of the class to filter (leave blank for "All"). | `9118` |
| `trainerId` | String | Trainer's ID to filter (leave blank for "All"). | `675271` |
| `status` | String | Booking status to filter — one of `attended`, `no-show`, `booked`, `waiting`, `cancelled`, `late-cancelled`. | `attended` |
| `fromDate` | String | Starting date for the report. Format `DD-MMM-YY`. | `1-Dec-24` |
| `toDate` | String | Ending date for the report. Format `DD-MMM-YY`. | `1-Dec-24` |
| `searchText` | String | Text to search for specific members or bookings. | `saurabh` |
| `fetchFromDbOnly` | Boolean | Indicates whether to fetch results only from the database. | `false` |
| `skip` | Integer | Offset for pagination. | `0` |

## Sample Requests

(As given in the PDF — note these use the doc's generic example host, not our confirmed working
host `staging-cir-wa.smarthealthclubs.com`; only the path/query shape is meaningful here.)

**Example 1 — all filters set to "All":**
```
GET /v2/reports/memberBookingReport?locations=&department=&classId=&trainerId=&status=&fromDate=1-Dec-24&toDate=1-Dec-24&searchText=&fetchFromDbOnly=false&skip=0
```

**Example 2 — specific filters and a search term:**
```
GET /v2/reports/memberBookingReport?locations=9&department=Cafe&classId=9118&trainerId=675271&status=attended&fromDate=1-Dec-24&toDate=1-Dec-24&searchText=saurabh&fetchFromDbOnly=false&skip=0
```

## Response Shape

```json
{
  "totalAttendees": 0,
  "totalCancellations": 0,
  "totalNonAttendee": 3,
  "totalWaitlisted": 0,
  "totalLateCancellation": 0,
  "bookingMembers": [
    {
      "CalendarEventId": 5294589,
      "Date": "Sun, Dec 01, 2024",
      "Time": "4:00 AM",
      "Location": "Deerfield-Hillsboro",
      "Department": "Fitness Training",
      "ClassName": "04 class",
      "MemberName": "saurabhd Mishra",
      "BookedMemberEmail": "saurabh@cakesofttech.com",
      "Barcode": "saurabh123",
      "MembershipTypes": "1mo",
      "Equipment": "",
      "BookedOn": "Thu, Nov 28 11:16 PM",
      "BookedBy": "saurabhd Mishra",
      "BookingStatus": "Confirmed",
      "AttendanceStatus": "No Show",
      "CancelledOn": "",
      "CancelledBy": "",
      "AttendedOn": "",
      "IsAttendanceCancelled": false,
      "AttendanceMarkedBy": "",
      "IsLateCancelled": false,
      "EventStatus": "open",
      "Instructors": [
        {
          "InstructorId": 661548,
          "InstructorName": "Saurabh M"
        }
      ]
    }
  ],
  "skip": 0,
  "nextSkip": 50,
  "nextPage": false,
  "memoryUsage": "7829 KB"
}
```

### Top-level summary fields

| Field | Type | Description |
|---|---|---|
| `totalAttendees` | Integer | Total number of attendees in the bookings. |
| `totalCancellations` | Integer | Total number of cancellations. |
| `totalNonAttendee` | Integer | Total number of members who did not attend. |
| `totalWaitlisted` | Integer | Total number of waitlisted members. |
| `totalLateCancellation` | Integer | Total number of late cancellations. |

### Line-item fields (`bookingMembers[]`)

| Field | Type | Description |
|---|---|---|
| `CalendarEventId` | Integer | Unique identifier for the calendar event. |
| `Date` | String | Date of the booking. |
| `Time` | String | Time of the booking. |
| `Location` | String | Name of the location for the event. |
| `Department` | String | Department associated with the event. |
| `ClassName` | String | Name of the booked class. |
| `MemberName` ⚠️ see Field-name drift below | String | Name of the member who booked. |
| `BookedMemberEmail` | String | Email address of the booked member. |
| `Barcode` ⚠️ see Field-name drift below | String | Member's barcode. |
| `MembershipTypes` | String | Membership type of the booked member. |
| `Equipment` | String | Equipment used (if applicable). |
| `BookedOn` | String | Date and time when the booking was made. |
| `BookedBy` | String | Name of the person who made the booking. |
| `BookingStatus` | String | Status of the booking (e.g., Confirmed, Cancelled, Event Cancelled). |
| `AttendanceStatus` | String | Attendance status of the member (e.g., No Show, Attended, Booked, Waitlisted, Cancelled, Late Cancelled). |
| `CancelledOn` | String | Date and time when the booking was cancelled (if any). |
| `CancelledBy` | String | Name of the person who cancelled the booking. |
| `AttendedOn` | String | Date and time when attendance was marked (if applicable). |
| `IsAttendanceCancelled` | Boolean | Indicates if the attendance was cancelled. |
| `AttendanceMarkedBy` | String | Name of the person who marked the attendance. |
| `IsLateCancelled` | Boolean | Indicates if the booking was cancelled late. |
| `EventStatus` | String | Status of the event (e.g., open, closed). |
| `Instructors` | Array | List of instructors for the event. |
| `skip` | Integer | Offset value for pagination (top-level, not per-row). |
| `nextSkip` | Integer | Next offset value for pagination (top-level). |
| `nextPage` | Boolean | Indicates if another page of results exists (top-level). |
| `memoryUsage` | String | Memory usage for generating the report (in KB, top-level). |

---

## Feasibility

### 1. Totals scope (paged endpoint — full-dataset or current-page?)

The doc does not say explicitly. The five `total*` fields sit at the top level of the response
alongside `bookingMembers`, `skip`, `nextSkip`, and `nextPage` — the same shape pattern as
`orderReport` (see `docs/api/orders-report.md`), where pagination governs `bookingMembers` only.
By analogy with that sibling endpoint and with `attendanceReport` (which has no aggregate totals
at all — see below), the totals here read as computed over the **full filtered dataset**, not just
the returned page — i.e. a single `skip=0` call should give correct totals regardless of how many
pages of `bookingMembers` exist behind it. **This is inferred from the doc's structure, not stated
outright — must verify live** (e.g. compare `totalAttendees` against a manual count of
`AttendanceStatus: "Attended"` rows summed across all pages for the same query, the same kind of
cross-check that caught the `Barcode`/`UserBarcode` drift on Sales by department).

### 2. Fill % (attendance vs. capacity)

`memberBookingReport` has no capacity/spots field of any kind — confirmed by the full field list
above. The sibling **Attendance Report** (`GET /v2/reports/attendanceReport`, PDF section 1, pages
1–5) does expose per-event capacity on each event in its `events[]` array:

| Field | Type | Description |
|---|---|---|
| `TotalSpots` | Integer | Total spots available for the event. |
| `BookedSpots` | Integer | Number of booked spots. |
| `UnbookedSpots` | Integer | Number of unbooked spots. |
| `WaitlistedSpots` | Integer | Number of waitlisted spots. |

**Fill % is obtainable, but only from `attendanceReport`, not `memberBookingReport`** — sum
`BookedSpots` / sum `TotalSpots` across the returned events (paginated the same way, `skip`/
`nextSkip`/`nextPage`) to get an aggregate fill rate for a date range. This is a **second,
separate call** from the one used for attendance totals — the widget would need to hit both
endpoints and combine them, not just one. `attendanceReport` itself has no `total*` summary
fields of its own (no doc equivalent of `totalAttendees` etc.) — its only aggregation is
per-event; any rollup has to be computed client-side by summing across `events[]` and across
pages.

### 3. Trend over time (multi-week chart)

Confirmed: **neither endpoint returns a built-in time series.** Both `memberBookingReport` and
`attendanceReport` take a single `fromDate`/`toDate` range and return one flat result (aggregate
totals + a paginated flat list) for that whole range — there is no per-day/per-week bucketing
parameter or response field on either. A multi-week trend chart requires **one call per time
bucket** (e.g. one `fromDate`/`toDate` pair per week, run in parallel or sequence), the same
limitation already documented for `orderStatistics` on Revenue at a glance.

### 4. Field-name drift risk

Confirmed live pattern from Sales by department (`UserBarcode` for `Barcode`, and probably
`UserFullName`/`UserEmail`/`UserAgreementNumber` for `MemberName`/`Email`/`AgreementNumber` on
Order Report). `memberBookingReport`'s line items carry the same-named, same-shaped member
fields and are therefore **at equal risk of the same `User*` rename**:

| Doc field (this endpoint) | Suspected live rename | Confirmed? |
|---|---|---|
| `Barcode` | `UserBarcode` | Confirmed on Order Report only — not yet checked on this endpoint. |
| `MemberName` | `UserFullName` | Unverified on either endpoint. |
| `BookedMemberEmail` | Possibly `UserEmail` or left as-is — this field's doc name (`BookedMemberEmail`) doesn't exactly match Order Report's `Email`, so the rename pattern may not transfer directly. | Unverified. |

None of these are used by the summary totals this widget primarily needs (`totalAttendees`,
`totalNonAttendee`, `totalCancellations`, `totalLateCancellation`, `totalWaitlisted`), so the
drift risk mainly matters if the widget ever drills into `bookingMembers[]` line items (e.g. a
member-level attendance list) rather than just the top-level counts. **Verify against a live
response before reading any of these three fields**, the same way the Sales by department bug was
found and fixed.
