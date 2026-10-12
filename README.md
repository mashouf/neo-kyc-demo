# Neon Bank — API-driven KYC onboarding

Next.js App Router, TypeScript, TanStack Query, Zustand, React Hook Form, Zod, XState, Tailwind CSS 4, and shadcn/ui.

## Run

Formatting uses a 100-character print width and two-space indentation. ESLint enforces
`max-lines` at 200 lines per file, excluding blank lines and comments, as well as
`max-len` across JavaScript and TypeScript, excluding URLs, strings (including Tailwind class
lists), template literals, and regular expressions. Run `npm run format` to format project
files or `npm run format:check` to check them without edits. Generated files are excluded.

Use Node.js 20.9+ (24 recommended), with the modern runtime first on PATH.

```sh
npm install
npm run dev -- --webpack
```

Open http://localhost:3000. For a production demo, copy `.env.example` to `.env.local` before building/starting. Demo endpoints are disabled in production unless `KYC_DEMO_MODE=true`.

```sh
npm run lint
npm run typecheck
npm run build -- --webpack
npm run start
```

Webpack is a supported fallback for the Windows Turbopack subprocess error observed in this environment.

## Flow

Step forms live in `src/features/kyc/components/forms/`, composed with `StepForm` and shared UI
fields, file previews, and submit buttons. `forms.tsx` only re-exports those components, and
`form-types.ts` defines their shared props. Camera lifecycle is isolated in `use-liveness-camera.ts`.

The `/kyc/layout.tsx` route layout owns the page shell, `KycHeader`, and `KycFooter`. `KycFlow` composes `KycIntro`, `KycProgress`, `KycConnectionStatus`, `KycStepPanel`, and `KycPanelHelp`. `useKycFlow` owns the XState integration and callbacks; `step-config.ts` maps steps to forms and copy, while `KycReceipt` renders completion. Focus handling stays in the step panel, and horizontal step scrolling stays in the progress component.

Theme configuration lives in `src/styles/theme.css` (Tailwind CSS 4 `@theme`), imported by `src/app/globals.css`. Change shared tokens there; components use named utilities such as `bg-surface`, `text-content`, `bg-brand-soft`, and `border-outline`. Gradients, grain, and shadow colors are also centralized in the theme file.

`/` serves the responsive Neon Bank neobank landing page. Its account links open `/kyc`, where the existing session-driven application runs. The Neon Bank logo returns to the landing page. Landing card and balance visuals are illustrative.

Mobile → OTP → personal information → address → account type → ID documents → liveness → eKYC status → review and submit.

- Personal information, address, and account type each have their own form and API write.
- Document upload and camera recording submit without consent checkboxes. Final review requires only information correctness confirmation.
- Liveness submission starts a pending verification. TanStack Query polls `GET /api/ekyc/status` every 2 seconds while pending.
- Approval opens review. Rejection allows document re-upload and another liveness attempt. Manual review stops polling and provides an explicit status-refresh button.
- A status-fetch error shows a retry action; it never advances the workflow.
- The final API accepts the confirmations and uses the account type saved on the server.
- Submission is blocked unless the server has approved eKYC and all required information/materials.
- Repeating final submission returns the same application reference.
- Editing personal information invalidates later verification, preserving prior form values for correction.
- The horizontal mobile stepper becomes a sidebar on desktop. Inputs use container queries, and the panel fills its layout column without manual resizing.

**Demo OTP: `123456`.** No SMS is sent. Digit counts are configurable in `src/features/kyc/contracts.ts`: mobile 11, ID 10, postal code 10, OTP 6. Country validation is omitted and leading zeros are preserved.

## API contract

These request/response shapes are defined by this starter because no backend payload examples were provided. Match them in your backend, or adapt `contracts.ts` and `api.ts` to its actual schema. These local handlers are demo implementations, not an existing live provider connection.

All eight supplied endpoints are used exactly as listed:

| Method | Path                            | Request                                                   |
| ------ | ------------------------------- | --------------------------------------------------------- |
| GET    | `/api/onboarding/session`       | Create/resume the application and select its current step |
| POST   | `/api/onboarding/personal-info` | `{ firstName, familyName, nationalId }`                   |
| POST   | `/api/onboarding/address`       | `{ region, city, address, postalCode }`                   |
| POST   | `/api/onboarding/account-type`  | `{ accountType: "personal" \| "savings" }`                |
| POST   | `/api/ekyc/document`            | Multipart: `front` and `back` files                       |
| POST   | `/api/ekyc/liveness`            | Multipart: `video` file                                   |
| GET    | `/api/ekyc/status`              | Poll the verification result                              |
| POST   | `/api/onboarding/submit`        | `{ confirmed: true }`                                     |

Authentication and session-management helpers are retained because no replacements were supplied:

| Method | Path                  | Request                                                           |
| ------ | --------------------- | ----------------------------------------------------------------- |
| POST   | `/api/kyc/send-otp`   | `{ mobile }`                                                      |
| POST   | `/api/kyc/verify-otp` | `{ code }`                                                        |
| POST   | `/api/kyc/edit`       | `{}` — invalidate later checks and return to personal information |
| POST   | `/api/kyc/restart`    | `{}` — clear applicant data while preserving SMS rate counters    |

Old combined-detail, eKYC-consent, upload, review, account-request, config, and session routes under `/api/kyc` have been removed. The migration starts fresh demo sessions.

### Responses

The client calls `GET /api/onboarding/session` on startup and reload, waits for its response, and routes to the returned step. The spelling `onboarding` follows the supplied URL; POST routes still use `onboarding`. The previous `/api/onboarding/session` remains a demo compatibility endpoint.

Session reads return `{ "step": "address" }` with optional saved session fields. The client also accepts a bare JSON step string or `{ "session": { "step": "address" } }`. Supported values map as follows:

| API step        | Screen                                |
| --------------- | ------------------------------------- |
| `personal_info` | Personal information                  |
| `otp`           | OTP (collect mobile first if missing) |
| `address`       | Address                               |
| `account_type`  | Account type                          |
| `document`      | ID documents                          |
| `liveness`      | Liveness                              |
| `review`        | Review and submit                     |

Unknown or malformed steps show a retry error. Demo verification metadata resumes status polling, and a saved bank request resumes the receipt.

JSON writes return:

```json
{
  "session": {
    "stage": "address",
    "mode": "demo",
    "mobile": "09123456789",
    "personalInfo": {
      "firstName": "Sample",
      "familyName": "Applicant",
      "nationalId": "0012345678"
    }
  },
  "message": "Optional status message"
}
```

Session `stage` is one of `mobile`, `otp`, `personal-info`, `address`, `account-type`, `documents`, `liveness`, `verification`, `review`, `complete`.

Status reads return the same envelope plus a required verification result:

```json
{
  "session": {
    "stage": "verification",
    "mode": "demo",
    "verification": { "status": "pending" }
  },
  "verification": {
    "status": "pending"
  }
}
```

Verification `status` is `pending`, `approved`, `rejected`, or `manual_review`, with an optional `reason`. Approved status returns `session.stage="review"`. Rejected/manual-review status keeps `session.stage="verification"`. After successful final submission, `session.stage="complete"` and `session.bankRequest` contains `{ reference, status: "demo-requested", accountType }`.

Errors are `{ error: string }`. Status codes: 400 malformed body, 401 expired session, 403 invalid origin, 404 unknown endpoint, 405 unsupported method, 409 wrong step/in-progress/conflict, 413 oversized body, 415 unsupported body type, 422 validation, 429 OTP limits, 503 unavailable/disabled demo. Successful client responses are validated with Zod.

### Sessions and upload limits

An HTTP-only, SameSite=Strict `onboarding_demo_session` cookie with `Path=/api` shares the session across onboarding, eKYC, and OTP endpoints. Cookies are Secure in production. Session responses are never HTTP-cached. Sessions expire 30 minutes after creation and are also lost when the server process restarts.

OTP codes expire after 5 minutes; resend cooldown is 30 seconds, with 5 verification attempts per code and 5 sends per session. Front/back ID files accept JPEG, PNG, or PDF, up to 5 MB each. Face videos accept MP4/WebM up to 10 MB. Captured videos stop after 6 seconds. Camera access requires HTTPS or localhost.

The demo checks MIME types and file-header signatures only, and discards uploaded bytes. It does not decode documents/videos or perform authenticity, identity, liveness, or face-recognition checks. Use synthetic sample data only.

## Integration boundaries

- `src/features/kyc/contracts.ts`: centralized paths, request schemas, session/result schemas, digit counts and limits.
- `src/features/kyc/api.ts`: typed HTTP client using the supplied endpoints.
- `src/features/kyc/machine.ts`: XState loading/submitting/error states and explicit step routing from server responses.
- `src/features/kyc/verification.tsx`: TanStack Query polling, bounded network retries, rejected/manual-review displays.
- `src/features/kyc/forms.tsx`: separate React Hook Form/Zod inputs for each write.
- `src/features/kyc/liveness.tsx`: camera-only liveness recording, preview, and cleanup.
- `src/features/kyc/http.ts`: shared routing, cookie scope, request-size limits and per-session write locking.
- `src/features/kyc/server.ts`: demo service and authoritative workflow gates.

Status responses are held briefly in TanStack Query memory with `gcTime: 0` after unmount. They are not persisted to browser storage.

Before live use, replace the demo service/storage with authenticated durable sessions, actual OTP delivery, private document storage and scanning, provider-issued liveness challenges, authoritative identity matching/status, and an idempotent banking integration. Never use the process-local demo store for a multi-instance production application.

## Verification

Run the application on port 3010:

```sh
npm run dev -- --webpack --port 3010
```

In another terminal:

```sh
node tests/kyc-api.mjs
```

Set `KYC_TEST_URL` to use another origin. Tests cover all supplied routes, wrong methods, removed routes, split validation, OTP, uploads, pending verification, final submission gating, editing, session cleanup, and duplicate final requests.

The demo status changes from pending after about 1.5 seconds. Set `KYC_DEMO_EKYC_RESULT=rejected` or `manual_review` on the server to test those outcomes, and set the matching `KYC_TEST_RESULT` when running the suite. Default outcome is approved. These are simulated responses only. The approved, rejected, and manual-review API suites and production webpack build are verified.
The UI uses Persian (fa), RTL layout, and a locally hosted Vazirmatn variable font. Font license: public/fonts/OFL.txt. Numeric inputs accept Persian, Arabic, and Latin digits without country-specific validation.
