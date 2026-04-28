#!/usr/bin/env node
/**
 * HiveInsuranceBroker MCP Server
 * Broker-only insurance discovery surface for on-chain risk products
 *
 * Backend: https://hivemorph.onrender.com
 * Spec   : MCP 2024-11-05 / Streamable-HTTP / JSON-RPC 2.0
 * Brand  : Hive Civilization gold #C08D23 (Pantone 1245 C)
 *
 * BROKER-ONLY DISCLAIMER:
 *   Hive is a broker-only directory. Hive does not underwrite, hold premium, settle claims, or take custody. Coverage is provided by third-party licensed protocols. Verify licensing and policy terms with the underwriter before purchase.
 */

import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HIVE_BASE = process.env.HIVE_BASE || 'https://hivemorph.onrender.com';
const BRAND_GOLD = '#C08D23';
const DISCLAIMER = 'Hive is a broker-only directory. Hive does not underwrite, hold premium, settle claims, or take custody. Coverage is provided by third-party licensed protocols. Verify licensing and policy terms with the underwriter before purchase.';

// ─── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
{
  name: 'insurance_products',
  description: 'List all available coverage products across providers (Nexus Mutual, Sherlock, Risk Harbor, InsurAce). Returns provider, type, capacity, and current cost-of-coverage where the upstream exposes it. Real third-party listings — Hive is broker-only and does not underwrite.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
},{
  name: 'insurance_quote',
  description: 'Route a quote request to one or all underwriters. Hive forwards the request to the underwriter\'s own quote endpoint and returns the response verbatim. Hive does NOT bind coverage, accept premium, or take custody.',
  inputSchema: {
    type: 'object',
    required: ["protocol", "cover_amount_usd", "duration_days"],
    properties: {
      protocol: { type: 'string', description: 'Protocol/product identifier (e.g. \'2\' for Nexus Mutual Aave v2, or the productId from /products)' },
      cover_amount_usd: { type: 'number', description: 'Notional coverage in USD' },
      duration_days: { type: 'number', description: 'Coverage duration in days (1–365)' },
      provider: { type: 'string', description: 'Provider key. If omitted, quote routes to all four providers. One of: nexus_mutual, sherlock, risk_harbor, insurace' }
    },
  },
},{
  name: 'insurance_today',
  description: '24-hour rollup: total listing count + top providers by capacity. Returns request count and quote count for the rolling window.',
  inputSchema: {
    type: 'object',
    properties: {

    },
  },
}
];

// ─── HTTP helpers ────────────────────────────────────────────────────────────
async function hiveGet(path, params = {}) {
  const url = new URL(`${HIVE_BASE}${path.startsWith('/') ? path : '/' + path}`);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
  return res.json();
}
async function hivePost(path, body) {
  const res = await fetch(`${HIVE_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  let data; try { data = await res.json(); } catch { data = { raw: await res.text() }; }
  return { data, status: res.status };
}

// ─── Tool execution ──────────────────────────────────────────────────────────
async function executeTool(name, args) {
  switch (name) {
      case 'insurance_products': {
        const data = await hiveGet('/v1/insurance/products');
        return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      case 'insurance_quote': {
        const { data, status } = await hivePost('/v1/insurance/quote', {
          protocol: args.protocol,
          cover_amount_usd: args.cover_amount_usd,
          duration_days: args.duration_days,
          provider: args.provider
        });
        return { type: 'text', text: JSON.stringify({ status, ...data }, null, 2) };
      }
      case 'insurance_today': {
        const data = await hiveGet('/v1/insurance/today');
        return { type: 'text', text: JSON.stringify(data, null, 2) };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── MCP JSON-RPC handler ────────────────────────────────────────────────────
app.post('/mcp', async (req, res) => {
  const { jsonrpc, id, method, params } = req.body || {};
  if (jsonrpc !== '2.0') return res.json({ jsonrpc:'2.0', id, error: { code:-32600, message:'Invalid JSON-RPC' } });
  try {
    switch (method) {
      case 'initialize':
        return res.json({ jsonrpc:'2.0', id, result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'hive-mcp-insurance-broker', version: '1.0.0', description: 'Broker-only insurance discovery surface for on-chain risk products' },
        } });
      case 'tools/list':
        return res.json({ jsonrpc:'2.0', id, result: { tools: TOOLS } });
      case 'tools/call': {
        const { name, arguments: args } = params || {};
        const out = await executeTool(name, args || {});
        return res.json({ jsonrpc:'2.0', id, result: { content: [out] } });
      }
      case 'ping':
        return res.json({ jsonrpc:'2.0', id, result: {} });
      default:
        return res.json({ jsonrpc:'2.0', id, error: { code:-32601, message:`Method not found: ${method}` } });
    }
  } catch (err) {
    return res.json({ jsonrpc:'2.0', id, error: { code:-32000, message: err.message } });
  }
});

// ─── Discovery + health ──────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  service: 'hive-mcp-insurance-broker',
  version: '1.0.0',
  enabled: true,
  brand_color: BRAND_GOLD,
  backend: HIVE_BASE,
  disclaimer: DISCLAIMER,
}));
app.get('/.well-known/mcp.json', (req, res) => res.json({
  name: 'hive-mcp-insurance-broker',
  endpoint: '/mcp',
  transport: 'streamable-http',
  protocol: '2024-11-05',
  brand_color: BRAND_GOLD,
  disclaimer: DISCLAIMER,
  tools: TOOLS.map(t => ({ name: t.name, description: t.description })),
}));

app.listen(PORT, () => {
  console.log(`HiveInsuranceBroker MCP Server v1.0.0 running on :${PORT}`);
  console.log(`  Backend : ${HIVE_BASE}`);
  console.log(`  Tools   : ${TOOLS.length}`);
  console.log(`  Broker-only — no underwriting, no premium custody, no claims settlement.`);
});
