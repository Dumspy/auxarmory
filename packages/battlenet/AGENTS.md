# @auxarmory/battlenet

Always unwrap client responses.

Use `const data = unwrap(await client.wow.SomeEndpoint(...))`.

`unwrap` returns `data` on success.
`unwrap` throws `BattlenetZodUnwrapError` for zod failures with `context.request` and `context.response`.
`unwrap` throws `BattlenetUnwrapError` for all other failures with `errorType` and full context.
