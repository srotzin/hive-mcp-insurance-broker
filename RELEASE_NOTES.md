# hive-mcp-insurance-broker — Release Notes

## v1.0.0 — 2026-04-28

Initial release. **Broker-only** insurance discovery surface for on-chain risk products.

### Tools

- `insurance_products` — list available coverage products across providers
- `insurance_quote`    — route quote requests to provider quote endpoints
- `insurance_today`    — 24h listing count + top providers by capacity

### Real-rails data sources

- **Nexus Mutual** — `api.nexusmutual.io/v2/products` + `/v2/capacity` (~183 cover products)
- **Sherlock**     — `api.llama.fi/protocol/sherlock` (backstop pool TVL)
- **Risk Harbor**  — `api.llama.fi/protocol/risk-harbor` (marketplace TVL)
- **InsurAce**     — `api.llama.fi/protocol/insurace` (multi-chain TVL)

### Brand

Pantone 1245 C / `#C08D23` — baked into every response (`brand_color` field).

### Disclaimer (baked into every response)

> Hive is a broker-only directory. Hive does not underwrite, hold premium, settle claims, or take custody. Coverage is provided by third-party licensed protocols. Verify licensing and policy terms with the underwriter before purchase.

### What this release does NOT do

- ❌ No underwriting
- ❌ No premium custody
- ❌ No claim settlement
- ❌ No auto-bind / auto-buy
- ❌ No fund custody
