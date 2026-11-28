import React, { useState, useEffect } from 'react';
import {
  Rocket, Globe, Lock, Unlock, CreditCard, CheckCircle2, Circle,
  Copy, Check, Plus, Trash2, ShieldCheck, Calculator, Send, Server,
  FileText, AlertTriangle, HelpCircle
} from 'lucide-react';
import SpeakerBtn from './SpeakerBtn';

const STORAGE_KEY = 'MCNC_06_LAUNCH_PAD_V2';

const PAYMENT_PLAYBOOKS = {
  PayPal: {
    title: 'PAYPAL BUSINESS // ACCOUNT & CHECKOUT LINK PROTOCOL',
    settlement: 'Instant to PayPal balance; 1–3 business days to linked bank account',
    typicalFee: '2.9% – 4.4% + fixed currency fee (varies by country & cross-border)',
    requiredDocs: [
      'Government-issued photo ID (Passport or National ID)',
      'Proof of address (utility bill or bank statement dated within 90 days)',
      'Business registration or sole-proprietor tax number (if registering as a company)',
      'Active business email & verified local bank account / Visa card for withdrawals'
    ],
    steps: [
      '1. Go to paypal.com and select Sign Up -> Business Account (do not use Personal for commercial recurring billing).',
      '2. Enter legal entity name (or sole proprietor name), business category, and local currency.',
      '3. Complete KYC identity verification in Account Settings -> Business Information -> Upload ID & proof of address.',
      '4. Link and confirm your bank account or card (PayPal sends two micro-deposits or a 4-digit card code).',
      '5. Open Pay & Get Paid -> Payment Links & Buttons -> Create a Payment Link (set item name, price, and return URL).',
      '6. Copy the generated https://www.paypal.com/ncp/payment/... URL and paste it into the Live Checkout URL field below.'
    ]
  },
  Stripe: {
    title: 'STRIPE // MERCHANT ONBOARDING & PAYMENT LINK PROTOCOL',
    settlement: '2–7 rolling business days to business bank account (country dependent)',
    typicalFee: '2.9% + $0.30 per successful domestic card charge (+1.5% international)',
    requiredDocs: [
      'Registered legal entity (LLC / Pty Ltd / Corp) or supported sole-proprietor registration',
      'Tax Identification Number (EIN / VAT / Tax Ref)',
      'Publicly accessible website URL showing product description, pricing, refund policy, and contact email',
      'Director/Owner ID and business bank account IBAN / Routing + Account number'
    ],
    steps: [
      '1. Register at dashboard.stripe.com/register and activate your account under Settings -> Business Details.',
      '2. Ensure your live domain (e.g., rhythmtradingco.com) displays clear terms, refund policy, and support contact before review.',
      '3. Add your payout bank account under Settings -> Bank Accounts and Scheduling.',
      '4. Go to Product Catalog -> Add Product -> Define recurring or one-time price.',
      '5. Click Create Payment Link on that product, enable customer email/phone collection, and set post-payment redirect URL.',
      '6. Copy the https://buy.stripe.com/... link and paste it into the Live Checkout URL field below.'
    ]
  },
  PayFast: {
    title: 'PAYFAST (SOUTH AFRICA) // MERCHANT & PAY NOW PROTOCOL',
    settlement: '2 business days EFT payout to South African bank account',
    typicalFee: '3.2% + R2.00 (Cards) / 2.0% (Instant EFT)',
    requiredDocs: [
      'South African ID (Individual/Sole Prop) or CIPC Registration Docs (Pty Ltd)',
      'Proof of bank account (stamped bank confirmation letter < 3 months old)',
      'Proof of residential or business address (< 3 months old)',
      'Live website URL with clear product/service details and contact info'
    ],
    steps: [
      '1. Register a Merchant Account at payfast.io and choose Individual or Registered Business.',
      '2. Upload FICA documents (SA ID, proof of address, stamped bank confirmation letter) under Account -> Verification.',
      '3. Wait for FICA compliance approval (usually 24–48 business hours).',
      '4. Navigate to Tools -> Pay Now Buttons (or Subscriptions) and configure item name, ZAR amount, and return/cancel URLs.',
      '5. Copy the generated PayFast payment URL or Merchant ID/Key and paste it into the Live Checkout URL field below.'
    ]
  }
};

const VPS_PLAYBOOK = [
  {
    phase: 'PHASE 01 // PROVISION SERVER',
    items: [
      'Choose provider: Contabo (Cloud VPS Windows/Ubuntu) or Oracle Cloud (ARM A1.Flex Ubuntu 24.04).',
      'Minimum production spec: 4 vCPU, 8 GB RAM, 100+ GB NVMe SSD for smooth Node.js + dashboard runtime.',
      'Record static IPv4 address, root/Administrator password, and datacenter region immediately.'
    ]
  },
  {
    phase: 'PHASE 02 // LOCK FIREWALL & MESH',
    items: [
      'Install Tailscale on your control laptop and the VPS so admin ports (RDP 3389 / SSH 22) stay closed to the public internet.',
      'Block direct public access to internal app ports (8081, 8082, 5173); expose ONLY HTTPS (443) via Cloudflare Tunnel.',
      'Verify Node.js 22 LTS and PM2 / Windows Task Scheduler auto-restart on server reboot.'
    ]
  },
  {
    phase: 'PHASE 03 // ROUTE DOMAIN & SSL',
    items: [
      'Point domain nameservers (e.g., rhythmtradingco.com) to Cloudflare DNS.',
      'Create a Cloudflare Zero Trust Tunnel pointing public hostname -> http://localhost:5173 (or production build port).',
      'Enforce Always Use HTTPS + Full (Strict) SSL mode and verify zero mixed-content warnings.'
    ]
  }
];

const DEFAULT_CFG = {
  liveUrl: 'https://rhythmtradingco.com',
  tunnelConduit: 'Cloudflare Zero Trust Tunnel + Tailscale Mesh',
  goLive: false,
  accessMode: 'MEMBERS_ONLY',
  primaryTier: 'rhythmtradingco AI — Single-Tier Member Access',
  price: 29,
  billing: 'MONTHLY',
  paymentRail: 'PayPal',
  checkoutUrl: 'https://www.paypal.com/ncp/payment/YOUR-LINK',
  feePct: 3.4,
  monthlyStackCost: 15,
  gates: {
    dnsRouted: true,
    sslStrict: true,
    paymentVerified: false,
    smokeTested: false
  },
  offers: [
    {
      id: 'lp-1',
      name: 'Single-Tier Member Portal',
      price: 29,
      billing: 'MONTHLY',
      rail: 'PayPal',
      mode: 'MEMBERS_ONLY',
      url: 'https://rhythmtradingco.com/members'
    },
    {
      id: 'lp-2',
      name: 'Project / Fund Supporter Pass',
      price: 15,
      billing: 'ONE-TIME',
      rail: 'PayFast',
      mode: 'PUBLIC_CHECKOUT',
      url: 'https://rhythmtradingco.com/support'
    }
  ]
};

export default function Tab06LaunchPad({ ws }) {
  const [subTab, setSubTab] = useState('GOLIVE'); // 'GOLIVE' | 'PAYMENTS' | 'VPS' | 'OFFERS' | 'ECONOMICS'
  const [selectedRailGuide, setSelectedRailGuide] = useState('PayPal');
  const [cfg, setCfg] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_CFG, ...JSON.parse(saved) } : DEFAULT_CFG;
    } catch (e) {
      return DEFAULT_CFG;
    }
  });

  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('49');
  const [newBilling, setNewBilling] = useState('MONTHLY');
  const [copiedId, setCopiedKey] = useState(null);
  const [syncLabel, setSyncLabel] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch (e) {}
  }, [cfg]);

  const setVal = (key, val) => setCfg((prev) => ({ ...prev, [key]: val }));
  const toggleGate = (key) =>
    setCfg((prev) => ({ ...prev, gates: { ...prev.gates, [key]: !prev.gates[key] } }));

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const handleAddOffer = (e) => {
    e.preventDefault();
    const clean = newTitle.trim();
    if (!clean) return;
    const item = {
      id: `lp-${Date.now()}`,
      name: clean,
      price: Math.max(0, Number(newPrice) || 0),
      billing: newBilling,
      rail: cfg.paymentRail,
      mode: cfg.accessMode,
      url: cfg.checkoutUrl.trim() || cfg.liveUrl.trim()
    };
    setCfg((prev) => ({ ...prev, offers: [item, ...prev.offers] }));
    setNewTitle('');
  };

  const handleDeleteOffer = (id) => {
    setCfg((prev) => ({ ...prev, offers: prev.offers.filter((o) => o.id !== id) }));
  };

  const handleSyncState = () => {
    const payload = {
      type: 'LAUNCH_PAD_STATE',
      goLive: cfg.goLive,
      liveUrl: cfg.liveUrl,
      accessMode: cfg.accessMode,
      primaryTier: cfg.primaryTier,
      price: Number(cfg.price) || 0,
      billing: cfg.billing,
      paymentRail: cfg.paymentRail,
      checkoutUrl: cfg.checkoutUrl
    };
    window.dispatchEvent(new CustomEvent('mcnc-launchpad-updated', { detail: payload }));
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
    setSyncLabel('SYNCED');
    setTimeout(() => setSyncLabel(''), 1800);
  };

  const priceNum = Math.max(0, Number(cfg.price) || 0);
  const feeNum = Math.max(0, Number(cfg.feePct) || 0);
  const stackNum = Math.max(0, Number(cfg.monthlyStackCost) || 0);
  const netPerSale = priceNum - priceNum * (feeNum / 100);
  const breakEvenSales = netPerSale > 0 ? Math.ceil(stackNum / netPerSale) : 0;
  const netAt25 = netPerSale * 25 - stackNum;

  const gatesPassed = Object.values(cfg.gates).filter(Boolean).length;
  const gatesTotal = Object.keys(cfg.gates).length;
  const activePlaybook = PAYMENT_PLAYBOOKS[selectedRailGuide] || PAYMENT_PLAYBOOKS.PayPal;

  const SUB_TABS = [
    { id: 'GOLIVE', label: '01 // GO-LIVE & TUNNEL', tip: 'Configure live domain, Cloudflare/Tailscale tunnel, and release checkpoints' },
    { id: 'PAYMENTS', label: '02 // PAYMENT RAILS (HOW-TO)', tip: 'Step-by-step KYC & merchant setup for PayPal, Stripe, and PayFast' },
    { id: 'VPS', label: '03 // VPS & INFRASTRUCTURE', tip: 'Clinical server provisioning, firewall lockdown, and HTTPS tunnel steps' },
    { id: 'OFFERS', label: '04 // MEMBER GATE & OFFERS', tip: 'Lock members-only portal access and manage active pricing tiers' },
    { id: 'ECONOMICS', label: '05 // UNIT ECONOMICS', tip: 'Calculate net margin per conversion and exact break-even volume' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: '12px',
        boxSizing: 'border-box',
        gap: '10px',
        backgroundColor: '#080a0e',
        color: '#e2e8f0',
        fontFamily: "'JetBrains Mono', monospace"
      }}
    >
      {/* SCULPTED 3D HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          background: 'linear-gradient(180deg, #161b24 0%, #0c0f15 100%)',
          border: '1px solid #262f40',
          borderRadius: '4px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,248,220,0.14)'
        }}
      >
        <div>
          <div style={{ color: '#DAA520', fontSize: '0.96rem', fontWeight: 'bold', letterSpacing: '1.2px' }}>
            06 LAUNCH-PAD // COMMERCIAL DEPLOYMENT &amp; INFRASTRUCTURE PLAYBOOK
          </div>
          <div style={{ fontSize: '0.68rem', color: '#8fa0b5', marginTop: '2px' }}>
            Clinical step-by-step merchant onboarding, VPS provisioning, access gating, and break-even telemetry
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SpeakerBtn
            text={`06 Launch Pad. Target URL ${cfg.liveUrl}. Status ${cfg.goLive ? 'Live' : 'Staged'}. Payment rail ${cfg.paymentRail} at $${priceNum} ${cfg.billing}. Break-even is ${breakEvenSales} conversions.`}
            label="BRIEF"
          />

          <button
            type="button"
            onClick={handleSyncState}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 11px',
              background: 'linear-gradient(180deg, #1a2230 0%, #0f141d 100%)',
              border: '1px solid #2f3b4f',
              color: '#38bdf8',
              borderRadius: '3px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)'
            }}
          >
            <Send style={{ width: '12px', height: '12px' }} />
            <span>{syncLabel || 'SYNC STATE'}</span>
          </button>

          <button
            type="button"
            onClick={() => setVal('goLive', !cfg.goLive)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: cfg.goLive
                ? 'linear-gradient(180deg, rgba(16,185,129,0.28) 0%, rgba(6,78,59,0.45) 100%)'
                : 'linear-gradient(180deg, rgba(218,165,32,0.26) 0%, rgba(120,83,8,0.35) 100%)',
              border: cfg.goLive ? '1px solid #10b981' : '1px solid #DAA520',
              color: cfg.goLive ? '#34d399' : '#FFE082',
              borderRadius: '3px',
              fontSize: '0.72rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            <Rocket style={{ width: '13px', height: '13px' }} />
            <span>{cfg.goLive ? 'STATUS: LIVE' : 'STATUS: STAGED'}</span>
          </button>

          <div
            style={{
              padding: '6px 10px',
              backgroundColor: '#0c0f15',
              border: '1px solid #232b3a',
              borderRadius: '3px',
              fontSize: '0.7rem'
            }}
          >
            <span style={{ color: '#64748b' }}>GATES: </span>
            <span style={{ color: gatesPassed === gatesTotal ? '#10b981' : '#DAA520', fontWeight: 'bold' }}>
              {gatesPassed}/{gatesTotal}
            </span>
          </div>
        </div>
      </div>

      {/* SCULPTED 3D SUB-TAB BAR WITH GOLDENROD ? BADGES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
          padding: '6px',
          background: 'linear-gradient(180deg, #11151d 0%, #090b10 100%)',
          border: '1px solid #222a38',
          borderRadius: '4px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.75)'
        }}
      >
        {SUB_TABS.map((t) => {
          const active = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              title={t.tip}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                padding: '9px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.71rem',
                fontWeight: 'bold',
                letterSpacing: '0.4px',
                border: active ? '1px solid #DAA520' : '1px solid #1e2533',
                background: active
                  ? 'linear-gradient(180deg, #2b2210 0%, #161107 60%, #0d0a04 100%)'
                  : 'linear-gradient(180deg, #181e29 0%, #0f131b 100%)',
                color: active ? '#FFE082' : '#94a3b8',
                boxShadow: active
                  ? '0 4px 12px rgba(218,165,32,0.28), inset 0 1px 0 rgba(255,224,130,0.35)'
                  : '0 3px 8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: active ? '#DAA520' : 'rgba(218,165,32,0.18)',
                  color: active ? '#080a0c' : '#DAA520',
                  border: '1px solid #DAA520',
                  fontSize: '9px',
                  fontWeight: '900',
                  flexShrink: 0
                }}
              >
                ?
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN SUB-TAB VIEWPORT */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: 'linear-gradient(180deg, #12161f 0%, #0b0e14 100%)',
          border: '1px solid #232b3a',
          borderRadius: '4px',
          padding: '14px',
          overflowY: 'auto',
          boxShadow: '0 10px 26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)'
        }}
        className="custom-scrollbar"
      >
        {/* SUB-TAB 1: GO-LIVE & TUNNEL */}
        {subTab === 'GOLIVE' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', backgroundColor: '#0d1118', border: '1px solid #222b3a', borderRadius: '4px' }}>
              <div style={{ color: '#DAA520', fontSize: '0.78rem', fontWeight: 'bold', borderBottom: '1px solid #1e2634', paddingBottom: '6px' }}>
                LIVE DOMAIN &amp; TUNNEL CONFIGURATION
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PRIMARY PRODUCTION DOMAIN</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={cfg.liveUrl}
                    onChange={(e) => setVal('liveUrl', e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#fff', fontSize: '0.76rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => copyText(cfg.liveUrl, 'domain')}
                    style={{ padding: '0 10px', backgroundColor: '#161c26', border: '1px solid #2f3b4f', borderRadius: '3px', color: '#DAA520', cursor: 'pointer' }}
                  >
                    {copiedId === 'domain' ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>EDGE CONDUIT / TUNNEL LAYER</label>
                <input
                  type="text"
                  value={cfg.tunnelConduit}
                  onChange={(e) => setVal('tunnelConduit', e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#cbd5e1', fontSize: '0.75rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>ACTIVE CHECKOUT / PAYMENT URL</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={cfg.checkoutUrl}
                    onChange={(e) => setVal('checkoutUrl', e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#38bdf8', fontSize: '0.74rem', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => copyText(cfg.checkoutUrl, 'chk')}
                    style={{ padding: '0 10px', backgroundColor: '#161c26', border: '1px solid #2f3b4f', borderRadius: '3px', color: '#DAA520', cursor: 'pointer' }}
                  >
                    {copiedId === 'chk' ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#0d1118', border: '1px solid #222b3a', borderRadius: '4px' }}>
              <div style={{ color: '#DAA520', fontSize: '0.78rem', fontWeight: 'bold', borderBottom: '1px solid #1e2634', paddingBottom: '6px' }}>
                MANDATORY PRE-FLIGHT RELEASE GATES ({gatesPassed}/{gatesTotal})
              </div>

              {[
                { key: 'dnsRouted', label: '1. DNS A/CNAME & Cloudflare Tunnel Routed to Target Port' },
                { key: 'sslStrict', label: '2. HTTPS Full (Strict) Active — Zero Mixed-Content Errors' },
                { key: 'paymentVerified', label: '3. Merchant Account KYC Approved & Checkout Link Tested' },
                { key: 'smokeTested', label: '4. Member Gate & End-to-End Customer Flow Verified' }
              ].map((g) => {
                const ok = Boolean(cfg.gates[g.key]);
                return (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => toggleGate(g.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      backgroundColor: '#0a0d13',
                      border: ok ? '1px solid rgba(16,185,129,0.5)' : '1px solid #1e2634',
                      borderRadius: '3px',
                      color: ok ? '#f8fafc' : '#94a3b8',
                      fontSize: '0.74rem',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    {ok ? <CheckCircle2 style={{ width: '15px', height: '15px', color: '#10b981', flexShrink: 0 }} /> : <Circle style={{ width: '15px', height: '15px', color: '#64748b', flexShrink: 0 }} />}
                    <span>{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-TAB 2: CLINICAL PAYMENT RAILS HOW-TO */}
        {subTab === 'PAYMENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {Object.keys(PAYMENT_PLAYBOOKS).map((rail) => {
                  const isSel = selectedRailGuide === rail;
                  return (
                    <button
                      key={rail}
                      type="button"
                      onClick={() => {
                        setSelectedRailGuide(rail);
                        setVal('paymentRail', rail);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        border: isSel ? '1px solid #DAA520' : '1px solid #263042',
                        background: isSel ? 'linear-gradient(180deg, #F7D154 0%, #DAA520 100%)' : '#10141d',
                        color: isSel ? '#080a0c' : '#cbd5e1',
                        boxShadow: isSel ? '0 4px 12px rgba(218,165,32,0.35)' : 'none'
                      }}
                    >
                      {rail.toUpperCase()} SETUP GUIDE
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  copyText(
                    `${activePlaybook.title}\nSettlement: ${activePlaybook.settlement}\nFees: ${activePlaybook.typicalFee}\n\nRequired Documents:\n${activePlaybook.requiredDocs.map((d) => `- ${d}`).join('\n')}\n\nSteps:\n${activePlaybook.steps.join('\n')}`,
                    'playbook-copy'
                  )
                }
                style={{
                  padding: '7px 12px',
                  backgroundColor: '#161c26',
                  border: '1px solid #DAA520',
                  borderRadius: '3px',
                  color: '#DAA520',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {copiedId === 'playbook-copy' ? 'COPIED CHECKLIST' : 'COPY FULL SOP'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#0d1118', border: '1px solid #222b3a', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ color: '#DAA520', fontSize: '0.76rem', fontWeight: 'bold' }}>
                  REQUIRED KYC &amp; COMPLIANCE DOCUMENTS
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#e2e8f0' }}>Payout Timing:</strong> {activePlaybook.settlement}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#10b981' }}>Typical Fees:</strong> {activePlaybook.typicalFee}
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
                  {activePlaybook.requiredDocs.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#0d1118', border: '1px solid #222b3a', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ color: '#DAA520', fontSize: '0.76rem', fontWeight: 'bold', borderBottom: '1px solid #1e2634', paddingBottom: '6px' }}>
                  {activePlaybook.title}
                </div>
                {activePlaybook.steps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#090c11',
                      border: '1px solid #1c2432',
                      borderRadius: '3px',
                      fontSize: '0.73rem',
                      color: '#e2e8f0',
                      lineHeight: 1.5
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 3: VPS & INFRASTRUCTURE PROVISIONING */}
        {subTab === 'VPS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {VPS_PLAYBOOK.map((block, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  backgroundColor: '#0d1118',
                  border: '1px solid #222b3a',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ color: '#DAA520', fontSize: '0.76rem', fontWeight: 'bold', borderBottom: '1px solid #1e2634', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Server style={{ width: '14px', height: '14px' }} />
                  <span>{block.phase}</span>
                </div>
                {block.items.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#090c11',
                      border: '1px solid #1b2230',
                      borderRadius: '3px',
                      fontSize: '0.72rem',
                      color: '#cbd5e1',
                      lineHeight: 1.5
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* SUB-TAB 4: MEMBER GATE & OFFERS */}
        {subTab === 'OFFERS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setVal('accessMode', 'MEMBERS_ONLY')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '3px',
                  fontSize: '0.74rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: cfg.accessMode === 'MEMBERS_ONLY' ? '1px solid #DAA520' : '1px solid #232b3a',
                  backgroundColor: cfg.accessMode === 'MEMBERS_ONLY' ? 'rgba(218,165,32,0.16)' : '#0d1118',
                  color: cfg.accessMode === 'MEMBERS_ONLY' ? '#FFE082' : '#8fa0b5'
                }}
              >
                <Lock style={{ width: '14px', height: '14px' }} />
                <span>MEMBERS-ONLY PORTAL GATE</span>
              </button>

              <button
                type="button"
                onClick={() => setVal('accessMode', 'PUBLIC_CHECKOUT')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '3px',
                  fontSize: '0.74rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: cfg.accessMode === 'PUBLIC_CHECKOUT' ? '1px solid #10b981' : '1px solid #232b3a',
                  backgroundColor: cfg.accessMode === 'PUBLIC_CHECKOUT' ? 'rgba(16,185,129,0.16)' : '#0d1118',
                  color: cfg.accessMode === 'PUBLIC_CHECKOUT' ? '#34d399' : '#8fa0b5'
                }}
              >
                <Unlock style={{ width: '14px', height: '14px' }} />
                <span>OPEN PUBLIC ACCESS + CHECKOUT</span>
              </button>
            </div>

            <form onSubmit={handleAddOffer} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 130px 95px', gap: '8px' }}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Offer or membership tier name..."
                style={{ padding: '8px 10px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#fff', fontSize: '0.74rem', outline: 'none' }}
              />
              <input
                type="number"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                style={{ padding: '8px 10px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#10b981', fontWeight: 'bold', fontSize: '0.74rem', outline: 'none' }}
              />
              <select
                value={newBilling}
                onChange={(e) => setNewBilling(e.target.value)}
                style={{ padding: '8px 8px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#e2e8f0', fontSize: '0.72rem', outline: 'none' }}
              >
                <option value="MONTHLY">MONTHLY</option>
                <option value="ONE-TIME">ONE-TIME</option>
                <option value="ANNUAL">ANNUAL</option>
              </select>
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  background: 'linear-gradient(180deg, #F7D154 0%, #DAA520 100%)',
                  color: '#080a0c',
                  fontWeight: 'bold',
                  fontSize: '0.72rem',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                <Plus style={{ width: '14px', height: '14px' }} />
                <span>ADD</span>
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cfg.offers.map((o) => (
                <div
                  key={o.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: '#0d1118',
                    border: '1px solid #222b3a',
                    borderRadius: '4px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#fff' }}>{o.name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>${o.price}</span> ({o.billing}) • {o.rail} • {o.mode} • {o.url}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => copyText(`${o.name} — $${o.price} (${o.billing}) — ${o.url}`, o.id)}
                      style={{ padding: '5px 9px', backgroundColor: '#161c26', border: '1px solid #2f3b4f', borderRadius: '3px', color: '#DAA520', fontSize: '0.68rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      {copiedId === o.id ? 'COPIED' : 'COPY LINK'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOffer(o.id)}
                      style={{ padding: '5px 7px', backgroundColor: 'transparent', border: '1px solid #262e3d', borderRadius: '3px', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 5: UNIT ECONOMICS */}
        {subTab === 'ECONOMICS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '14px' }}>
            <div style={{ padding: '12px', backgroundColor: '#0d1118', border: '1px solid #222b3a', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ color: '#10b981', fontSize: '0.76rem', fontWeight: 'bold', borderBottom: '1px solid #1e2634', paddingBottom: '6px' }}>
                INPUT VARIABLES
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>OFFER PRICE ($)</label>
                <input
                  type="number"
                  min="0"
                  value={cfg.price}
                  onChange={(e) => setVal('price', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#10b981', fontWeight: 'bold', fontSize: '0.76rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>PROCESSOR FEE (%)</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.1"
                  value={cfg.feePct}
                  onChange={(e) => setVal('feePct', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#e2e8f0', fontSize: '0.76rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>MONTHLY VPS + API OVERHEAD ($)</label>
                <input
                  type="number"
                  min="0"
                  value={cfg.monthlyStackCost}
                  onChange={(e) => setVal('monthlyStackCost', Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 10px', backgroundColor: '#090c11', border: '1px solid #2a3446', borderRadius: '3px', color: '#e2e8f0', fontSize: '0.76rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', alignContent: 'start' }}>
              <div style={{ padding: '14px', backgroundColor: '#0d1118', border: '1px solid #222b3a', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>NET MARGIN PER SALE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981', marginTop: '6px' }}>${netPerSale.toFixed(2)}</div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#0d1118', border: '1px solid #222b3a', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>BREAK-EVEN VOLUME</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#DAA520', marginTop: '6px' }}>
                  {netPerSale > 0 ? `${breakEvenSales} sales/mo` : 'Invalid'}
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#0d1118', border: '1px solid #222b3a', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>PROFIT AT 25 MEMBERS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: netAt25 >= 0 ? '#38bdf8' : '#f87171', marginTop: '6px' }}>
                  ${netAt25.toFixed(2)}/mo
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
