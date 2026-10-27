## 4. TYPOGRAPHY & DATA-STATE RENDERING LAWS

### A. THE INSTITUTIONAL FONTS & HIERARCHY
To maintain a clean, clinical engineering aesthetic, fonts must be ultra-crisp sans-serif or fixed-width monospaced types (e.g., JetBrains Mono, SF Pro Display, or Roboto Mono).
* **Primary Headers (Titles / Major Balances):** Set to `color-smoke-reflection` (`#E2E8F0`), bold weight. Track letter-spacing out slightly (+0.05em) for a premium, spacious layout.
* **Telemetry Data / Live Numbers:** Must use a monospaced font to keep digits perfectly aligned vertically across rows. Main metrics use `color-white-glint` (`#F8FAFC`); secondary metrics use `color-silver-mist` (`#94A3B8`).
* **Critical Alerts & High-Value Totals:** Rendered exclusively in `color-goldenrod-core` (`#DAA520`) with a subtle under-glass soft background container fill (`rgba(218, 165, 32, 0.05)`).

### B. THE MARKET TELEMETRY SIGNALS (EMERALD & RUBY REFINEMENT)
Standard trading charts and execution signals use green and red. To prevent them from clashing with our elite Slate & Goldenrod architecture, raw neons are strictly prohibited. They are mapped to these institutional-tier flat tokens:
* **`color-signal-emerald` : `#10B981`** (Bullish Trends / Positive Executions / System Active)
  - *Under-Glass Behavior:* In charts or status badges, pair with `rgba(16, 185, 129, 0.1)` backdrops.
* **`color-signal-ruby`    : `#EF4444`** (Bearish Trends / Hard Stops / Liquidity Alerts)
  - *Under-Glass Behavior:* Pair with `rgba(239, 68, 68, 0.1)` backdrops.

### C. REINFORCED TEXT COMPOSITIONS & ALIGNMENT
1. **NO RAW BLACK OR RAW WHITE TEXT:** Standard `#000000` text or blinding `#FFFFFF` text blocks are permanently blacklisted. They shatter the reflection physics of the Perspex layer. All copy must belong to the `color-white-glint`, `color-smoke-reflection`, or `color-silver-mist` spectrum.
2. **THE DATA-STREAM MATRIX:** When displaying multi-column financial grids or algorithmic log streams, horizontal dividing wires must use a highly translucent track line (`rgba(148, 163, 184, 0.1)`) so the grid maps look laser-etched directly into the obsidian canvas base.