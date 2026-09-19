# Daily Report Weather

Purpose: define the manual weather observation contract for future daily reports
Source of truth for: weather fields, missing values, and work-impact semantics
Update when: daily-report weather validation, persistence, or sources change
Last reviewed: 2026-09-19

## Scope and Ownership

`features/daily-reports/types/weather.ts` owns `DailyReportWeather`, validated by
`features/daily-reports/schemas/weather.schema.ts`. This is a planned domain
contract, not an implemented report form or persisted database entity.

A [daily report](./daily-reports.md) contains zero or one weather observation. Its
`weather` field is `DailyReportWeather | null`; null means weather was not recorded,
not clear skies or no work impact. The parent report owns the project, local
report date, authorization, and audit metadata. Do not duplicate those fields in
the embedded observation or introduce a separate weather table before report
persistence is implemented.

## Fields

| Field                 | Contract                                                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `conditions`          | Required nonempty list of distinct codes: `clear`, `partly_cloudy`, `overcast`, `rain`, `thunderstorms`, `snow`, `fog`. Multiple selections describe changes throughout the day. |
| `temperature_celsius` | A finite number or null. One observed temperature, not a daily minimum, maximum, or average. Negative, zero, and fractional values are valid.                                    |
| `wind`                | `calm`, `light`, `moderate`, `strong`, or null when not recorded. Qualitative observation with no implied numerical thresholds.                                                  |
| `work_impact`         | Explicitly selected `no_impact`, `slowed_work`, `partially_stopped`, or `fully_stopped`. No default.                                                                             |
| `notes`               | Optional details represented by null, or trimmed text up to 2,000 characters. Blank text normalizes to null.                                                                     |
| `source`              | Required literal `manual`. API sources are not currently accepted.                                                                                                               |

Nullable fields are present with null in the domain object when unrecorded.
The schema does not parse localized form strings or convert temperature units.
Future forms must perform that conversion before domain validation.

## Product Semantics

- Conditions, temperature, and wind never automatically determine work impact.
  The user records the actual consequence for that day's activities.
- Notes can explain timing, affected work, or a temperature observation, such as
  “Strong afternoon wind stopped roof panel installation; interior work continued.”
- These fields describe observations, not safety clearances or equipment limits.
- Persist stable language-neutral codes. Future UI must localize labels,
  validation feedback, and temperature formatting in Spanish and English.
- The contract and validation are shared by web, iOS, and Android and require no
  device location, platform adapter, network request, or weather subscription.
- Future API-assisted weather must explicitly extend source/provenance handling;
  forecast refreshes must not silently overwrite saved report observations.

## Deferred Implementation

Daily-report UI, database persistence and RLS,
multiple timed observations, humidity, measured precipitation, and
numeric wind speed remain future work. When persistence is implemented, enforce
the weather invariants at the trusted database boundary as well as in the app.
