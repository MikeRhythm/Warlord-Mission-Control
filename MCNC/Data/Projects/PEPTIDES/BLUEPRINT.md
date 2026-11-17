# PEPTIDES4AFRICA // OPERATIONAL BLUEPRINT & ARCHITECTURE

## 1. PROJECT OVERVIEW
- Brand: AURA // Peptides For Africa
- Primary Domain: peptides4africa.org (Informational & Research Gateway)
- Architecture Model: Two-Tier Decoupled Infrastructure (Informational + Isolated Commercial Shop)

## 2. INFRASTRUCTURE TIERS
- Tier 1: Informational & Educational Gateway
  - Target Domain: peptides4africa.org
  - Staging Target: Private Cloudflare Pages Sandbox (*.pages.dev)
  - Core Modules: HPLC / LC-MS Batch Certificate Verifier, RUO Regulatory Fence, Research Sequence Catalog
  - Cost: $0 (Free edge static delivery, zero bandwidth fees, automated SSL)

- Tier 2: Commercial Requisition & Checkout Engine
  - Target Subdomain: shop.peptides4africa.org (or independent discreet domain)
  - Operational Mode: Sandbox / Test Mode (Zero real transactions until supplier/stock audit complete)
  - Payment Rails: Multi-currency, Alternative rails, Crypto/USDT, High-risk clearing
  - Decoupling Reason: Preserves .org compliance and protects SEO/indexing from de-platforming.

## 3. ACTIVE STAGING CHECKLIST
[x] Artifact Stage 2: index.html generated with Obsidian/Gold palette, Canvas particles, and CoA verifier.
[x] Monty Context Sync: Blueprint written to disk.
[ ] Private Staging Push: Deploy index.html to Cloudflare Pages staging sandbox.
[ ] Handshake Verification: Verify live staging URL on mobile and desktop.