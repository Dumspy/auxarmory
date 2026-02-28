# Warcraft Logs Auth Linking Plan

## Goals

- Add Warcraft Logs OAuth auth/linking support in API/auth and frontend.
- Support multi-linking by region (US/EU/KR/TW), one account per region.
- Persist tokens in the existing `account` table (no new migration).
- Keep Battle.net code untouched; WCL is additive only.

## OAuth Details

- Authorization URI: `https://www.warcraftlogs.com/oauth/authorize`
- Token URI: `https://www.warcraftlogs.com/oauth/token`
- OAuth flow: Authorization Code
- Scopes: `view-user-profile`
- User identity: GraphQL `currentUser` via `https://www.warcraftlogs.com/api/v2/user`
    - Query: `userData { currentUser { id name avatar battleTag } }`

## Backend/Auth Changes

- File: `packages/auth/src/index.ts`
    - Add WCL provider configs (one per region) using `genericOAuth`.
    - Provider IDs: `warcraftlogs-us`, `warcraftlogs-eu`, `warcraftlogs-kr`, `warcraftlogs-tw`.
    - Use `authorizationUrl` + `tokenUrl` from OAuth details and `scopes: ['view-user-profile']`.
    - Implement `getUserInfo` with a GraphQL POST to `https://www.warcraftlogs.com/api/v2/user`:
        - Request body: `{"query":"{ userData { currentUser { id name avatar battleTag } } }"}`.
        - Headers: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`.
        - Parse response and validate `currentUser.id` and `currentUser.name`.
        - Map to Better Auth user object:
            - `id`: stringified WCL user id.
            - `name`: WCL `name`.
            - `image`: WCL `avatar`.
            - `email`: synthetic (ex: `wcl-${region}-${id}@linked.local`).
            - `emailVerified`: `true`.
            - Include optional fields like `battleTag` and `region` in return payload (same pattern as Battle.net).
    - Ensure WCL providers are only included when the region has both client id and secret configured.
    - Keep Battle.net provider config untouched.

- File: `packages/auth/src/env.ts`
    - Add optional env vars per region:
        - `WARCRAFTLOGS_US_CLIENT_ID`, `WARCRAFTLOGS_US_CLIENT_SECRET`
        - `WARCRAFTLOGS_EU_CLIENT_ID`, `WARCRAFTLOGS_EU_CLIENT_SECRET`
        - `WARCRAFTLOGS_KR_CLIENT_ID`, `WARCRAFTLOGS_KR_CLIENT_SECRET`
        - `WARCRAFTLOGS_TW_CLIENT_ID`, `WARCRAFTLOGS_TW_CLIENT_SECRET`

## Database/Schema

- File: `packages/db/src/schema.ts`
    - Use existing `account` table (no new table).
    - WCL account rows keyed by `providerId` (`warcraftlogs-<region>`) + `accountId` (WCL user id).
    - Persist `accessToken`, `refreshToken`, `scope`, and expiry fields as provided by Better Auth.
    - Enforce one account per region by provider id uniqueness at the app level (UI + provider id).
    - No migrations at this stage (schema-only change if required by code).

## Frontend Changes

- File: `apps/web/src/routes/_auth/account.tsx`
    - Add a Warcraft Logs section alongside Battle.net in Account settings.
    - Add WCL region list and provider type definitions (same pattern as Battle.net).
    - Add state for selected region, linking/unlinking loading, and error handling.
    - Link flow via `authClient.linkSocial` with provider ID `warcraftlogs-<region>`.
        - `callbackURL` should be the account page URL (`/account`) like Battle.net.
    - Unlink via `authClient.unlinkAccount` using `providerId` + `accountId`.
    - Listing via `authClient.listAccounts` filtered by `providerId.startsWith('warcraftlogs-')`.
    - Display label: WCL display name + user id; show provider id and account id for clarity.
    - Reuse the loading/empty/error patterns from the Battle.net section.
    - Ensure this remains additive and does not edit Battle.net logic.

## Non-Goals (for now)

- No refresh-token rotation/refresh logic.
- No Battlenet modifications.
- No migrations; schema changes only.

## Testing/Validation

- Manually link/unlink for each region and verify token persistence.
- Validate `currentUser` query returns id/name/avatar/battleTag.
- Confirm one-account-per-region enforced by UI and provider ID uniqueness.
- Check `authClient.listAccounts` includes WCL accounts and UI renders them correctly.
