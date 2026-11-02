# Project memory

## Product intent & audience

- App involves Google account sign-in and a "play as guest" mode; likely a consumer-facing web app/game where sign-in is optional but encouraged.
- Goal: reduce friction for returning users by detecting prior sign-in on the same device and prompting them to re-authenticate.

## Brand personality & voice

- Tone is helpful and non-intrusive; prompts framed as a gentle "welcome back" nudge, not a gate.

## Visual design & UX direction

- Uses a dialog/modal for the returning-user sign-in prompt (not a full-page interstitial).
- Two clear options: "Sign in" (primary) and "Continue without signing in" (dismiss/secondary).
- Prompt appears once per session to avoid nagging.
- Modal pattern is the preferred approach for confirmation-style interactions.

## Decisions, constraints & rationale

- Existing auth infra: `useAuth` hook for sign-in state; `native-auth.ts` contains the Google sign-in mechanism.
- App entry point includes a portal page used for sign-in routing/flow.
- Returning-user detection via `localStorage` flag set on successful Google sign-in.
- Prompt triggers when: flag exists in `localStorage` AND user is NOT currently signed in at app open.
- Choosing "Sign in" reuses the existing Google sign-in flow (no new auth code path).
- Choosing "Continue without signing in" dismisses modal and proceeds as guest.
- Prompt suppressed after first show in a session (session-scoped guard prevents repeat prompts).

## Open questions & assumptions

- Assumption: `localStorage` is the correct persistence layer (no server-side device tracking required).
- Assumption: "signed in earlier on this device" is satisfied by a local flag rather than per-device account binding.
- Unverified: whether the app has other sign-in methods beyond Google that should also be tracked.
- Unverified: exact modal component library/styling conventions (build passed but visual details not confirmed).