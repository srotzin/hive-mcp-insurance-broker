# HiveInsuranceBroker

**Broker-only insurance discovery surface for on-chain risk products**

MCP server for the Hive Insurance Broker. Surfaces real coverage listings from licensed third-party underwriters (Nexus Mutual, Sherlock, Risk Harbor, InsurAce) and routes quote requests to the underwriters' own quote endpoints. Hive does NOT underwrite, hold premium, settle claims, or take custody. Real rails. No mock data. Listings sourced from Nexus Mutual public API (api.nexusmutual.io/v2) and DefiLlama protocol summaries.

> Tier B position 4 — broker-only

> **⚠️ Broker-only disclaimer:** Hive is a broker-only directory. Hive does not underwrite, hold premium, settle claims, or take custody. Coverage is provided by third-party licensed protocols. Verify licensing and policy terms with the underwriter before purchase.

---

## What this is

`hive-mcp-insurance-broker` is a Model Context Protocol (MCP) server that exposes the HiveInsuranceBroker platform on the Hive Civilization to any MCP-compatible client (Claude Desktop, Cursor, Manus, etc.). The server proxies to the live production backend at `https://hivemorph.onrender.com`.

- **Protocol:** MCP 2024-11-05 over Streamable-HTTP / JSON-RPC 2.0
- **Transport:** `POST /mcp`
- **Discovery:** `GET /.well-known/mcp.json`
- **Health:** `GET /health` (returns `enabled`, `brand_color`, `disclaimer`)
- **Listings:** Real third-party data — Nexus Mutual public API, Sherlock / Risk Harbor / InsurAce TVL via DefiLlama
- **Brand gold:** Pantone 1245 C / `#C08D23`

## Tools

| Tool | Description |
|---|---|
| `insurance_products` | List all available coverage products across providers (Nexus Mutual, Sherlock, Risk Harbor, InsurAce). Returns provider, type, capacity, and current cost-of-coverage where the upstream exposes it. Real third-party listings — Hive is broker-only and does not underwrite. |
| `insurance_quote` | Route a quote request to one or all underwriters. Hive forwards the request to the underwriter's own quote endpoint and returns the response verbatim. Hive does NOT bind coverage, accept premium, or take custody. |
| `insurance_today` | 24-hour rollup: total listing count + top providers by capacity. Returns request count and quote count for the rolling window. |


## Backend endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/insurance/products` | Full third-party coverage catalog |
| `POST` | `/v1/insurance/quote` | Route quote request to underwriter |
| `GET` | `/v1/insurance/today` | 24h listing count + top providers |


## Real third-party providers

| Provider     | What we surface                                               | Source                                                |
|--------------|---------------------------------------------------------------|-------------------------------------------------------|
| Nexus Mutual | ~183 active cover products, capacity in USD, min/max APR%      | `api.nexusmutual.io/v2/products` + `/v2/capacity`     |
| Sherlock     | Backstop pool capacity (TVL on Ethereum)                       | `api.llama.fi/protocol/sherlock`                      |
| Risk Harbor  | Marketplace capacity across Polygon / Ethereum / Avalanche     | `api.llama.fi/protocol/risk-harbor`                   |
| InsurAce     | Multi-chain product capacity (BSC / ETH / Polygon / Avalanche) | `api.llama.fi/protocol/insurace`                      |

## Run locally

```bash
git clone https://github.com/srotzin/hive-mcp-insurance-broker.git
cd hive-mcp-insurance-broker
npm install
npm start
# server up on http://localhost:3000/mcp
curl http://localhost:3000/health
curl http://localhost:3000/.well-known/mcp.json
```

## Connect from an MCP client

**Claude Desktop / Cursor / Manus** — add to your `mcp.json`:

```json
{
  "mcpServers": {
    "hive_mcp_insurance_broker": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://hive-mcp-insurance-broker.onrender.com/mcp"]
    }
  }
}
```

## What Hive does NOT do

Hive is a **broker-only directory**. We do **not**:

- Underwrite coverage
- Hold or custody premium
- Settle claims
- Auto-bind or auto-buy policies
- Take any role in the underwriter / policyholder relationship

Coverage is provided by third-party licensed protocols. **Verify licensing and policy terms with the underwriter before purchase.**

## Hive Civilization

Part of the [Hive Civilization](https://www.thehiveryiq.com) — sovereign DID, USDC settlement, HAHS legal contracts, agent-to-agent rails.

Categories: finance, insurance, broker, discovery, web3, defi, agent-to-agent.

## License

MIT (c) Steve Rotzin / Hive Civilization
