import React, { useState, useEffect } from 'react';
import {
  Palette, Sliders, Check, Copy, RefreshCw,
  Monitor, Folder, Plus, Trash2, Sparkles, Maximize2, X, Layers
} from 'lucide-react';
import './Tab08Palettes.css';

// Master Metallic High Finance Swatches
const HIGH_FINANCE_METALS = [
  { id: 'metal-maroon', name: 'Metal Maroon', gradient: 'linear-gradient(180deg, #C46D63 0%, #8C3A32 50%, #4A1C16 100%)', sub: 'TYPE: Gradient', category: 'WARM' },
  { id: 'metal-sepia', name: 'Metal Sepia', gradient: 'linear-gradient(180deg, #D1C4C0 0%, #9E8C87 50%, #594944 100%)', sub: 'TYPE: Gradient', category: 'WARM' },
  { id: 'metal-bronze', name: 'Metal Bronze', gradient: 'linear-gradient(180deg, #B39E96 0%, #7A635B 50%, #382A26 100%)', sub: 'TYPE: Gradient', category: 'WARM' },
  { id: 'metal-silver', name: 'Metal Silver', gradient: 'linear-gradient(180deg, #CED6DC 0%, #929CA3 50%, #4E5459 100%)', sub: 'TYPE: Gradient', category: 'WARM' },
  { id: 'metal-gunmetal', name: 'Metal Gunmetal', gradient: 'linear-gradient(180deg, #5C666E 0%, #353B40 50%, #121517 100%)', sub: 'TYPE: Gradient', category: 'WARM' },

  { id: 'metal-champagne', name: 'Metal Champagne', gradient: 'linear-gradient(180deg, #E8E6C8 0%, #9C9973 50%, #4A4932 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },
  { id: 'metal-sage', name: 'Metal Sage', gradient: 'linear-gradient(180deg, #C2D6C8 0%, #7A9685 50%, #3D5245 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },
  { id: 'metal-olive', name: 'Metal Olive', gradient: 'linear-gradient(180deg, #B5C4A3 0%, #6E8059 50%, #364229 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },
  { id: 'metal-slate', name: 'Metal Slate', gradient: 'linear-gradient(180deg, #94A1A6 0%, #546369 50%, #273238 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },
  { id: 'metal-onyx', name: 'Metal Onyx', gradient: 'linear-gradient(180deg, #444444 0%, #222222 50%, #050505 100%)', sub: 'TYPE: Gradient', category: 'TACTICAL' },

  { id: 'metal-charcoal', name: 'Metal Charcoal', gradient: 'linear-gradient(180deg, #6E767C 0%, #40454A 50%, #1C1E20 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },
  { id: 'metal-graphite', name: 'Metal Graphite', gradient: 'linear-gradient(180deg, #A0AAB2 0%, #687178 50%, #3A3F44 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },
  { id: 'metal-taupe', name: 'Metal Taupe', gradient: 'linear-gradient(180deg, #877C75 0%, #544C47 50%, #2B2522 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },
  { id: 'metal-espresso', name: 'Metal Espresso', gradient: 'linear-gradient(180deg, #544740 0%, #2E2521 50%, #120E0C 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },
  { id: 'metal-antique-brass', name: 'Metal Antique Brass', gradient: 'linear-gradient(180deg, #A8A876 0%, #666645 50%, #2E2E1E 100%)', sub: 'TYPE: Gradient', category: 'NOIR' },

  { id: 'metal-titanium', name: 'Metal Titanium', gradient: 'linear-gradient(180deg, #E2E8ED 0%, #A1A9AF 50%, #55595C 100%)', sub: 'TYPE: Gradient', category: 'PRECIOUS' },
  { id: 'metal-brushed-steel', name: 'Metal Brushed Steel', gradient: 'linear-gradient(180deg, #CBD4DB 0%, #8B939A 50%, #454A4E 100%)', sub: 'TYPE: Gradient', category: 'PRECIOUS' },
  { id: 'metal-deep-teal', name: 'Metal Deep Teal', gradient: 'linear-gradient(180deg, #5092A8 0%, #265261 50%, #0F252B 100%)', sub: 'TYPE: Gradient', category: 'PRECIOUS' },
  { id: 'metal-midnight', name: 'Metal Midnight', gradient: 'linear-gradient(180deg, #2D5063 0%, #142933 50%, #071014 100%)', sub: 'TYPE: Gradient', category: 'PRECIOUS' }
];

// Africa Palette Master Swatches
const AFRICA_MASTER_SWATCHES = [
  { id: 'madothi-charcoal', name: 'Madothi Charcoal', gradient: '#1A0F0A', sub: 'TYPE: Solid Hex', category: 'FOUNDATIONS' },
  { id: 'madothi-espresso', name: 'Madothi Espresso', gradient: '#2B1A11', sub: 'TYPE: Solid Hex', category: 'FOUNDATIONS' },
  { id: 'malawi-sunset', name: 'Malawi Sunset', gradient: '#E35503', sub: 'TYPE: Solid Hex', category: 'IDENTITY ACCENTS' },
  { id: 'african-ochre', name: 'African Ochre', gradient: '#C7923E', sub: 'TYPE: Solid Hex', category: 'IDENTITY ACCENTS' },
  { id: 'canopy-forest', name: 'Canopy Forest', gradient: '#2B4422', sub: 'TYPE: Solid Hex', category: 'PROGRAM & CANOPY' },
  { id: 'canopy-sage', name: 'Canopy Sage', gradient: '#547A4E', sub: 'TYPE: Solid Hex', category: 'PROGRAM & CANOPY' },
  { id: 'safari-tan', name: 'Safari Tan', gradient: '#C49A7D', sub: 'TYPE: Solid Hex', category: 'SURFACES & LINEN' },
  { id: 'wicker-sand', name: 'Wicker Sand', gradient: '#D9C3B0', sub: 'TYPE: Solid Hex', category: 'SURFACES & LINEN' },
  { id: 'linen-canvas', name: 'Linen Canvas', gradient: '#F5F0EA', sub: 'TYPE: Solid Hex', category: 'SURFACES & LINEN' },
  { id: 'linen-highlight', name: 'Linen Highlight', gradient: '#FAF8F5', sub: 'TYPE: Solid Hex', category: 'SURFACES & LINEN' },

  { id: 'timber-w01', name: 'W-01 Charred Ironwood', gradient: '#1A0F0A', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w02', name: 'W-02 Deep Ebony Sinker', gradient: '#26160E', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w03', name: 'W-03 Roasted Mopane', gradient: '#362015', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w04', name: 'W-04 Aged African Walnut', gradient: '#4A2E1F', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w05', name: 'W-05 Seasoned Teak', gradient: '#5E3D2B', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w06', name: 'W-06 Earthy Kiaat', gradient: '#75503A', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w07', name: 'W-07 Wild Tamboti', gradient: '#8F664C', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w08', name: 'W-08 Sun-Baked Mahogany', gradient: '#AA7F62', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w09', name: 'W-09 Weathered Safari Plank', gradient: '#C49A7D', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' },
  { id: 'timber-w10', name: 'W-10 Bleached Limba', gradient: '#DFBAA0', sub: 'TYPE: Timber Solid', category: 'TIMBER MATRIX' }
];

// Extensible Texture & Weave Library (42 Linked Africa Assets; future texture packs append cleanly here)
const TEXTURE_LIBRARY = [
  { name: "Aged Ochre Weave.jpg", pack: "AFRICA WEAVES", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Background 1.png", pack: "AFRICA WEAVES", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Background 2.png", pack: "AFRICA WEAVES", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Background 3.png", pack: "AFRICA WEAVES", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Border Strip 2.png", pack: "AFRICA WEAVES", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 3.png", pack: "AFRICA WEAVES", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 4.png", pack: "AFRICA WEAVES", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 5.png", pack: "AFRICA WEAVES", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 6.png", pack: "AFRICA WEAVES", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 7.png", pack: "AFRICA WEAVES", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip Green.png", pack: "AFRICA WEAVES", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip Weave Wide.png", pack: "AFRICA WEAVES", role: "Class A: Full-Width Primary Landing Header Band", type: "PNG" },
  { name: "Border Strip Weave.png", pack: "AFRICA WEAVES", role: "Class A: Intermediate Section Header Band", type: "PNG" },
  { name: "Border Strip.png", pack: "AFRICA WEAVES", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Fine Beige Weave.jpeg", pack: "AFRICA WEAVES", role: "Class B: Rustic Reading Surface", type: "JPEG" },
  { name: "Fine Thin Weave.jpg", pack: "AFRICA WEAVES", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Graphics.png", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "PNG" },
  { name: "Header Strip.png", pack: "AFRICA WEAVES", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Header Strip2.png", pack: "AFRICA WEAVES", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Header Strip3.png", pack: "AFRICA WEAVES", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Mat Weave Rich.png", pack: "AFRICA WEAVES", role: "Class B: Rustic Reading Surface", type: "PNG" },
  { name: "pattern-beige-floor.jpg", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-green.jpg", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-main.jpeg", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "JPEG" },
  { name: "pattern-main.jpg", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-wicker.jpg", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "JPG" },
  { name: "Ratan Fine Beige.jpg", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "JPG" },
  { name: "row1.png", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "PNG" },
  { name: "row2.png", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "PNG" },
  { name: "row3.png", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "PNG" },
  { name: "Thick Green Palm Weave.jpg", pack: "AFRICA WEAVES", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Trim 1.png", pack: "AFRICA WEAVES", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 13.png", pack: "AFRICA WEAVES", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 2.png", pack: "AFRICA WEAVES", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 3.png", pack: "AFRICA WEAVES", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 4.png", pack: "AFRICA WEAVES", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim12.png", pack: "AFRICA WEAVES", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Vine 2.png", pack: "AFRICA WEAVES", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "Vine 3.png", pack: "AFRICA WEAVES", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "Vine 4.png", pack: "AFRICA WEAVES", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "vine.png", pack: "AFRICA WEAVES", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "woven-basket-dry.jpg", pack: "AFRICA WEAVES", role: "Class C: General UI Asset", type: "JPG" }
];

const DEFAULT_KEY_BINDINGS = [
  { key: 'header-bg', label: 'Primary Header / Top Bar', targetCss: '--warlord-header-bg', assignedValue: '#0C0C0C', description: 'Top navigation deck & controls' },
  { key: 'main-bg', label: 'Dashboard Base Canvas', targetCss: '--warlord-bg-base', assignedValue: '#0C0C0C', description: 'Master root page backdrop' },
  { key: 'card-bg', label: 'Card Slate & Viewports', targetCss: '--warlord-card-bg', assignedValue: 'linear-gradient(180deg, #5C666E 0%, #353B40 50%, #121517 100%)', description: 'Modules, preview panels, kanban lanes' },
  { key: 'wire-border', label: 'Structural Wire / Borders', targetCss: '--warlord-border-wire', assignedValue: '#1E1E1E', description: 'Divider lines and grid boundaries' },
  { key: 'button-cta', label: 'Interactive CTA Buttons', targetCss: '--warlord-btn-cta', assignedValue: 'linear-gradient(180deg, #A8A876 0%, #666645 50%, #2E2E1E 100%)', description: 'Trigger actions & dispatch buttons' },
  { key: 'text-primary', label: 'Primary Heading Text', targetCss: '--warlord-text-main', assignedValue: '#F8FAFC', description: 'High-contrast typography' },
  { key: 'gold-accent', label: 'Core Signal Accent', targetCss: '--warlord-accent-gold', assignedValue: '#DAA520', description: 'Active tabs and title callouts' }
];

const AFRICA_KEY_BINDINGS = [
  { key: 'header-bg', label: 'Primary Header / Top Bar', targetCss: '--warlord-header-bg', assignedValue: '#1A0F0A', description: 'Madothi Charcoal Top Bar' },
  { key: 'main-bg', label: 'Dashboard Base Canvas', targetCss: '--warlord-bg-base', assignedValue: '#2B1A11', description: 'Madothi Espresso Deep Foundation' },
  { key: 'card-bg', label: 'Card Slate & Viewports', targetCss: '--warlord-card-bg', assignedValue: '#362015', description: 'W-03 Roasted Mopane Timber Slate' },
  { key: 'wire-border', label: 'Structural Wire / Borders', targetCss: '--warlord-border-wire', assignedValue: '#4A2E1F', description: 'W-04 Aged African Walnut Framing' },
  { key: 'button-cta', label: 'Interactive CTA Buttons', targetCss: '--warlord-btn-cta', assignedValue: '#DAA520', description: 'Goldenrod Action Trigger' },
  { key: 'text-primary', label: 'Primary Heading Text', targetCss: '--warlord-text-main', assignedValue: '#F5F0EA', description: 'Linen Canvas High Readability' },
  { key: 'gold-accent', label: 'Core Signal Accent', targetCss: '--warlord-accent-gold', assignedValue: '#C7923E', description: 'African Ochre Focal Highlight' }
];

function hexToHsl(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hexToRgba(hex, alpha) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  if (clean.length !== 6) return `rgba(11, 15, 23, ${alpha})`;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function GoldTip({ tip }) {
  return (
    <span
      title={tip}
      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#DAA520]/20 border border-[#DAA520] text-[#DAA520] text-[8px] font-bold cursor-help flex-shrink-0"
    >
      ?
    </span>
  );
}

export default function Tab08Palettes({ ws }) {
  const [activeSideView, setActiveSideView] = useState('MASTER');
  const [selectedMetal, setSelectedMetal] = useState(HIGH_FINANCE_METALS[5]);
  const [draggedMetal, setDraggedMetal] = useState(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedAsset, setCopiedAsset] = useState(null);
  const [previewAsset, setPreviewAsset] = useState(null);

  // Custom Palettes State
  const [customPalettes, setCustomPalettes] = useState(() => {
    try {
      const saved = localStorage.getItem('MCNC_CUSTOM_PALETTES_V2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeCustomId, setActiveCustomId] = useState(null);

  // Custom Palette Studio Draft State (5 Color Swabs + Optional Dragged Texture Overlay)
  const [draftName, setDraftName] = useState('');
  const [draftPrimary, setDraftPrimary] = useState('#DAA520');
  const [draftSecondary, setDraftSecondary] = useState('#10B981');
  const [draftSurface, setDraftSurface] = useState('#0B0F17');
  const [draftCard, setDraftCard] = useState('#141C2B');
  const [draftText, setDraftText] = useState('#F8FAFC');
  const [draftTexture, setDraftTexture] = useState(null);
  const [draftTextureTarget, setDraftTextureTarget] = useState('CARD'); // 'CARD' or 'BASE'
  const [draftTextureOpacity, setDraftTextureOpacity] = useState(35);

  const [bindings, setBindings] = useState(() => {
    try {
      const stored = localStorage.getItem('MCNC_PALETTE_METALLIC_BINDINGS_V3');
      return stored ? JSON.parse(stored) : DEFAULT_KEY_BINDINGS;
    } catch (e) {
      return DEFAULT_KEY_BINDINGS;
    }
  });

  const applyTokensToDom = (currentBindings) => {
    const root = document.documentElement;
    currentBindings.forEach(b => {
      root.style.setProperty(b.targetCss, b.assignedValue);
    });
  };

  useEffect(() => {
    applyTokensToDom(bindings);
  }, [bindings]);

  const handleSelectSideView = (view, customId = null) => {
    setActiveSideView(view);
    setActiveCustomId(customId);
    if (view === 'AFRICA') {
      setSelectedMetal(AFRICA_MASTER_SWATCHES[3]);
    } else if (view === 'MASTER') {
      setSelectedMetal(HIGH_FINANCE_METALS[5]);
    } else if (view === 'CUSTOM' && customId) {
      const found = customPalettes.find(p => p.id === customId);
      if (found && found.swatches?.length > 0) {
        setSelectedMetal(found.swatches[0]);
      }
    }
  };

  const handleAutoHarmonize = () => {
    const [h, s] = hexToHsl(draftPrimary);
    const sat = Math.max(45, s);
    setDraftSecondary(hslToHex((h + 155) % 360, sat, 46));
    setDraftSurface(hslToHex(h, Math.min(28, sat), 6));
    setDraftCard(hslToHex(h, Math.min(34, sat), 12));
    setDraftText(hslToHex(h, 15, 96));
  };

  // Drag texture onto Custom Builder Preview or Color Slot
  const handleTextureDragStart = (e, tex) => {
    e.dataTransfer.setData('application/mcnc-texture', JSON.stringify(tex));
  };

  const handleBuilderTextureDrop = (e, targetZone = null) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = e.dataTransfer.getData('application/mcnc-texture');
      if (raw) {
        const tex = JSON.parse(raw);
        setDraftTexture(tex);
        if (targetZone) setDraftTextureTarget(targetZone);
      }
    } catch (err) {}
  };

  const buildBlendedBackground = (hexColor, textureObj, opacityPct) => {
    if (!textureObj) return hexColor.toUpperCase();
    const tintAlpha = Math.max(0.15, Math.min(0.95, 1 - opacityPct / 100)).toFixed(2);
    const texUrl = `/africa-assets/${encodeURIComponent(textureObj.name)}`;
    return `linear-gradient(${hexToRgba(hexColor, tintAlpha)}, ${hexToRgba(hexColor, tintAlpha)}), url("${texUrl}") center/cover`;
  };

  const handleSaveCustomPalette = (e) => {
    e.preventDefault();
    const cleanName = draftName.trim() || `Custom Suite ${customPalettes.length + 1}`;
    const newId = `custom-${Date.now()}`;
    const borderHex = hslToHex(...(() => {
      const [h, s, l] = hexToHsl(draftCard);
      return [h, s, Math.min(26, l + 10)];
    })());

    const baseBgVal = draftTexture && draftTextureTarget === 'BASE'
      ? buildBlendedBackground(draftSurface, draftTexture, draftTextureOpacity)
      : draftSurface.toUpperCase();

    const cardBgVal = draftTexture && draftTextureTarget === 'CARD'
      ? buildBlendedBackground(draftCard, draftTexture, draftTextureOpacity)
      : draftCard.toUpperCase();

    const swatches = [
      { id: `${newId}-pri`, name: `${cleanName} Primary`, gradient: draftPrimary.toUpperCase(), sub: 'TYPE: Brand Accent', category: 'CUSTOM' },
      { id: `${newId}-sec`, name: `${cleanName} Secondary`, gradient: draftSecondary.toUpperCase(), sub: 'TYPE: Signal Accent', category: 'CUSTOM' },
      { id: `${newId}-surf`, name: `${cleanName} Base`, gradient: baseBgVal, sub: draftTexture && draftTextureTarget === 'BASE' ? `TEX: ${draftTexture.name}` : 'TYPE: Deep Canvas', category: 'CUSTOM' },
      { id: `${newId}-card`, name: `${cleanName} Card`, gradient: cardBgVal, sub: draftTexture && draftTextureTarget === 'CARD' ? `TEX: ${draftTexture.name}` : 'TYPE: Card Slate', category: 'CUSTOM' },
      { id: `${newId}-bord`, name: `${cleanName} Wire`, gradient: borderHex, sub: 'TYPE: Border Wire', category: 'CUSTOM' },
      { id: `${newId}-txt`, name: `${cleanName} Text`, gradient: draftText.toUpperCase(), sub: 'TYPE: High Contrast', category: 'CUSTOM' }
    ];

    if (draftTexture) {
      swatches.push({
        id: `${newId}-tex`,
        name: `Weave: ${draftTexture.name}`,
        gradient: buildBlendedBackground(draftCard, draftTexture, draftTextureOpacity),
        sub: `BLEND: ${draftTextureOpacity}%`,
        category: 'CUSTOM'
      });
    }

    const newSuite = {
      id: newId,
      name: cleanName,
      texture: draftTexture,
      textureTarget: draftTextureTarget,
      textureOpacity: draftTextureOpacity,
      swatches,
      bindings: [
        { key: 'header-bg', label: 'Primary Header / Top Bar', targetCss: '--warlord-header-bg', assignedValue: draftSurface.toUpperCase(), description: `${cleanName} Top Bar` },
        { key: 'main-bg', label: 'Dashboard Base Canvas', targetCss: '--warlord-bg-base', assignedValue: baseBgVal, description: `${cleanName} Deep Foundation` },
        { key: 'card-bg', label: 'Card Slate & Viewports', targetCss: '--warlord-card-bg', assignedValue: cardBgVal, description: `${cleanName} Card Slate` },
        { key: 'wire-border', label: 'Structural Wire / Borders', targetCss: '--warlord-border-wire', assignedValue: borderHex, description: `${cleanName} Frame Border` },
        { key: 'button-cta', label: 'Interactive CTA Buttons', targetCss: '--warlord-btn-cta', assignedValue: draftPrimary.toUpperCase(), description: `${cleanName} CTA Button` },
        { key: 'text-primary', label: 'Primary Heading Text', targetCss: '--warlord-text-main', assignedValue: draftText.toUpperCase(), description: `${cleanName} Typography` },
        { key: 'gold-accent', label: 'Core Signal Accent', targetCss: '--warlord-accent-gold', assignedValue: draftSecondary.toUpperCase(), description: `${cleanName} Accent Signal` }
      ]
    };

    const updatedList = [...customPalettes, newSuite];
    setCustomPalettes(updatedList);
    localStorage.setItem('MCNC_CUSTOM_PALETTES_V2', JSON.stringify(updatedList));
    setDraftName('');
    handleSelectSideView('CUSTOM', newId);
  };

  const handleDeleteCustomPalette = (id, e) => {
    e.stopPropagation();
    const updatedList = customPalettes.filter(p => p.id !== id);
    setCustomPalettes(updatedList);
    localStorage.setItem('MCNC_CUSTOM_PALETTES_V2', JSON.stringify(updatedList));
    if (activeCustomId === id) {
      handleSelectSideView('MASTER');
    }
  };

  const handleApplySuiteBindings = (suiteBindings) => {
    setBindings(suiteBindings);
    localStorage.setItem('MCNC_PALETTE_METALLIC_BINDINGS_V3', JSON.stringify(suiteBindings));
    applyTokensToDom(suiteBindings);
  };

  const handleDragStart = (e, metal) => {
    setDraggedMetal(metal);
    e.dataTransfer.setData('application/json', JSON.stringify(metal));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    let metalToAssign = draggedMetal;
    if (!metalToAssign) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) metalToAssign = JSON.parse(raw);
      } catch (err) {}
    }
    if (!metalToAssign) {
      try {
        const rawTex = e.dataTransfer.getData('application/mcnc-texture');
        if (rawTex) {
          const tex = JSON.parse(rawTex);
          metalToAssign = {
            gradient: buildBlendedBackground('#141C2B', tex, 45)
          };
        }
      } catch (err) {}
    }
    if (metalToAssign) {
      assignMetalToTarget(targetKey, metalToAssign.gradient);
    }
    setDraggedMetal(null);
  };

  const assignMetalToTarget = (targetKey, value) => {
    const updated = bindings.map(b => {
      if (b.key === targetKey) {
        return { ...b, assignedValue: value };
      }
      return b;
    });
    setBindings(updated);
    localStorage.setItem('MCNC_PALETTE_METALLIC_BINDINGS_V3', JSON.stringify(updated));
    applyTokensToDom(updated);
  };

  const handleReset = () => {
    setBindings(DEFAULT_KEY_BINDINGS);
    localStorage.setItem('MCNC_PALETTE_METALLIC_BINDINGS_V3', JSON.stringify(DEFAULT_KEY_BINDINGS));
    applyTokensToDom(DEFAULT_KEY_BINDINGS);
  };

  const handleCopyContract = () => {
    const activeCustom = customPalettes.find(p => p.id === activeCustomId);
    const title = activeSideView === 'AFRICA'
      ? '### WARLORD AFRICA PALETTE MASTER APPLIED CONTRACT'
      : activeSideView === 'CUSTOM' && activeCustom
      ? `### CUSTOM PALETTE (${activeCustom.name.toUpperCase()}) APPLIED CONTRACT`
      : '### WARLORD HIGH-FINANCE APPLIED SPEC CONTRACT';

    const lines = [
      title,
      ...bindings.map(b => `- ${b.label} (${b.targetCss}): ${b.assignedValue}`)
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleCopyAssetName = (assetName, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(assetName);
    setCopiedAsset(assetName);
    setTimeout(() => setCopiedAsset(null), 1500);
  };

  const activeCustomSuite = customPalettes.find(p => p.id === activeCustomId);
  const activeSwatches =
    activeSideView === 'AFRICA'
      ? AFRICA_MASTER_SWATCHES
      : activeSideView === 'CUSTOM' && activeCustomSuite
      ? activeCustomSuite.swatches
      : HIGH_FINANCE_METALS;

  const previewBaseStyle = draftTexture && draftTextureTarget === 'BASE'
    ? buildBlendedBackground(draftSurface, draftTexture, draftTextureOpacity)
    : draftSurface;

  const previewCardStyle = draftTexture && draftTextureTarget === 'CARD'
    ? buildBlendedBackground(draftCard, draftTexture, draftTextureOpacity)
    : draftCard;

  return (
    <div className="flex h-full w-full bg-[#0C0C0C] text-xs font-mono select-none p-2 gap-2 overflow-hidden text-[#E2E8F0]">

      {/* 1. LEFT NAVIGATION DECK */}
      <div className="w-60 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        <div className="border border-[#1E1E1E] rounded bg-[#090C0E] p-3 flex flex-col gap-2.5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[#DAA520] font-bold text-[10px] tracking-widest block uppercase">
                WARLORD PALETTES
              </span>
              <span className="text-[8px] text-[#94A3B8] uppercase">DEFAULTS &amp; CUSTOM SUITES</span>
            </div>
            <GoldTip tip="Pre-loaded with High Finance & Africa defaults, or build your own custom brand palette with woven textures." />
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => handleSelectSideView('MASTER')}
              className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                activeSideView === 'MASTER'
                  ? 'border-[#047857] text-[#10B981] bg-[#047857]/15 shadow-[0_0_8px_rgba(4,120,87,0.3)]'
                  : 'border-[#1E1E1E] text-[#94A3B8] hover:text-white bg-[#0C0C0C]'
              }`}
            >
              <span>High Finance Master</span>
              <span className="text-[7.5px] bg-[#047857]/20 text-[#10B981] px-1.5 py-0.5 rounded">DEFAULT</span>
            </button>

            <button
              onClick={() => handleSelectSideView('AFRICA')}
              className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                activeSideView === 'AFRICA'
                  ? 'border-[#DAA520] text-[#DAA520] bg-[#DAA520]/15 shadow-[0_0_8px_rgba(218,165,32,0.3)]'
                  : 'border-[#1E1E1E] text-[#94A3B8] hover:text-[#DAA520] bg-[#0C0C0C]'
              }`}
            >
              <span>Africa Palette Master</span>
              <span className="text-[7.5px] bg-[#DAA520]/20 text-[#DAA520] px-1.5 py-0.5 rounded">42 ASSETS</span>
            </button>

            <button
              onClick={() => handleSelectSideView('BUILDER')}
              className={`w-full text-left p-2.5 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                activeSideView === 'BUILDER'
                  ? 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/15 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                  : 'border-[#DAA520]/50 text-[#DAA520] hover:bg-[#DAA520]/10 bg-[#0C0C0C]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                BUILD CUSTOM PALETTE
              </span>
              <GoldTip tip="Pick 5 colors and drag any weave or texture onto your palette preview." />
            </button>
          </div>

          {/* User Saved Custom Palettes List */}
          {customPalettes.length > 0 && (
            <div className="pt-2 border-t border-[#1E1E1E] space-y-1.5">
              <span className="text-[8.5px] text-[#94A3B8] uppercase font-bold tracking-wider block">
                YOUR CUSTOM PALETTES ({customPalettes.length})
              </span>
              {customPalettes.map(cp => {
                const isThisActive = activeSideView === 'CUSTOM' && activeCustomId === cp.id;
                return (
                  <div
                    key={cp.id}
                    onClick={() => handleSelectSideView('CUSTOM', cp.id)}
                    className={`w-full p-2 rounded text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-between gap-1 ${
                      isThisActive
                        ? 'border-[#DAA520] text-white bg-[#DAA520]/15'
                        : 'border-[#1E1E1E] text-[#C5BD9F] hover:border-[#DAA520]/50 bg-[#0C0C0C]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0"
                        style={{ background: cp.swatches[0]?.gradient }}
                      />
                      <span className="truncate">{cp.name}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteCustomPalette(cp.id, e)}
                      className="text-[#64748b] hover:text-red-400 p-0.5 cursor-pointer"
                      title="Delete custom palette"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Apply Suite Presets */}
          {activeSideView === 'AFRICA' && (
            <div className="pt-2 border-t border-[#1E1E1E]">
              <button
                onClick={() => handleApplySuiteBindings(AFRICA_KEY_BINDINGS)}
                className="w-full py-2 px-2 bg-[#DAA520]/15 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520] rounded text-[9px] font-bold uppercase transition-all shadow-[0_0_8px_rgba(218,165,32,0.2)] cursor-pointer"
              >
                APPLY AFRICA SUITE TO DOM
              </button>
            </div>
          )}

          {activeSideView === 'CUSTOM' && activeCustomSuite && (
            <div className="pt-2 border-t border-[#1E1E1E]">
              <button
                onClick={() => handleApplySuiteBindings(activeCustomSuite.bindings)}
                className="w-full py-2 px-2 bg-[#DAA520]/15 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520] rounded text-[9px] font-bold uppercase transition-all shadow-[0_0_8px_rgba(218,165,32,0.2)] cursor-pointer"
              >
                APPLY "{activeCustomSuite.name}"
              </button>
            </div>
          )}

          {/* Active Brush Readout */}
          <div className="mt-auto border border-[#1E1E1E] bg-[#0C0C0C] p-2.5 rounded flex flex-col gap-1.5">
            <span className="text-[8px] text-[#94A3B8] uppercase font-bold">ACTIVE DRAG SWATCH:</span>
            <div
              className="h-7 w-full rounded border border-white/20 shadow-inner"
              style={{ background: selectedMetal.gradient }}
            />
            <span className="text-[9.5px] text-white font-bold truncate">{selectedMetal.name}</span>
          </div>
        </div>
      </div>

      {/* 2. CENTER: BUILDER STUDIO OR DRAGGABLE SWATCH DECK & TEXTURE THUMBNAILS */}
      <div className="flex-1 flex flex-col border border-[#1E1E1E] rounded bg-[#090C0E] overflow-hidden">

        {/* Status Header */}
        <div className="p-2.5 bg-[#0C0C0C] border-b border-[#1E1E1E] flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <span className="text-[#DAA520] font-bold text-[10px] uppercase tracking-wider">
              {activeSideView === 'AFRICA'
                ? 'AFRICA PALETTE + WEAVE LIBRARY //'
                : activeSideView === 'BUILDER'
                ? 'CUSTOM PALETTE + TEXTURE STUDIO //'
                : activeSideView === 'CUSTOM' && activeCustomSuite
                ? `CUSTOM SUITE: ${activeCustomSuite.name} //`
                : 'HIGH FINANCE METALLICS //'}
            </span>
            <span className="text-[#94A3B8] font-bold text-[9.5px] uppercase tracking-wider">
              {activeSideView === 'BUILDER'
                ? '[ PICK 5 COLORS + DRAG ANY WEAVE TEXTURE ]'
                : '[ DRAG SWATCH OR WEAVE TO RIGHT DROP SHELF ]'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-[9px] text-[#94A3B8] hover:text-[#DAA520] flex items-center gap-1 cursor-pointer mr-1"
              title="Reset default bindings"
            >
              <RefreshCw className="w-3 h-3" />
              RESET DEFAULT
            </button>
            <button
              onClick={handleCopyContract}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer ${
                copiedContract
                  ? 'bg-[#047857]/20 text-[#10B981] border-[#047857]'
                  : 'bg-[#14171C] hover:bg-[#DAA520]/20 text-[#DAA520] border-[#DAA520]/40'
              }`}
            >
              {copiedContract ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-[#DAA520]" />}
              <span>{copiedContract ? 'CONTRACT COPIED' : 'COPY SPEC'}</span>
            </button>
          </div>
        </div>

        {/* MODE A: CUSTOM PALETTE + TEXTURE BUILDER STUDIO */}
        {activeSideView === 'BUILDER' ? (
          <form onSubmit={handleSaveCustomPalette} className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
            {/* Step 1: Name & Auto-Harmonize */}
            <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-1.5">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-[#DAA520]" />
                  <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">
                    1. NAME YOUR CUSTOM PALETTE
                  </span>
                </div>
                <GoldTip tip="Name your palette and click Auto-Harmonize to generate matching dark slates from 1 primary color." />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g., Tyrone Obsidian & Emerald"
                  className="flex-1 bg-[#12161F] border border-[#2B3545] focus:border-[#DAA520] rounded px-3 py-1.5 text-xs text-white outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAutoHarmonize}
                  className="px-3 py-1.5 bg-[#DAA520]/15 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520] rounded text-[9.5px] font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Pick Primary Brand Color first, then click to auto-generate matching dark surfaces & accent"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  1-CLICK AUTO-HARMONIZE
                </button>
              </div>
            </div>

            {/* Step 2: 5 Visual Color Pickers */}
            <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-1.5">
                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">
                  2. PICK YOUR 5 COLOR SWABS
                </span>
                <GoldTip tip="Click any color swatch to open the visual color wheel, or drop a texture onto Base/Card below." />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'PRIMARY BRAND', val: draftPrimary, set: setDraftPrimary, hint: 'Buttons & CTAs', dropZone: null },
                  { label: 'ACCENT SIGNAL', val: draftSecondary, set: setDraftSecondary, hint: 'Badges & highlights', dropZone: null },
                  { label: 'BASE CANVAS', val: draftSurface, set: setDraftSurface, hint: 'Drop weave here', dropZone: 'BASE' },
                  { label: 'CARD SLATE', val: draftCard, set: setDraftCard, hint: 'Drop weave here', dropZone: 'CARD' },
                  { label: 'HEADING TEXT', val: draftText, set: setDraftText, hint: 'Typography', dropZone: null }
                ].map((slot) => {
                  const hasTexHere = draftTexture && slot.dropZone === draftTextureTarget;
                  return (
                    <div
                      key={slot.label}
                      onDragOver={slot.dropZone ? handleDragOver : undefined}
                      onDrop={slot.dropZone ? (e) => handleBuilderTextureDrop(e, slot.dropZone) : undefined}
                      className={`bg-[#11151C] border rounded p-2 flex flex-col gap-1 transition-all ${
                        hasTexHere
                          ? 'border-[#DAA520] shadow-[0_0_8px_rgba(218,165,32,0.25)]'
                          : slot.dropZone
                          ? 'border-dashed border-[#2B3545] hover:border-[#DAA520]'
                          : 'border-[#1F2633]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold text-[#DAA520] tracking-wider truncate">{slot.label}</span>
                        {hasTexHere && <span className="text-[7px] bg-[#DAA520] text-black px-1 rounded font-bold">TEX</span>}
                      </div>
                      <label
                        className="relative h-10 w-full rounded border border-white/20 cursor-pointer overflow-hidden block shadow-inner"
                        style={{
                          background: hasTexHere
                            ? buildBlendedBackground(slot.val, draftTexture, draftTextureOpacity)
                            : slot.val
                        }}
                      >
                        <input
                          type="color"
                          value={slot.val}
                          onChange={(e) => slot.set(e.target.value.toUpperCase())}
                          className="opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={slot.val}
                        onChange={(e) => slot.set(e.target.value)}
                        className="w-full bg-[#090C10] border border-[#232A36] rounded px-1 py-0.5 text-[9px] text-gray-200 font-mono text-center uppercase"
                      />
                      <span className="text-[7px] text-[#64748b] text-center truncate">{slot.hint}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Drag-and-Drop Texture & Weave Overlay Shelf */}
            <div className="bg-[#0C0C0C] border border-[#1E1E1E] rounded p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-1.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#DAA520]" />
                  <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">
                    3. DRAG OR CLICK A TEXTURE OVERLAY (AFRICA WEAVE DATABASE)
                  </span>
                  <GoldTip tip="Drag any weave thumbnail onto Base Canvas, Card Slate, or the Live Preview below—or click once to apply." />
                </div>

                {draftTexture && (
                  <div className="flex items-center gap-2">
                    <span className="text-[8.5px] text-[#10B981] font-bold">
                      ACTIVE: {draftTexture.name} ({draftTextureTarget})
                    </span>
                    <button
                      type="button"
                      onClick={() => setDraftTexture(null)}
                      className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 cursor-pointer"
                    >
                      CLEAR TEXTURE
                    </button>
                  </div>
                )}
              </div>

              {/* Texture Blend Controls when a texture is attached */}
              {draftTexture && (
                <div className="flex items-center justify-between gap-4 bg-[#11151C] border border-[#DAA520]/40 rounded px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[8.5px] text-[#C5BD9F] font-bold uppercase">APPLY TO:</span>
                    <button
                      type="button"
                      onClick={() => setDraftTextureTarget('CARD')}
                      className={`px-2 py-0.5 rounded text-[8.5px] font-bold cursor-pointer ${
                        draftTextureTarget === 'CARD' ? 'bg-[#DAA520] text-black' : 'bg-[#1A202C] text-gray-300'
                      }`}
                    >
                      CARD SLATE
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftTextureTarget('BASE')}
                      className={`px-2 py-0.5 rounded text-[8.5px] font-bold cursor-pointer ${
                        draftTextureTarget === 'BASE' ? 'bg-[#DAA520] text-black' : 'bg-[#1A202C] text-gray-300'
                      }`}
                    >
                      BASE CANVAS
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-1 max-w-xs">
                    <span className="text-[8.5px] text-[#C5BD9F] font-bold whitespace-nowrap">
                      WEAVE INTENSITY: {draftTextureOpacity}%
                    </span>
                    <input
                      type="range"
                      min="10"
                      max="85"
                      value={draftTextureOpacity}
                      onChange={(e) => setDraftTextureOpacity(Number(e.target.value))}
                      className="w-full accent-[#DAA520] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Horizontal Scrollable Strip of Draggable Weave Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                {TEXTURE_LIBRARY.map((tex, idx) => {
                  const isSelectedTex = draftTexture?.name === tex.name;
                  const texUrl = `/africa-assets/${encodeURIComponent(tex.name)}`;
                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleTextureDragStart(e, tex)}
                      onClick={() => setDraftTexture(tex)}
                      className={`w-20 flex-shrink-0 rounded border p-1 flex flex-col gap-1 cursor-grab active:cursor-grabbing transition-all ${
                        isSelectedTex
                          ? 'border-[#DAA520] bg-[#DAA520]/15 shadow-[0_0_8px_rgba(218,165,32,0.3)]'
                          : 'border-[#1F2633] hover:border-[#DAA520]/60 bg-[#11151C]'
                      }`}
                      title={`Drag or click to apply ${tex.name}`}
                    >
                      <img
                        src={texUrl}
                        alt={tex.name}
                        loading="lazy"
                        className="w-full h-11 object-cover rounded border border-white/10"
                      />
                      <span className="text-[7.5px] text-gray-200 font-bold truncate block text-center">
                        {tex.name.replace(/\.[^/.]+$/, '')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Live Textured Sandbox Card Preview (Drop Target Enabled) */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleBuilderTextureDrop(e)}
              className="bg-[#0C0C0C] border border-[#1E1E1E] hover:border-[#DAA520]/60 rounded p-3 flex flex-col gap-2.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold text-white uppercase tracking-wider">
                  4. LIVE TEXTURED SUITE PREVIEW (DROP ANY WEAVE HERE)
                </span>
                <span className="text-[8px] text-[#10B981] font-bold uppercase">REAL-TIME BLEND</span>
              </div>

              <div className="p-4 rounded-lg border border-white/15 transition-all" style={{ background: previewBaseStyle }}>
                <div className="p-3.5 rounded border border-white/15 flex flex-col gap-2 transition-all shadow-lg" style={{ background: previewCardStyle }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold drop-shadow" style={{ color: draftText }}>
                      {draftName.trim() || 'Your Custom Textured Brand Portal'}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded shadow" style={{ backgroundColor: draftSecondary, color: '#080A0C' }}>
                      {draftTexture ? `WEAVE: ${draftTexture.name}` : 'SOLID SUITE'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 drop-shadow" style={{ color: draftText }}>
                    Live visual preview of your 5 color swabs blended with your selected surface texture.
                  </p>
                  <button
                    type="button"
                    className="self-start px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider shadow"
                    style={{ backgroundColor: draftPrimary, color: '#080A0C' }}
                  >
                    SAMPLE PRIMARY ACTION
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#DAA520] hover:bg-[#ffb800] text-black font-bold text-[10.5px] rounded uppercase tracking-wider cursor-pointer shadow-[0_0_16px_rgba(218,165,32,0.35)]"
                >
                  SAVE &amp; LOAD CUSTOM PALETTE
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* MODE B: SWATCHES GRID + AFRICA LIVE WEAVE THUMBNAILS */
          <>
            <div className={`${activeSideView === 'AFRICA' ? 'max-h-[46%]' : 'flex-1'} p-2.5 overflow-y-auto grid grid-cols-4 gap-2 custom-scrollbar`}>
              {activeSwatches.map((metal) => {
                const isSelected = selectedMetal.id === metal.id;
                return (
                  <div
                    key={metal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, metal)}
                    onClick={() => setSelectedMetal(metal)}
                    className={`border rounded flex flex-col overflow-hidden cursor-grab active:cursor-grabbing transition-all select-none ${
                      isSelected
                        ? 'border-[#DAA520] shadow-[0_0_10px_rgba(218,165,32,0.3)] scale-[1.01]'
                        : 'border-[#1E1E1E] hover:border-gray-500 bg-[#0C0C0C]'
                    }`}
                  >
                    <div
                      className="h-11 w-full p-1.5 flex items-start"
                      style={{ background: metal.gradient }}
                    >
                      <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-black/75 text-white shadow-sm truncate">
                        {metal.name}
                      </span>
                    </div>
                    <div className="bg-[#0C0C0C] px-2 py-1 flex justify-between items-center border-t border-[#1E1E1E]">
                      <span className="text-[7px] text-[#94A3B8] uppercase truncate">{metal.sub}</span>
                      <span className="text-[7px] text-[#DAA520] font-bold uppercase flex-shrink-0">&larr; DRAG</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Physical Assets Drawer with LIVE TEXTURE & WEAVE THUMBNAILS */}
            {activeSideView === 'AFRICA' && (
              <div className="flex-1 border-t border-[#DAA520]/40 bg-[#0A0D10] p-2.5 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#1E1E1E] mb-2">
                  <span className="text-[9.5px] font-bold text-[#DAA520] flex items-center gap-1.5 uppercase">
                    <Folder className="w-3.5 h-3.5 text-[#DAA520]" />
                    AFRICA WEAVES &amp; TEXTURE SWATCHES (42 LIVE ASSETS)
                    <GoldTip tip="Click any weave thumbnail to zoom in, drag it to the right UI Drop Shelf, or click COPY." />
                  </span>
                  <span className="text-[8px] text-[#10B981] font-bold">CLICK TO ZOOM • DRAG TO APPLY</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {TEXTURE_LIBRARY.map((asset, idx) => {
                    const imgUrl = `/africa-assets/${encodeURIComponent(asset.name)}`;
                    const isCopied = copiedAsset === asset.name;
                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleTextureDragStart(e, asset)}
                        onClick={() => setPreviewAsset(asset)}
                        className="bg-[#0C0C0C] border border-[#1E1E1E] hover:border-[#DAA520] rounded p-1.5 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative w-11 h-11 rounded border border-[#DAA520]/40 overflow-hidden bg-[#14171C] flex-shrink-0">
                            <img
                              src={imgUrl}
                              alt={asset.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            />
                            <span className="absolute bottom-0.5 right-0.5 bg-black/75 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="w-2.5 h-2.5 text-[#DAA520]" />
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9.5px] font-bold text-gray-100 block truncate group-hover:text-[#DAA520]">
                              {asset.name}
                            </span>
                            <span className="text-[7.5px] text-[#94A3B8] block truncate">{asset.role}</span>
                            <span className="text-[7px] text-[#DAA520]/80 uppercase font-bold">{asset.type} TEXTURE</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleCopyAssetName(asset.name, e)}
                          className={`text-[8px] px-2 py-1 rounded border font-mono font-bold cursor-pointer flex-shrink-0 transition-colors ${
                            isCopied
                              ? 'bg-[#047857]/20 text-[#10B981] border-[#047857]'
                              : 'bg-[#14171C] hover:bg-[#DAA520] hover:text-black text-[#C5BD9F] border-[#2B3545]'
                          }`}
                          title="Copy texture filename"
                        >
                          {isCopied ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* 3. RIGHT COLUMN: ACTION DROP TARGETS & LIVE PREVIEW */}
      <div className="w-88 flex flex-col border border-[#1E1E1E] rounded bg-[#090C0E] overflow-hidden flex-shrink-0">

        <div className="p-2.5 bg-[#0C0C0C] border-b border-[#1E1E1E] flex justify-between items-center select-none">
          <span className="text-[10px] font-bold text-[#DAA520] uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#DAA520]" />
            UI ACTION DROP SHELF
          </span>
          <span className="text-[8px] text-[#10B981] bg-[#047857]/15 px-1.5 py-0.5 rounded border border-[#047857]/40 font-bold">
            DROP TARGETS
          </span>
        </div>

        {/* Action Targets List */}
        <div className="flex-1 p-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {bindings.map((b) => (
            <div
              key={b.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, b.key)}
              className="bg-[#0C0C0C] border border-[#1E1E1E] hover:border-[#DAA520] rounded p-2 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded border border-white/20 shadow-inner flex-shrink-0"
                  style={{ background: b.assignedValue }}
                />
                <div>
                  <span className="text-[10px] font-bold text-gray-200 block leading-tight">{b.label}</span>
                  <span className="text-[8px] text-[#94A3B8]">{b.description}</span>
                </div>
              </div>

              <button
                onClick={() => assignMetalToTarget(b.key, selectedMetal.gradient)}
                className="px-2 py-0.5 rounded bg-[#14171C] hover:bg-[#DAA520] text-[#94A3B8] hover:text-black border border-[#1E1E1E] text-[8px] font-bold transition-colors cursor-pointer"
              >
                APPLY
              </button>
            </div>
          ))}
        </div>

        {/* Live Preview Viewport */}
        <div className="border-t border-[#1E1E1E] p-2.5 bg-[#0C0C0C] flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-gray-300 uppercase flex items-center gap-1">
              <Monitor className="w-3 h-3 text-[#38bdf8]" />
              HARMONY PREVIEW
            </span>
            <span className="text-[7px] text-[#10B981] uppercase font-bold">LIVE DOM</span>
          </div>

          <div
            className="p-2.5 rounded border border-white/10 flex flex-col gap-1.5 shadow-sm"
            style={{ background: bindings.find(b => b.key === 'card-bg')?.assignedValue }}
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-white">Chief Madothi Landing Scope</span>
              <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-[#C7923E]">
                STAGE 01
              </span>
            </div>
            <div className="text-sm font-bold font-mono text-white">Children's Daily Feeding &amp; Education</div>
            <button
              className="w-full py-1.5 rounded text-[9px] font-bold uppercase transition-all shadow-md mt-0.5 cursor-pointer"
              style={{ background: bindings.find(b => b.key === 'button-cta')?.assignedValue, color: '#0C0C0C' }}
            >
              DONATE TO THE BOREHOLE FUND
            </button>
          </div>
        </div>

      </div>

      {/* FULL-RES WEAVE & TEXTURE LIGHTBOX MODAL */}
      {previewAsset && (
        <div
          onClick={() => setPreviewAsset(null)}
          className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0B0E14] border-2 border-[#DAA520] rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="px-4 py-2.5 bg-[#12161F] border-b border-[#1F2633] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#DAA520] block">{previewAsset.name}</span>
                <span className="text-[10px] text-[#94A3B8]">{previewAsset.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDraftTexture(previewAsset);
                    setPreviewAsset(null);
                    handleSelectSideView('BUILDER');
                  }}
                  className="px-3 py-1 rounded bg-[#10B981]/20 border border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-black font-bold text-[10px] cursor-pointer"
                >
                  USE IN CUSTOM PALETTE
                </button>
                <button
                  onClick={(e) => handleCopyAssetName(previewAsset.name, e)}
                  className="px-3 py-1 rounded bg-[#DAA520] text-black font-bold text-[10px] cursor-pointer"
                >
                  {copiedAsset === previewAsset.name ? 'COPIED!' : 'COPY FILENAME'}
                </button>
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="p-1 rounded bg-[#1A202C] text-gray-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#07090D] flex items-center justify-center max-h-[65vh] overflow-auto">
              <img
                src={`/africa-assets/${encodeURIComponent(previewAsset.name)}`}
                alt={previewAsset.name}
                className="max-w-full max-h-[58vh] rounded border border-white/15 object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
