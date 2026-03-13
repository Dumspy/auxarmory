# @auxarmory/battlenet

Always handle client responses via `success` checks.

Use `const res = await client.wow.SomeEndpoint(...)` and branch on `res.success`.

On success, use `res.data`.
On failure, `res.error` is a typed battlenet client error and `res.normalized` indicates middleware normalization was applied.
