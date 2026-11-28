import React, { useState, useEffect, useRef } from 'react';
import {
  Palette, Sliders, Check, Copy, RefreshCw, Upload, Download,
  Monitor, Folder, Plus, Trash2, Sparkles, Maximize2, X, Layers,
  ChevronLeft, ChevronRight, Bookmark, Frame, Image as ImageIcon, Type
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

// Shared Weave & Texture Library (available across all palettes)
const BUILTIN_TEXTURE_LIBRARY = [
  { name: "Aged Ochre Weave.jpg", pack: "WEAVE LIBRARY", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Background 1.png", pack: "WEAVE LIBRARY", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Background 2.png", pack: "WEAVE LIBRARY", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Background 3.png", pack: "WEAVE LIBRARY", role: "Class B: Layout Canvas Plate", type: "PNG" },
  { name: "Border Strip 2.png", pack: "WEAVE LIBRARY", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 3.png", pack: "WEAVE LIBRARY", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 4.png", pack: "WEAVE LIBRARY", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 5.png", pack: "WEAVE LIBRARY", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 6.png", pack: "WEAVE LIBRARY", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip 7.png", pack: "WEAVE LIBRARY", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip Green.png", pack: "WEAVE LIBRARY", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Border Strip Weave Wide.png", pack: "WEAVE LIBRARY", role: "Class A: Full-Width Primary Landing Header Band", type: "PNG" },
  { name: "Border Strip Weave.png", pack: "WEAVE LIBRARY", role: "Class A: Intermediate Section Header Band", type: "PNG" },
  { name: "Border Strip.png", pack: "WEAVE LIBRARY", role: "Class A/C: Slicing Panel & Rail", type: "PNG" },
  { name: "Fine Beige Weave.jpeg", pack: "WEAVE LIBRARY", role: "Class B: Rustic Reading Surface", type: "JPEG" },
  { name: "Fine Thin Weave.jpg", pack: "WEAVE LIBRARY", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Graphics.png", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "PNG" },
  { name: "Header Strip.png", pack: "WEAVE LIBRARY", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Header Strip2.png", pack: "WEAVE LIBRARY", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Header Strip3.png", pack: "WEAVE LIBRARY", role: "Class A: Section Header Band", type: "PNG" },
  { name: "Mat Weave Rich.png", pack: "WEAVE LIBRARY", role: "Class B: Rustic Reading Surface", type: "PNG" },
  { name: "pattern-beige-floor.jpg", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-green.jpg", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-main.jpeg", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "JPEG" },
  { name: "pattern-main.jpg", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "JPG" },
  { name: "pattern-wicker.jpg", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "JPG" },
  { name: "Ratan Fine Beige.jpg", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "JPG" },
  { name: "row1.png", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "PNG" },
  { name: "row2.png", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "PNG" },
  { name: "row3.png", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "PNG" },
  { name: "Thick Green Palm Weave.jpg", pack: "WEAVE LIBRARY", role: "Class B: Rustic Reading Surface", type: "JPG" },
  { name: "Trim 1.png", pack: "WEAVE LIBRARY", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 13.png", pack: "WEAVE LIBRARY", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 2.png", pack: "WEAVE LIBRARY", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 3.png", pack: "WEAVE LIBRARY", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim 4.png", pack: "WEAVE LIBRARY", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Trim12.png", pack: "WEAVE LIBRARY", role: "Class C: Carved Section Boundary", type: "PNG" },
  { name: "Vine 2.png", pack: "WEAVE LIBRARY", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "Vine 3.png", pack: "WEAVE LIBRARY", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "Vine 4.png", pack: "WEAVE LIBRARY", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "vine.png", pack: "WEAVE LIBRARY", role: "Class C: Crawling Leaf & Foliage Frame", type: "PNG" },
  { name: "woven-basket-dry.jpg", pack: "WEAVE LIBRARY", role: "Class C: General UI Asset", type: "JPG" }
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

const BORDER_PRESETS = [
  { label: '0.5 cm', px: 19 },
  { label: '1 cm', px: 38 },
  { label: '2 cm', px: 76 },
  { label: '0.5 in', px: 48 },
  { label: '1 in', px: 96 }
];

function hexToHsl(hex) {
  let clean = (hex || '#DAA520').replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  if (clean.length !== 6) return [43, 74, 49];
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
  let clean = (hex || '#0B0F17').replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  if (clean.length !== 6) return `rgba(11, 15, 23, ${alpha})`;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function extractFirstHex(val) {
  if (typeof val !== 'string') return '#DAA520';
  const match = val.match(/#[0-9A-Fa-f]{6}/);
  return match ? match[0].toUpperCase() : '#DAA520';
}

function getTextureSrc(tex) {
  if (!tex) return '';
  if (tex.dataUrl) return tex.dataUrl;
  return `/africa-assets/${encodeURIComponent(tex.name)}`;
}

// Returns inline style object so weave zoom (<100% = tighter/sharper repeated weave, >=100% = zoomed) works cleanly
function buildMaterialStyle(colorOrGradient, textureObj, opacityPct = 55, shadingPct = 55, shadowPct = 60, weaveScalePct = 100) {
  const sheenTop = (0.06 + (shadingPct / 100) * 0.28).toFixed(2);
  const sheenMid = (0.02 + (shadingPct / 100) * 0.10).toFixed(2);
  const shadeBot = (0.12 + (shadingPct / 100) * 0.68).toFixed(2);
  const shadingLayer = `linear-gradient(180deg, rgba(255, 252, 240, ${sheenTop}) 0%, rgba(255, 255, 255, ${sheenMid}) 22%, rgba(0, 0, 0, 0.08) 58%, rgba(0, 0, 0, ${shadeBot}) 100%)`;

  const isGradient = typeof colorOrGradient === 'string' && colorOrGradient.includes('gradient(');
  const hexColor = isGradient ? extractFirstHex(colorOrGradient) : (colorOrGradient || '#DAA520');

  const accentHex = extractFirstHex(colorOrGradient);
  const boxShadow = shadowPct <= 0
    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.14)'
    : `0 ${Math.round(6 + (shadowPct / 100) * 24)}px ${Math.round(14 + (shadowPct / 100) * 42)}px rgba(0, 0, 0, ${(0.35 + (shadowPct / 100) * 0.55).toFixed(2)}), 0 0 ${Math.round(10 + (shadowPct / 100) * 26)}px ${hexToRgba(accentHex, (0.08 + (shadowPct / 100) * 0.28).toFixed(2))}, inset 0 1.5px 0 rgba(255, 248, 220, 0.24), inset 0 -2px 4px rgba(0, 0, 0, 0.45)`;

  if (!textureObj) {
    return {
      background: isGradient ? `${shadingLayer}, ${colorOrGradient}` : `${shadingLayer}, ${hexColor.toUpperCase()}`,
      boxShadow
    };
  }

  const tintAlpha = Math.max(0.12, Math.min(0.88, 1 - opacityPct / 100)).toFixed(2);
  const texUrl = getTextureSrc(textureObj);
  const tintLayer = `linear-gradient(${hexToRgba(hexColor, tintAlpha)}, ${hexToRgba(hexColor, tintAlpha)})`;
  const tilePx = Math.max(24, Math.round((weaveScalePct / 100) * 110));
  const isTiled = weaveScalePct < 98;

  return {
    backgroundImage: `${shadingLayer}, ${tintLayer}, url("${texUrl}")`,
    backgroundSize: isTiled ? `auto, auto, ${tilePx}px auto` : weaveScalePct > 102 ? `auto, auto, ${weaveScalePct}%` : '100% 100%, 100% 100%, cover',
    backgroundRepeat: isTiled ? 'no-repeat, no-repeat, repeat' : 'no-repeat, no-repeat, no-repeat',
    backgroundPosition: 'center, center, center',
    boxShadow
  };
}

function buildMaterialSurface(colorOrGradient, textureObj, opacityPct = 50, shadingPct = 55) {
  const sheenTop = (0.06 + (shadingPct / 100) * 0.28).toFixed(2);
  const sheenMid = (0.02 + (shadingPct / 100) * 0.10).toFixed(2);
  const shadeBot = (0.12 + (shadingPct / 100) * 0.68).toFixed(2);
  const shadingLayer = `linear-gradient(180deg, rgba(255, 252, 240, ${sheenTop}) 0%, rgba(255, 255, 255, ${sheenMid}) 22%, rgba(0, 0, 0, 0.08) 58%, rgba(0, 0, 0, ${shadeBot}) 100%)`;

  const isGradient = typeof colorOrGradient === 'string' && colorOrGradient.includes('gradient(');
  const hexColor = isGradient ? extractFirstHex(colorOrGradient) : (colorOrGradient || '#DAA520');

  if (!textureObj) {
    return isGradient
      ? `${shadingLayer}, ${colorOrGradient}`
      : `${shadingLayer}, ${hexColor.toUpperCase()}`;
  }

  const tintAlpha = Math.max(0.12, Math.min(0.88, 1 - opacityPct / 100)).toFixed(2);
  const texUrl = getTextureSrc(textureObj);
  const tintLayer = `linear-gradient(${hexToRgba(hexColor, tintAlpha)}, ${hexToRgba(hexColor, tintAlpha)})`;

  return `${shadingLayer}, ${tintLayer}, url("${texUrl}") center/cover`;
}

function buildElevationShadow(shadowPct = 55, accentOrGradient = '#DAA520') {
  if (shadowPct <= 0) return 'inset 0 1px 0 rgba(255, 255, 255, 0.14)';
  const accentHex = extractFirstHex(accentOrGradient);
  const y1 = Math.round(6 + (shadowPct / 100) * 24);
  const blur1 = Math.round(14 + (shadowPct / 100) * 42);
  const alpha1 = (0.35 + (shadowPct / 100) * 0.55).toFixed(2);
  const glowBlur = Math.round(10 + (shadowPct / 100) * 26);
  const glowAlpha = (0.08 + (shadowPct / 100) * 0.28).toFixed(2);
  return `0 ${y1}px ${blur1}px rgba(0, 0, 0, ${alpha1}), 0 0 ${glowBlur}px ${hexToRgba(accentHex, glowAlpha)}, inset 0 1.5px 0 rgba(255, 248, 220, 0.24), inset 0 -2px 4px rgba(0, 0, 0, 0.45)`;
}

export default function Tab08Palettes({ ws }) {
  const [activeSideView, setActiveSideView] = useState('MASTER');
  const [selectedMetal, setSelectedMetal] = useState(HIGH_FINANCE_METALS[5]);
  const [draggedMetal, setDraggedMetal] = useState(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedAsset, setCopiedAsset] = useState(null);
  const [copiedFrameCss, setCopiedFrameCss] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [sandboxDropActive, setSandboxDropActive] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');
  const [confirmedSlot, setConfirmedSlot] = useState(null);

  const texInputRef = useRef(null);
  const paletteImportRef = useRef(null);
  const framePhotoInputRef = useRef(null);
  const weaveStripRef = useRef(null);

  const [importedTextures, setImportedTextures] = useState(() => {
    try {
      const saved = localStorage.getItem('MCNC_IMPORTED_TEXTURES_V1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [savedMaterials, setSavedMaterials] = useState(() => {
    try {
      const saved = localStorage.getItem('MCNC_SAVED_MATERIALS_V1');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [customPalettes, setCustomPalettes] = useState(() => {
    try {
      const saved = localStorage.getItem('MCNC_CUSTOM_PALETTES_V3');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeCustomId, setActiveCustomId] = useState(null);

  const [draftName, setDraftName] = useState('');
  const [draftPrimary, setDraftPrimary] = useState('#DAA520');
  const [draftSecondary, setDraftSecondary] = useState('#10B981');
  const [draftSurface, setDraftSurface] = useState('#0D1117');
  const [draftCard, setDraftCard] = useState('#18202C');
  const [draftText, setDraftText] = useState('#F8FAFC');
  const [draftTexture, setDraftTexture] = useState(BUILTIN_TEXTURE_LIBRARY[0]);
  const [draftTextureTarget, setDraftTextureTarget] = useState('CARD');
  const [draftOpacity, setDraftOpacity] = useState(55);
  const [draftShading, setDraftShading] = useState(55);
  const [draftShadow, setDraftShadow] = useState(60);
  const [weaveScale, setWeaveScale] = useState(50); // 25%–220%: lower = finer/sharper tiled weave

  const [sandboxColor, setSandboxColor] = useState('#DAA520');
  const [sandboxColorLabel, setSandboxColorLabel] = useState('African Ochre');
  const [sandboxTexture, setSandboxTexture] = useState(BUILTIN_TEXTURE_LIBRARY[0]);

  const [frameMode, setFrameMode] = useState('PHOTO');
  const [borderSizeIdx, setBorderSizeIdx] = useState(1);
  const [frameRadius, setFrameRadius] = useState(12);
  const [innerBackdropOpacity, setInnerBackdropOpacity] = useState(72);
  const [frameTextContent, setFrameTextContent] = useState('Chief Mydoty Fund — Clean Water & Daily Feeding Report');
  const [framePhotoUrl, setFramePhotoUrl] = useState('/africa-assets/Aged%20Ochre%20Weave.jpg');

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

  const allTextures = [...importedTextures, ...BUILTIN_TEXTURE_LIBRARY];
  const quickSandboxWeaves = allTextures.slice(0, 6);
  const activeBorderPreset = BORDER_PRESETS[borderSizeIdx] || BORDER_PRESETS[1];
  const visualBorderPx = Math.max(8, Math.min(44, Math.round(activeBorderPreset.px * 0.45)));

  const sandboxSurfaceCss = buildMaterialSurface(
    sandboxColor,
    sandboxTexture,
    draftOpacity,
    draftShading
  );
  const sandboxShadowCss = buildElevationShadow(draftShadow, sandboxColor);
  const sandboxLiveStyle = buildMaterialStyle(
    sandboxColor,
    sandboxTexture,
    draftOpacity,
    draftShading,
    draftShadow,
    weaveScale
  );

  const confirmColorSelection = (slotKey, hexVal, labelText = 'Picked Color') => {
    const cleanHex = (hexVal || '#DAA520').toUpperCase();
    setSelectedMetal({ id: `picked-${slotKey}`, name: `${labelText} (${cleanHex})`, gradient: cleanHex });
    if (slotKey === 'PRIMARY BRAND') {
      setSandboxColor(cleanHex);
      setSandboxColorLabel(`${labelText} (${cleanHex})`);
    }
    setConfirmedSlot(slotKey);
    setTimeout(() => setConfirmedSlot(null), 1600);
  };

  const scrollWeaveStrip = (deltaX) => {
    if (weaveStripRef.current) {
      weaveStripRef.current.scrollBy({ left: deltaX, behavior: 'smooth' });
    }
  };

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

  const handleSaveSandboxMaterial = () => {
    const item = {
      id: `mat-${Date.now()}`,
      name: `${sandboxColorLabel}${sandboxTexture ? ` + ${sandboxTexture.name.replace(/\.[^/.]+$/, '')}` : ''}`,
      color: sandboxColor,
      colorLabel: sandboxColorLabel,
      texture: sandboxTexture,
      opacity: draftOpacity,
      shading: draftShading,
      shadow: draftShadow,
      weaveScale,
      borderLabel: activeBorderPreset.label,
      innerBackdropOpacity,
      surfaceCss: sandboxSurfaceCss,
      shadowCss: sandboxShadowCss
    };
    const next = [item, ...savedMaterials.slice(0, 11)];
    setSavedMaterials(next);
    try {
      localStorage.setItem('MCNC_SAVED_MATERIALS_V1', JSON.stringify(next));
    } catch (e) {}
    setSelectedMetal({ id: item.id, name: item.name, gradient: item.surfaceCss });
    setSavedNotice('SAVED TO VAULT');
    setTimeout(() => setSavedNotice(''), 1800);
  };

  const handleLoadSavedMaterial = (mat) => {
    setSandboxColor(mat.color);
    setSandboxColorLabel(mat.colorLabel || mat.name);
    setSandboxTexture(mat.texture || null);
    if (mat.texture) setDraftTexture(mat.texture);
    if (typeof mat.opacity === 'number') setDraftOpacity(mat.opacity);
    if (typeof mat.shading === 'number') setDraftShading(mat.shading);
    if (typeof mat.shadow === 'number') setDraftShadow(mat.shadow);
    if (typeof mat.weaveScale === 'number') setWeaveScale(mat.weaveScale);
    if (typeof mat.innerBackdropOpacity === 'number') setInnerBackdropOpacity(mat.innerBackdropOpacity);
    setSelectedMetal({ id: mat.id, name: mat.name, gradient: mat.surfaceCss });
  };

  const handleDeleteSavedMaterial = (id, e) => {
    e.stopPropagation();
    const next = savedMaterials.filter(m => m.id !== id);
    setSavedMaterials(next);
    try {
      localStorage.setItem('MCNC_SAVED_MATERIALS_V1', JSON.stringify(next));
    } catch (err) {}
  };

  const handleSandboxDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSandboxDropActive(false);

    let handled = false;
    try {
      const rawTex = e.dataTransfer.getData('application/mcnc-texture');
      if (rawTex) {
        const tex = JSON.parse(rawTex);
        setSandboxTexture(tex);
        setDraftTexture(tex);
        handled = true;
      }
    } catch (err) {}

    let metalDropped = draggedMetal;
    if (!metalDropped) {
      try {
        const rawMetal = e.dataTransfer.getData('application/json');
        if (rawMetal) metalDropped = JSON.parse(rawMetal);
      } catch (err) {}
    }

    if (metalDropped && metalDropped.gradient) {
      const hex = extractFirstHex(metalDropped.gradient);
      setSandboxColor(hex);
      setSandboxColorLabel(metalDropped.name || 'Dropped Swatch');
      setDraftPrimary(hex);
      setSelectedMetal(metalDropped);
      handled = true;
    }

    if (!handled && selectedMetal?.gradient) {
      const hex = extractFirstHex(selectedMetal.gradient);
      setSandboxColor(hex);
      setSandboxColorLabel(selectedMetal.name || 'Active Swatch');
    }
    setDraggedMetal(null);
  };

  const handleFramePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setFramePhotoUrl(String(ev.target.result));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopyFrameSpec = () => {
    const snippet = [
      `/* MCNC Frame & Material Spec (${activeBorderPreset.label} Border, Weave Scale ${weaveScale}%) */`,
      `background: ${sandboxSurfaceCss};`,
      `box-shadow: ${sandboxShadowCss};`,
      `border-radius: ${frameRadius}px;`,
      `padding: ${visualBorderPx}px;`,
      `/* Inner text/photo overlay readability: ${innerBackdropOpacity}% dark veil */`
    ].join('\n');
    navigator.clipboard.writeText(snippet);
    setCopiedFrameCss(true);
    setTimeout(() => setCopiedFrameCss(false), 1800);
  };

  const handleAutoHarmonize = () => {
    const [h, s] = hexToHsl(draftPrimary);
    const sat = Math.max(45, s);
    setDraftSecondary(hslToHex((h + 155) % 360, sat, 46));
    setDraftSurface(hslToHex(h, Math.min(28, sat), 6));
    setDraftCard(hslToHex(h, Math.min(34, sat), 12));
    setDraftText(hslToHex(h, 15, 96));
  };

  const handleImportTextureFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        if (!dataUrl) return;
        const ext = (file.name.split('.').pop() || 'IMG').toUpperCase();
        const newTex = {
          name: file.name,
          pack: 'IMPORTED CUSTOM',
          role: 'Custom Imported Texture / Weave',
          type: ext,
          dataUrl
        };
        setImportedTextures((prev) => {
          const filtered = prev.filter(t => t.name !== file.name);
          const next = [newTex, ...filtered];
          try {
            localStorage.setItem('MCNC_IMPORTED_TEXTURES_V1', JSON.stringify(next));
          } catch (err) {
            alert('Browser storage limit reached for large images. Try a smaller/compressed texture file (< 500KB).');
          }
          return next;
        });
        setSandboxTexture(newTex);
        setDraftTexture(newTex);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleImportPaletteFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = String(ev.target?.result || '');
        const parsed = JSON.parse(raw);
        if (parsed.name) setDraftName(parsed.name);
        if (parsed.primary) { setDraftPrimary(parsed.primary); setSandboxColor(parsed.primary); }
        if (parsed.secondary) setDraftSecondary(parsed.secondary);
        if (parsed.surface) setDraftSurface(parsed.surface);
        if (parsed.card) setDraftCard(parsed.card);
        if (parsed.text) setDraftText(parsed.text);
        if (typeof parsed.opacity === 'number') setDraftOpacity(parsed.opacity);
        if (typeof parsed.shading === 'number') setDraftShading(parsed.shading);
        if (typeof parsed.shadow === 'number') setDraftShadow(parsed.shadow);
        if (parsed.texture) { setDraftTexture(parsed.texture); setSandboxTexture(parsed.texture); }
        setActiveSideView('BUILDER');
      } catch (err) {
        const hexes = String(ev.target?.result || '').match(/#[0-9A-Fa-f]{6}/g);
        if (hexes && hexes.length > 0) {
          if (hexes[0]) { setDraftPrimary(hexes[0].toUpperCase()); setSandboxColor(hexes[0].toUpperCase()); }
          if (hexes[1]) setDraftSecondary(hexes[1].toUpperCase());
          if (hexes[2]) setDraftSurface(hexes[2].toUpperCase());
          if (hexes[3]) setDraftCard(hexes[3].toUpperCase());
          if (hexes[4]) setDraftText(hexes[4].toUpperCase());
          setDraftName(file.name.replace(/\.[^/.]+$/, ''));
          setActiveSideView('BUILDER');
        } else {
          alert('Could not parse palette file. Please upload a JSON palette or file containing #HEX codes.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCustomJson = (suite) => {
    const payload = {
      name: suite.name,
      primary: suite.primary,
      secondary: suite.secondary,
      surface: suite.surface,
      card: suite.card,
      text: suite.text,
      opacity: suite.opacity,
      shading: suite.shading,
      shadow: suite.shadow,
      weaveScale,
      texture: suite.texture || null,
      bindings: suite.bindings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${suite.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-palette.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        setSandboxTexture(tex);
        if (targetZone) setDraftTextureTarget(targetZone);
      }
    } catch (err) {}
  };

  const handleSaveCustomPalette = (e) => {
    e.preventDefault();
    const cleanName = draftName.trim() || `Custom Suite ${customPalettes.length + 1}`;
    const newId = `custom-${Date.now()}`;
    const borderHex = hslToHex(...(() => {
      const [h, s, l] = hexToHsl(draftCard);
      return [h, s, Math.min(26, l + 10)];
    })());

    const baseBgVal = buildMaterialSurface(
      draftSurface,
      draftTexture && draftTextureTarget === 'BASE' ? draftTexture : null,
      draftOpacity,
      Math.round(draftShading * 0.5)
    );

    const cardBgVal = buildMaterialSurface(
      draftCard,
      draftTexture && draftTextureTarget === 'CARD' ? draftTexture : null,
      draftOpacity,
      draftShading
    );

    const ctaBgVal = buildMaterialSurface(draftPrimary, null, 0, Math.round(draftShading * 0.7));
    const shadowVal = buildElevationShadow(draftShadow, draftPrimary);

    const swatches = [
      { id: `${newId}-pri`, name: `${cleanName} Primary`, gradient: ctaBgVal, sub: `SHADE: ${draftShading}%`, category: 'CUSTOM' },
      { id: `${newId}-sec`, name: `${cleanName} Secondary`, gradient: draftSecondary.toUpperCase(), sub: 'TYPE: Signal Accent', category: 'CUSTOM' },
      { id: `${newId}-surf`, name: `${cleanName} Base`, gradient: baseBgVal, sub: draftTexture && draftTextureTarget === 'BASE' ? `OPAC: ${draftOpacity}%` : 'TYPE: Deep Canvas', category: 'CUSTOM' },
      { id: `${newId}-card`, name: `${cleanName} Card`, gradient: cardBgVal, sub: draftTexture && draftTextureTarget === 'CARD' ? `OPAC: ${draftOpacity}%` : `SHADE: ${draftShading}%`, category: 'CUSTOM' },
      { id: `${newId}-bord`, name: `${cleanName} Wire`, gradient: borderHex, sub: 'TYPE: Border Wire', category: 'CUSTOM' },
      { id: `${newId}-txt`, name: `${cleanName} Text`, gradient: draftText.toUpperCase(), sub: `SHADOW: ${draftShadow}%`, category: 'CUSTOM' }
    ];

    if (draftTexture) {
      swatches.push({
        id: `${newId}-tex`,
        name: `Weave: ${draftTexture.name}`,
        gradient: buildMaterialSurface(draftCard, draftTexture, draftOpacity, draftShading),
        sub: `OPAC ${draftOpacity}% • SHADE ${draftShading}%`,
        category: 'CUSTOM'
      });
    }

    const newSuite = {
      id: newId,
      name: cleanName,
      primary: draftPrimary.toUpperCase(),
      secondary: draftSecondary.toUpperCase(),
      surface: draftSurface.toUpperCase(),
      card: draftCard.toUpperCase(),
      text: draftText.toUpperCase(),
      texture: draftTexture,
      textureTarget: draftTextureTarget,
      opacity: draftOpacity,
      shading: draftShading,
      shadow: draftShadow,
      weaveScale,
      shadowCss: shadowVal,
      swatches,
      bindings: [
        { key: 'header-bg', label: 'Primary Header / Top Bar', targetCss: '--warlord-header-bg', assignedValue: draftSurface.toUpperCase(), description: `${cleanName} Top Bar` },
        { key: 'main-bg', label: 'Dashboard Base Canvas', targetCss: '--warlord-bg-base', assignedValue: baseBgVal, description: `${cleanName} Deep Foundation` },
        { key: 'card-bg', label: 'Card Slate & Viewports', targetCss: '--warlord-card-bg', assignedValue: cardBgVal, description: `${cleanName} Card Slate` },
        { key: 'wire-border', label: 'Structural Wire / Borders', targetCss: '--warlord-border-wire', assignedValue: borderHex, description: `${cleanName} Frame Border` },
        { key: 'button-cta', label: 'Interactive CTA Buttons', targetCss: '--warlord-btn-cta', assignedValue: ctaBgVal, description: `${cleanName} CTA Button` },
        { key: 'text-primary', label: 'Primary Heading Text', targetCss: '--warlord-text-main', assignedValue: draftText.toUpperCase(), description: `${cleanName} Typography` },
        { key: 'gold-accent', label: 'Core Signal Accent', targetCss: '--warlord-accent-gold', assignedValue: draftSecondary.toUpperCase(), description: `${cleanName} Accent Signal` }
      ]
    };

    const updatedList = [...customPalettes, newSuite];
    setCustomPalettes(updatedList);
    localStorage.setItem('MCNC_CUSTOM_PALETTES_V3', JSON.stringify(updatedList));
    setDraftName('');
    handleSelectSideView('CUSTOM', newId);
  };

  const handleDeleteCustomPalette = (id, e) => {
    e.stopPropagation();
    const updatedList = customPalettes.filter(p => p.id !== id);
    setCustomPalettes(updatedList);
    localStorage.setItem('MCNC_CUSTOM_PALETTES_V3', JSON.stringify(updatedList));
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
            gradient: buildMaterialSurface(extractFirstHex(sandboxColor), tex, draftOpacity, draftShading)
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
      : activeSideView === 'TEXTURES'
      ? '### WARLORD TEXTURES & WEAVES APPLIED CONTRACT'
      : activeSideView === 'CUSTOM' && activeCustom
      ? `### CUSTOM PALETTE (${activeCustom.name.toUpperCase()}) APPLIED CONTRACT`
      : '### WARLORD HIGH-FINANCE APPLIED SPEC CONTRACT';

    const lines = [
      title,
      ...bindings.map(b => `- ${b.label} (${b.targetCss}): ${b.assignedValue}`),
      ...(activeSideView === 'CUSTOM' && activeCustom
        ? [`- Card Elevation Shadow (--warlord-card-shadow): ${activeCustom.shadowCss}`]
        : [])
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

  const previewBaseStyle = buildMaterialStyle(
    draftSurface,
    draftTexture && draftTextureTarget === 'BASE' ? draftTexture : null,
    draftOpacity,
    Math.round(draftShading * 0.5),
    0,
    weaveScale
  );

  const previewCardStyle = buildMaterialStyle(
    draftCard,
    draftTexture && draftTextureTarget === 'CARD' ? draftTexture : null,
    draftOpacity,
    draftShading,
    draftShadow,
    weaveScale
  );

  const previewButtonStyle = buildMaterialStyle(
    draftPrimary,
    null,
    0,
    Math.round(draftShading * 0.7),
    Math.round(draftShadow * 0.7),
    100
  );

  const frameOuterStyle = buildMaterialStyle(
    sandboxColor,
    sandboxTexture,
    draftOpacity,
    draftShading,
    draftShadow,
    weaveScale
  );

  return (
    <div className="flex h-full w-full bg-[#0C0C0C] text-xs font-mono select-none p-2 gap-2 overflow-hidden text-[#E2E8F0]">

      <style>{`
        .weave-gold-scroll::-webkit-scrollbar {
          height: 12px;
        }
        .weave-gold-scroll::-webkit-scrollbar-track {
          background: linear-gradient(180deg, #090C10 0%, #161C26 100%);
          border-radius: 6px;
          border: 1px solid #2A3446;
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.75);
        }
        .weave-gold-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #F7D154 0%, #DAA520 55%, #9A6B08 100%);
          border-radius: 6px;
          border: 1px solid #FFE58F;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        .weave-gold-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #FFE58F 0%, #E5B225 55%, #B07C0B 100%);
        }
        .studio-3d-panel {
          background: linear-gradient(180deg, #161B24 0%, #0D1016 55%, #090B0F 100%);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.65), inset 0 1.5px 0 rgba(255, 248, 220, 0.16), inset 0 -1px 0 rgba(0, 0, 0, 0.8);
        }
        .studio-3d-card {
          background: linear-gradient(180deg, #1C2330 0%, #11161F 60%, #0B0E14 100%);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }
        input[type="range"].slider-3d {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(180deg, #07090D 0%, #1A212E 100%);
          border: 1px solid #2C3648;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.85), 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        input[type="range"].slider-3d::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 28%, #FFF3C4 0%, #DAA520 52%, #7D5504 100%);
          border: 1.5px solid #FFE58F;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.8), 0 0 10px rgba(218, 165, 32, 0.45);
          cursor: pointer;
        }
        input[type="range"].slider-3d:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
      `}</style>

      <input ref={texInputRef} type="file" accept="image/*" multiple onChange={handleImportTextureFiles} className="hidden" />
      <input ref={paletteImportRef} type="file" accept=".json,.txt,.css" onChange={handleImportPaletteFile} className="hidden" />
      <input ref={framePhotoInputRef} type="file" accept="image/*" onChange={handleFramePhotoUpload} className="hidden" />

      {/* 1. LEFT NAVIGATION DECK + INTERACTIVE DROP SANDBOX + WEAVE ZOOM SLIDER */}
      <div className="w-64 flex flex-col gap-2 overflow-hidden flex-shrink-0">
        <div className="studio-3d-panel border border-[#262F40] rounded p-2.5 flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <span className="text-[#DAA520] font-bold text-[10px] tracking-widest block uppercase">
              WARLORD PALETTES
            </span>
            <span className="text-[8px] text-[#94A3B8] uppercase">METALLICS • AFRICA • WEAVES</span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleSelectSideView('MASTER')}
              className={`w-full text-left p-2 rounded text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                activeSideView === 'MASTER'
                  ? 'border-[#10B981] text-[#10B981] bg-[#047857]/20 shadow-[0_6px_14px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(16,185,129,0.35)]'
                  : 'border-[#222A38] text-[#94A3B8] hover:text-white bg-[#0E131B]'
              }`}
            >
              <span>High Finance Master</span>
              <span className="text-[7px] bg-[#047857]/25 text-[#10B981] px-1.5 py-0.5 rounded">METALS</span>
            </button>

            <button
              onClick={() => handleSelectSideView('AFRICA')}
              className={`w-full text-left p-2 rounded text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                activeSideView === 'AFRICA'
                  ? 'border-[#DAA520] text-[#DAA520] bg-[#DAA520]/20 shadow-[0_6px_14px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,229,143,0.35)]'
                  : 'border-[#222A38] text-[#94A3B8] hover:text-[#DAA520] bg-[#0E131B]'
              }`}
            >
              <span>Africa Palette Master</span>
              <span className="text-[7px] bg-[#DAA520]/25 text-[#DAA520] px-1.5 py-0.5 rounded">OCHRE</span>
            </button>

            <button
              onClick={() => handleSelectSideView('TEXTURES')}
              className={`w-full text-left p-2 rounded text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                activeSideView === 'TEXTURES'
                  ? 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/20 shadow-[0_6px_14px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(186,230,253,0.35)]'
                  : 'border-[#222A38] text-[#C5BD9F] hover:text-[#38bdf8] bg-[#0E131B]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Textures &amp; Weaves</span>
              </span>
              <span className="text-[7px] bg-[#38bdf8]/20 text-[#38bdf8] px-1.5 py-0.5 rounded">{allTextures.length}</span>
            </button>

            <button
              onClick={() => handleSelectSideView('BUILDER')}
              className={`w-full text-left p-2 rounded text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                activeSideView === 'BUILDER'
                  ? 'border-[#FFE58F] text-black bg-gradient-to-b from-[#F7D154] to-[#DAA520] shadow-[0_6px_18px_rgba(218,165,32,0.45),inset_0_1px_0_rgba(255,255,255,0.6)]'
                  : 'border-[#DAA520] text-[#DAA520] hover:bg-[#DAA520] hover:text-black bg-[#DAA520]/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                CREATE CUSTOM PALETTE
              </span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => texInputRef.current?.click()}
              className="studio-3d-card p-1.5 rounded border border-[#2B3545] hover:border-[#DAA520] text-[#C5BD9F] hover:text-white text-[8px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Upload className="w-3 h-3 text-[#DAA520]" />
              IMPORT WEAVE
            </button>
            <button
              type="button"
              onClick={() => paletteImportRef.current?.click()}
              className="studio-3d-card p-1.5 rounded border border-[#2B3545] hover:border-[#DAA520] text-[#C5BD9F] hover:text-white text-[8px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Upload className="w-3 h-3 text-[#38bdf8]" />
              IMPORT JSON
            </button>
          </div>

          {/* INTERACTIVE DROP SANDBOX WINDOW + WEAVE MAGNIFY/SHARPEN SLIDER */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setSandboxDropActive(true);
            }}
            onDragLeave={() => setSandboxDropActive(false)}
            onDrop={handleSandboxDrop}
            className={`bg-gradient-to-b from-[#131822] to-[#090C11] border rounded p-2 flex flex-col gap-2 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${
              sandboxDropActive
                ? 'border-[#FFE58F] ring-2 ring-[#DAA520]/60 bg-[#1A2130]'
                : 'border-[#DAA520]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-bold text-[#DAA520] uppercase tracking-wider">
                LIVE MATERIAL SANDBOX
              </span>
              <div className="flex items-center gap-1.5">
                {!sandboxTexture && (
                  <button
                    type="button"
                    onClick={() => {
                      setSandboxTexture(allTextures[0] || null);
                      setDraftTexture(allTextures[0] || null);
                    }}
                    className="text-[7px] text-[#10B981] hover:underline uppercase font-bold cursor-pointer"
                  >
                    + WEAVE
                  </button>
                )}
                {sandboxTexture && (
                  <button
                    type="button"
                    onClick={() => {
                      setSandboxTexture(null);
                      setDraftTexture(null);
                    }}
                    className="text-[7px] text-[#94A3B8] hover:text-red-400 uppercase font-bold cursor-pointer"
                  >
                    NO WEAVE
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 bg-[#0C1017] border border-[#252F40] rounded px-2 py-1 text-[7.5px]">
              <span className="text-gray-200 font-bold truncate" title={sandboxColorLabel}>
                {sandboxColorLabel}
              </span>
              <span className="text-[#DAA520] font-bold truncate" title={sandboxTexture?.name || 'No Texture'}>
                {sandboxTexture ? sandboxTexture.name.replace(/\.[^/.]+$/, '') : 'SOLID'}
              </span>
            </div>

            <div
              draggable
              onDragStart={(e) => {
                const payload = { id: 'sandbox-live', name: sandboxColorLabel, gradient: sandboxSurfaceCss };
                setSelectedMetal(payload);
                handleDragStart(e, payload);
              }}
              onClick={() => {
                setSelectedMetal({ id: 'sandbox-live', name: sandboxColorLabel, gradient: sandboxSurfaceCss });
              }}
              className="p-2.5 rounded-md border border-white/25 cursor-grab active:cursor-grabbing transition-all flex flex-col justify-between min-h-[74px]"
              style={sandboxLiveStyle}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[8px] font-bold text-white bg-black/65 px-1.5 py-0.5 rounded truncate">
                  {sandboxDropActive ? 'DROP HERE!' : 'DROP COLOR / WEAVE'}
                </span>
                <span className="text-[6.5px] px-1 py-0.5 rounded bg-black/75 text-[#FFE58F] font-bold">
                  DRAG OUT
                </span>
              </div>
              <div className="flex items-center justify-between text-[7px] text-white font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] pt-2">
                <span>GRAIN {weaveScale}%</span>
                <span>SHADE {draftShading}%</span>
                <span>SHDW {draftShadow}%</span>
              </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {quickSandboxWeaves.map((tex, i) => {
                const active = sandboxTexture?.name === tex.name;
                return (
                  <button
                    key={i}
                    type="button"
                    draggable
                    onDragStart={(e) => handleTextureDragStart(e, tex)}
                    onClick={() => {
                      setSandboxTexture(tex);
                      setDraftTexture(tex);
                    }}
                    title={`Click or drag weave: ${tex.name}`}
                    className={`w-7 h-7 rounded overflow-hidden border flex-shrink-0 cursor-grab active:cursor-grabbing ${
                      active ? 'border-[#DAA520] ring-1 ring-[#DAA520]' : 'border-white/20 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={getTextureSrc(tex)} alt={tex.name} className="w-full h-full object-cover" />
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleSelectSideView('TEXTURES')}
                className="px-1.5 h-7 rounded bg-[#0E131B] hover:bg-[#38bdf8]/20 border border-[#283244] text-[7px] text-[#38bdf8] font-bold flex-shrink-0 cursor-pointer"
                title="Open full Textures & Weaves library"
              >
                {allTextures.length}+
              </button>
            </div>

            {/* Sliders: Weave Scale/Sharpen + Opaqueness + Light & Shading + 3D Drop Shadow */}
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between items-center text-[7px] font-bold uppercase">
                  <span className="text-[#FDE68A]">WEAVE ZOOM (FINE ↔ LARGE)</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#F7D154]">{weaveScale}%</span>
                    <button
                      type="button"
                      onClick={() => setWeaveScale(100)}
                      className="px-1 rounded bg-[#1A202C] hover:bg-[#F7D154] text-gray-300 hover:text-black text-[6.5px] cursor-pointer"
                      title="Reset Weave Scale to 100%"
                    >
                      100
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="25"
                  max="220"
                  disabled={!sandboxTexture}
                  value={weaveScale}
                  onChange={(e) => setWeaveScale(Number(e.target.value))}
                  className="slider-3d w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[7px] font-bold uppercase">
                  <span className="text-[#F5D77F]">WEAVE OPAQUENESS</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#DAA520]">{sandboxTexture ? `${draftOpacity}%` : 'OFF'}</span>
                    {sandboxTexture && (
                      <button
                        type="button"
                        onClick={() => setDraftOpacity(5)}
                        className="px-1 rounded bg-[#1A202C] hover:bg-[#DAA520] text-gray-300 hover:text-black text-[6.5px] cursor-pointer"
                        title="Set minimum weave opaqueness (5%)"
                      >
                        0
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="92"
                  disabled={!sandboxTexture}
                  value={draftOpacity}
                  onChange={(e) => setDraftOpacity(Number(e.target.value))}
                  className="slider-3d w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[7px] font-bold uppercase">
                  <span className="text-[#7DD3FC]">LIGHT &amp; SHADING</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#38bdf8]">{draftShading}%</span>
                    <button
                      type="button"
                      onClick={() => setDraftShading(0)}
                      className="px-1 rounded bg-[#1A202C] hover:bg-[#38bdf8] text-gray-300 hover:text-black text-[6.5px] cursor-pointer"
                      title="Revert Light & Shading to 0%"
                    >
                      0
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={draftShading}
                  onChange={(e) => setDraftShading(Number(e.target.value))}
                  className="slider-3d w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[7px] font-bold uppercase">
                  <span className="text-[#6EE7B7]">3D DROP SHADOW</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[#10B981]">{draftShadow}%</span>
                    <button
                      type="button"
                      onClick={() => setDraftShadow(0)}
                      className="px-1 rounded bg-[#1A202C] hover:bg-[#10B981] text-gray-300 hover:text-black text-[6.5px] cursor-pointer"
                      title="Revert 3D Drop Shadow to 0%"
                    >
                      0
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={draftShadow}
                  onChange={(e) => setDraftShadow(Number(e.target.value))}
                  className="slider-3d w-full"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSandboxMaterial}
              className="w-full py-1.5 px-2 rounded bg-gradient-to-b from-[#F7D154] to-[#DAA520] hover:from-[#FFE58F] hover:to-[#E5B225] text-black font-bold text-[8.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(218,165,32,0.35),inset_0_1px_0_rgba(255,255,255,0.65)] transition-all"
            >
              <Bookmark className="w-3 h-3" />
              <span>{savedNotice || 'SAVE THIS MATERIAL'}</span>
            </button>
          </div>

          {savedMaterials.length > 0 && (
            <div className="pt-1 border-t border-[#222A38] space-y-1">
              <span className="text-[7.5px] text-[#94A3B8] uppercase font-bold tracking-wider block">
                SAVED MATERIALS ({savedMaterials.length}) — CLICK TO LOAD
              </span>
              {savedMaterials.map((mat) => (
                <div
                  key={mat.id}
                  onClick={() => handleLoadSavedMaterial(mat)}
                  className="p-1.5 rounded bg-[#0E131B] hover:bg-[#161E2B] border border-[#222A38] hover:border-[#DAA520]/60 flex items-center justify-between gap-1.5 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-4 h-4 rounded border border-white/30 flex-shrink-0 shadow"
                      style={{ background: mat.surfaceCss }}
                    />
                    <span className="text-[8px] font-bold text-gray-200 truncate">{mat.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSavedMaterial(mat.id, e)}
                    className="text-[#64748b] hover:text-red-400 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {customPalettes.length > 0 && (
            <div className="pt-1.5 border-t border-[#222A38] space-y-1">
              <span className="text-[8px] text-[#94A3B8] uppercase font-bold tracking-wider block">
                SAVED PALETTES ({customPalettes.length})
              </span>
              {customPalettes.map(cp => {
                const isThisActive = activeSideView === 'CUSTOM' && activeCustomId === cp.id;
                return (
                  <div
                    key={cp.id}
                    onClick={() => handleSelectSideView('CUSTOM', cp.id)}
                    className={`w-full p-1.5 rounded text-[9px] font-bold border transition-all cursor-pointer flex items-center justify-between gap-1 ${
                      isThisActive
                        ? 'border-[#DAA520] text-white bg-[#DAA520]/15 shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
                        : 'border-[#222A38] text-[#C5BD9F] hover:border-[#DAA520]/50 bg-[#0E131B]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/40 flex-shrink-0"
                        style={{ background: cp.primary || cp.swatches[0]?.gradient }}
                      />
                      <span className="truncate">{cp.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExportCustomJson(cp); }}
                        className="text-[#64748b] hover:text-[#38bdf8] p-0.5 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCustomPalette(cp.id, e)}
                        className="text-[#64748b] hover:text-red-400 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeSideView === 'AFRICA' && (
            <button
              onClick={() => handleApplySuiteBindings(AFRICA_KEY_BINDINGS)}
              className="w-full py-1.5 px-2 bg-[#DAA520]/20 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520] rounded text-[8.5px] font-bold uppercase transition-all shadow-[0_6px_14px_rgba(0,0,0,0.6)] cursor-pointer"
            >
              APPLY AFRICA SUITE TO DOM
            </button>
          )}

          {activeSideView === 'CUSTOM' && activeCustomSuite && (
            <button
              onClick={() => handleApplySuiteBindings(activeCustomSuite.bindings)}
              className="w-full py-1.5 px-2 bg-[#DAA520]/20 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520] rounded text-[8.5px] font-bold uppercase transition-all shadow-[0_6px_14px_rgba(0,0,0,0.6)] cursor-pointer"
            >
              APPLY "{activeCustomSuite.name}"
            </button>
          )}

          <div className="mt-auto studio-3d-card border border-[#262F40] p-2 rounded flex flex-col gap-1">
            <span className="text-[7.5px] text-[#94A3B8] uppercase font-bold">ACTIVE DRAG SWATCH:</span>
            <div
              className="h-6 w-full rounded border border-white/30 shadow-[0_4px_10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.3)]"
              style={{ background: selectedMetal.gradient }}
            />
            <span className="text-[9px] text-white font-bold truncate">{selectedMetal.name}</span>
          </div>
        </div>
      </div>

      {/* 2. CENTER: BUILDER STUDIO, DEDICATED TEXTURES LIBRARY, OR SWATCH DECK */}
      <div className="flex-1 flex flex-col studio-3d-panel border border-[#262F40] rounded overflow-hidden">

        <div className="p-2.5 bg-gradient-to-b from-[#151A23] to-[#0B0E14] border-b border-[#222A38] flex justify-between items-center select-none gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[#DAA520] font-bold text-[10px] uppercase tracking-wider truncate drop-shadow">
              {activeSideView === 'AFRICA'
                ? 'AFRICA PALETTE (OCHRE & EARTH) //'
                : activeSideView === 'TEXTURES'
                ? `TEXTURES & WEAVES LIBRARY (${allTextures.length} ASSETS) //`
                : activeSideView === 'BUILDER'
                ? '3D MATERIAL & PALETTE STUDIO //'
                : activeSideView === 'CUSTOM' && activeCustomSuite
                ? `CUSTOM SUITE: ${activeCustomSuite.name} //`
                : 'HIGH FINANCE METALLICS //'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {activeSideView !== 'BUILDER' ? (
              <button
                onClick={() => handleSelectSideView('BUILDER')}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-[9.5px] font-mono font-bold bg-gradient-to-b from-[#F7D154] to-[#DAA520] hover:from-[#FFE58F] hover:to-[#E5B225] text-black uppercase tracking-wider cursor-pointer shadow-[0_4px_14px_rgba(218,165,32,0.45),inset_0_1px_0_rgba(255,255,255,0.65)] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>CREATE CUSTOM PALETTE</span>
              </button>
            ) : (
              <button
                onClick={() => handleSelectSideView('MASTER')}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-mono font-bold bg-[#14171C] hover:bg-[#1E242D] text-[#C5BD9F] border border-[#2B3545] uppercase cursor-pointer shadow"
              >
                <span>&larr; BACK TO SWATCHES</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="text-[9px] text-[#94A3B8] hover:text-[#DAA520] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              RESET
            </button>
            <button
              onClick={handleCopyContract}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer ${
                copiedContract
                  ? 'bg-[#047857]/25 text-[#10B981] border-[#047857]'
                  : 'bg-[#14171C] hover:bg-[#DAA520]/20 text-[#DAA520] border-[#DAA520]/50'
              }`}
            >
              {copiedContract ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-[#DAA520]" />}
              <span>{copiedContract ? 'COPIED' : 'COPY SPEC'}</span>
            </button>
          </div>
        </div>

        {/* MODE A: CUSTOM PALETTE + 3D MATERIAL PHYSICS STUDIO */}
        {activeSideView === 'BUILDER' ? (
          <form onSubmit={handleSaveCustomPalette} className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5 custom-scrollbar">
            <div className="studio-3d-card border border-[#242D3D] rounded p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#222A38] pb-1.5">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-[#DAA520]" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    1. NAME OR IMPORT PALETTE
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => paletteImportRef.current?.click()}
                  className="px-2 py-0.5 rounded bg-[#141923] border border-[#2B3545] hover:border-[#38bdf8] text-[#38bdf8] text-[8.5px] font-bold uppercase cursor-pointer shadow"
                >
                  + IMPORT COLORS (JSON / HEX)
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g., Tyrone Obsidian & Emerald"
                  className="flex-1 bg-[#090C10] border border-[#2B3545] focus:border-[#DAA520] rounded px-3 py-1.5 text-xs text-white outline-none font-mono shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleAutoHarmonize}
                  className="px-3 py-1.5 bg-[#DAA520]/20 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520] rounded text-[9.5px] font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  1-CLICK AUTO-HARMONIZE
                </button>
              </div>
            </div>

            <div className="studio-3d-card border border-[#242D3D] rounded p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#222A38] pb-1.5">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  2. PICK SHADE ON WHEEL &amp; CLICK OK TO LOCK IT IN
                </span>
                {confirmedSlot && (
                  <span className="text-[8.5px] font-bold text-[#10B981] bg-[#047857]/20 border border-[#047857] px-2 py-0.5 rounded">
                    ✓ {confirmedSlot} LOCKED IN AS ACTIVE SWATCH
                  </span>
                )}
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
                  const isOkNow = confirmedSlot === slot.label;
                  return (
                    <div
                      key={slot.label}
                      onDragOver={slot.dropZone ? handleDragOver : undefined}
                      onDrop={slot.dropZone ? (e) => handleBuilderTextureDrop(e, slot.dropZone) : undefined}
                      className={`bg-gradient-to-b from-[#171D28] to-[#0C0F15] border rounded p-1.5 flex flex-col gap-1 transition-all shadow-[0_6px_14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] ${
                        isOkNow
                          ? 'border-[#10B981] ring-2 ring-[#10B981]/50'
                          : hasTexHere
                          ? 'border-[#DAA520] shadow-[0_6px_16px_rgba(218,165,32,0.3)]'
                          : slot.dropZone
                          ? 'border-dashed border-[#334155] hover:border-[#DAA520]'
                          : 'border-[#232B3A]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[7.5px] font-bold text-[#DAA520] tracking-wider truncate">{slot.label}</span>
                        <button
                          type="button"
                          onClick={() => confirmColorSelection(slot.label, slot.val, slot.label)}
                          className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold uppercase cursor-pointer flex-shrink-0 transition-all ${
                            isOkNow
                              ? 'bg-[#10B981] text-black'
                              : 'bg-[#DAA520] hover:bg-[#FFE58F] text-black shadow'
                          }`}
                        >
                          {isOkNow ? '✓ OK' : 'OK'}
                        </button>
                      </div>
                      <label
                        className="relative h-8 w-full rounded border border-white/30 cursor-pointer overflow-hidden block shadow-[0_4px_10px_rgba(0,0,0,0.75),inset_0_1.5px_0_rgba(255,255,255,0.35)]"
                        style={{
                          background: hasTexHere
                            ? buildMaterialSurface(slot.val, draftTexture, draftOpacity, draftShading)
                            : buildMaterialSurface(slot.val, null, 0, 45)
                        }}
                      >
                        <input
                          type="color"
                          value={slot.val}
                          onChange={(e) => {
                            const nextHex = e.target.value.toUpperCase();
                            slot.set(nextHex);
                            setSelectedMetal({ id: `picked-${slot.label}`, name: `${slot.label} (${nextHex})`, gradient: nextHex });
                          }}
                          className="opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={slot.val}
                        onChange={(e) => slot.set(e.target.value)}
                        className="w-full bg-[#080B0F] border border-[#263042] rounded px-1 py-0.5 text-[8.5px] text-gray-200 font-mono text-center uppercase shadow-inner"
                      />
                      <span className="text-[7px] text-[#7D8DA6] text-center truncate">{slot.hint}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="studio-3d-card border border-[#242D3D] rounded p-2.5 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-[#222A38] pb-1.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#DAA520]" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    3. TEXTURE OVERLAY ({allTextures.length} WEAVES) + ZOOM, LIGHTING &amp; SHADOWS
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollWeaveStrip(-360)}
                    className="px-1.5 py-0.5 rounded bg-[#141923] border border-[#DAA520]/60 hover:bg-[#DAA520] text-[#DAA520] hover:text-black text-[8.5px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors shadow"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    PREV
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollWeaveStrip(360)}
                    className="px-1.5 py-0.5 rounded bg-[#141923] border border-[#DAA520]/60 hover:bg-[#DAA520] text-[#DAA520] hover:text-black text-[8.5px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors shadow"
                  >
                    MORE WEAVES
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => texInputRef.current?.click()}
                    className="px-2 py-0.5 rounded bg-[#DAA520]/15 border border-[#DAA520] hover:bg-[#DAA520] text-[#DAA520] hover:text-black text-[8.5px] font-bold uppercase cursor-pointer transition-colors shadow"
                  >
                    + UPLOAD WEAVE
                  </button>
                  {draftTexture && (
                    <button
                      type="button"
                      onClick={() => setDraftTexture(null)}
                      className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-gradient-to-b from-[#131822] to-[#0B0E14] border border-[#242D3D] rounded p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-bold text-[#FDE68A] uppercase">WEAVE ZOOM</span>
                    <span className="text-[8px] font-bold text-[#F7D154]">{weaveScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="220"
                    disabled={!draftTexture}
                    value={weaveScale}
                    onChange={(e) => setWeaveScale(Number(e.target.value))}
                    className="slider-3d w-full"
                  />
                  <div className="flex justify-between text-[6.5px] text-[#7D8DA6]">
                    <span>Fine/Sharp</span>
                    <span>Zoomed</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-bold text-[#F5D77F] uppercase">OPAQUENESS</span>
                    <span className="text-[8px] font-bold text-[#DAA520]">{draftTexture ? `${draftOpacity}%` : 'NO TEX'}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="92"
                    disabled={!draftTexture}
                    value={draftOpacity}
                    onChange={(e) => setDraftOpacity(Number(e.target.value))}
                    className="slider-3d w-full"
                  />
                  <div className="flex justify-between text-[6.5px] text-[#7D8DA6]">
                    <span>Soft Tint</span>
                    <span>Bold Weave</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-bold text-[#7DD3FC] uppercase">LIGHT &amp; SHADE</span>
                    <span className="text-[8px] font-bold text-[#38bdf8]">{draftShading}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draftShading}
                    onChange={(e) => setDraftShading(Number(e.target.value))}
                    className="slider-3d w-full"
                  />
                  <div className="flex justify-between text-[6.5px] text-[#7D8DA6]">
                    <span>Flat Panel</span>
                    <span>3D Sheen</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-bold text-[#6EE7B7] uppercase">3D SHADOW</span>
                    <span className="text-[8px] font-bold text-[#10B981]">{draftShadow}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={draftShadow}
                    onChange={(e) => setDraftShadow(Number(e.target.value))}
                    className="slider-3d w-full"
                  />
                  <div className="flex justify-between text-[6.5px] text-[#7D8DA6]">
                    <span>Flush Base</span>
                    <span>Deep Lift</span>
                  </div>
                </div>
              </div>

              <div
                ref={weaveStripRef}
                className="weave-gold-scroll flex gap-2 overflow-x-auto pb-2"
              >
                {allTextures.map((tex, idx) => {
                  const isSelectedTex = draftTexture?.name === tex.name;
                  const texUrl = getTextureSrc(tex);
                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleTextureDragStart(e, tex)}
                      onClick={() => {
                        setDraftTexture(tex);
                        setSandboxTexture(tex);
                      }}
                      className={`w-20 flex-shrink-0 rounded border p-1 flex flex-col gap-1 cursor-grab active:cursor-grabbing transition-all ${
                        isSelectedTex
                          ? 'border-[#DAA520] bg-[#DAA520]/20 shadow-[0_6px_14px_rgba(218,165,32,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
                          : 'border-[#232B3A] hover:border-[#DAA520]/70 bg-[#111620] shadow-[0_4px_10px_rgba(0,0,0,0.5)]'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={texUrl}
                          alt={tex.name}
                          loading="lazy"
                          className="w-full h-10 object-cover rounded border border-white/20 shadow"
                        />
                        {tex.pack === 'IMPORTED CUSTOM' && (
                          <span className="absolute top-0.5 left-0.5 bg-[#38bdf8] text-black text-[6.5px] font-bold px-1 rounded">
                            NEW
                          </span>
                        )}
                      </div>
                      <span className="text-[7.5px] text-gray-200 font-bold truncate block text-center">
                        {tex.name.replace(/\.[^/.]+$/, '')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleBuilderTextureDrop(e)}
              className="studio-3d-card border border-[#242D3D] hover:border-[#DAA520]/70 rounded p-2.5 flex flex-col gap-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                  4. LIVE 3D SURFACE &amp; SHADOW PREVIEW (DROP ANY WEAVE HERE)
                </span>
                <span className="text-[8px] text-[#10B981] font-bold uppercase">
                  ZOOM {weaveScale}% • OPAC {draftTexture ? draftOpacity : 0}% • SHADE {draftShading}% • SHADOW {draftShadow}%
                </span>
              </div>

              <div
                className="p-4 rounded-lg border border-white/20 transition-all shadow-[inset_0_3px_12px_rgba(0,0,0,0.75)]"
                style={previewBaseStyle}
              >
                <div
                  className="p-3.5 rounded-md border border-white/25 flex flex-col gap-2 transition-all"
                  style={previewCardStyle}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ color: draftText }}>
                      {draftName.trim() || 'Your Custom Brand & 3D Material Suite'}
                    </span>
                    <span
                      className="text-[8.5px] font-bold px-2 py-0.5 rounded shadow-[0_3px_8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.45)]"
                      style={{ backgroundColor: draftSecondary, color: '#080A0C' }}
                    >
                      {draftTexture ? `WEAVE: ${draftTexture.name}` : '3D SHADED SURFACE'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" style={{ color: draftText }}>
                    Real-time 3D view comparing your chosen color swabs, weave zoom/sharpness, top-edge light sheen, and floating card shadow.
                  </p>
                  <button
                    type="button"
                    className="self-start px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/30"
                    style={{ ...previewButtonStyle, color: '#080A0C' }}
                  >
                    SAMPLE 3D ACTION BUTTON
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-b from-[#F7D154] to-[#DAA520] hover:from-[#FFE58F] hover:to-[#E5B225] text-black font-bold text-[10px] rounded uppercase tracking-wider cursor-pointer shadow-[0_6px_18px_rgba(218,165,32,0.4),inset_0_1px_0_rgba(255,255,255,0.65)]"
                >
                  SAVE &amp; LOAD CUSTOM PALETTE
                </button>
              </div>
            </div>
          </form>
        ) : activeSideView === 'TEXTURES' ? (
          <div className="flex-1 p-2.5 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-[#222A38] mb-2.5">
              <div className="flex items-center gap-2">
                <Folder className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-[9.5px] font-bold text-[#38bdf8] uppercase">
                  SHARED TEXTURES &amp; WEAVES ({allTextures.length} ASSETS) — USE WITH ANY COLOR PALETTE
                </span>
              </div>
              <button
                type="button"
                onClick={() => texInputRef.current?.click()}
                className="text-[8px] bg-[#DAA520]/15 hover:bg-[#DAA520] text-[#DAA520] hover:text-black border border-[#DAA520] px-2 py-0.5 rounded font-bold uppercase cursor-pointer transition-colors"
              >
                + IMPORT WEAVE
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {allTextures.map((asset, idx) => {
                const imgUrl = getTextureSrc(asset);
                const isCopied = copiedAsset === asset.name;
                return (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleTextureDragStart(e, asset)}
                    onClick={() => setPreviewAsset(asset)}
                    className="studio-3d-card border border-[#222A38] hover:border-[#38bdf8] rounded p-1.5 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative w-11 h-11 rounded border border-[#38bdf8]/40 overflow-hidden bg-[#14171C] flex-shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.25)]">
                        <img
                          src={imgUrl}
                          alt={asset.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        />
                        <span className="absolute bottom-0.5 right-0.5 bg-black/75 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-2.5 h-2.5 text-[#38bdf8]" />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9.5px] font-bold text-gray-100 block truncate group-hover:text-[#38bdf8]">
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
                          ? 'bg-[#047857]/25 text-[#10B981] border-[#047857]'
                          : 'bg-[#14171C] hover:bg-[#38bdf8] hover:text-black text-[#C5BD9F] border-[#2B3545]'
                      }`}
                    >
                      {isCopied ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 p-2.5 overflow-y-auto grid grid-cols-4 gap-2 custom-scrollbar">
              <div
                onClick={() => handleSelectSideView('BUILDER')}
                className="border-2 border-dashed border-[#DAA520]/80 hover:border-[#FFE58F] bg-[#DAA520]/10 hover:bg-[#DAA520]/20 rounded flex flex-col justify-between overflow-hidden cursor-pointer transition-all select-none p-2 shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center gap-1.5 text-[#DAA520] font-bold text-[9.5px]">
                  <Plus className="w-4 h-4 flex-shrink-0" />
                  <span>NEW CUSTOM PALETTE</span>
                </div>
                <span className="text-[7.5px] text-[#C5BD9F] leading-tight">
                  Pick 5 colors + blend any weave texture
                </span>
              </div>

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
                        ? 'border-[#DAA520] shadow-[0_8px_18px_rgba(218,165,32,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] scale-[1.01]'
                        : 'border-[#232B3A] hover:border-[#64748b] bg-[#0E131B] shadow-[0_5px_12px_rgba(0,0,0,0.55)]'
                    }`}
                  >
                    <div
                      className="h-11 w-full p-1.5 flex items-start shadow-[inset_0_1.5px_0_rgba(255,255,255,0.28),inset_0_-2px_5px_rgba(0,0,0,0.55)]"
                      style={{ background: metal.gradient }}
                    >
                      <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-black/80 text-white shadow truncate">
                        {metal.name}
                      </span>
                    </div>
                    <div className="bg-[#0C0F15] px-2 py-1 flex justify-between items-center border-t border-[#1E2636]">
                      <span className="text-[7px] text-[#94A3B8] uppercase truncate">{metal.sub}</span>
                      <span className="text-[7px] text-[#DAA520] font-bold uppercase flex-shrink-0">&larr; DRAG</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#222A38] bg-[#0A0D12] p-2 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-bold text-[#38bdf8] uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  WEAVES &amp; TEXTURES ({allTextures.length}) — DRAG ONTO ANY COLOR OR SANDBOX
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectSideView('TEXTURES')}
                  className="text-[7.5px] text-[#DAA520] hover:underline font-bold uppercase cursor-pointer"
                >
                  OPEN FULL LIBRARY &rarr;
                </button>
              </div>
              <div className="weave-gold-scroll flex gap-1.5 overflow-x-auto pb-1.5">
                {allTextures.map((tex, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleTextureDragStart(e, tex)}
                    onClick={() => {
                      setSandboxTexture(tex);
                      setDraftTexture(tex);
                    }}
                    title={`Click or drag weave: ${tex.name}`}
                    className="w-16 flex-shrink-0 rounded border border-[#232B3A] hover:border-[#38bdf8] bg-[#111620] p-1 flex flex-col gap-0.5 cursor-grab active:cursor-grabbing"
                  >
                    <img
                      src={getTextureSrc(tex)}
                      alt={tex.name}
                      loading="lazy"
                      className="w-full h-8 object-cover rounded border border-white/15"
                    />
                    <span className="text-[6.5px] text-gray-300 truncate text-center">
                      {tex.name.replace(/\.[^/.]+$/, '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      {/* 3. RIGHT COLUMN: ACTION DROP TARGETS + FRAME / BORDER & READABLE OVERLAY STUDIO */}
      <div className="w-92 flex flex-col studio-3d-panel border border-[#262F40] rounded overflow-hidden flex-shrink-0">

        <div className="p-2.5 bg-gradient-to-b from-[#151A23] to-[#0B0E14] border-b border-[#222A38] flex justify-between items-center select-none">
          <span className="text-[10px] font-bold text-[#DAA520] uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#DAA520]" />
            UI DROP SHELF &amp; FRAME STUDIO
          </span>
          <span className="text-[8px] text-[#10B981] bg-[#047857]/20 px-1.5 py-0.5 rounded border border-[#047857]/50 font-bold">
            LIVE
          </span>
        </div>

        <div className="max-h-[42%] p-2 space-y-1.5 overflow-y-auto custom-scrollbar border-b border-[#222A38]">
          {bindings.map((b) => (
            <div
              key={b.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, b.key)}
              className="studio-3d-card border border-[#222A38] hover:border-[#DAA520] rounded p-1.5 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded border border-white/30 shadow-[0_4px_10px_rgba(0,0,0,0.75),inset_0_1.5px_0_rgba(255,255,255,0.35)] flex-shrink-0"
                  style={{ background: b.assignedValue }}
                />
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold text-gray-200 block leading-tight truncate">{b.label}</span>
                  <span className="text-[7.5px] text-[#94A3B8] truncate block">{b.description}</span>
                </div>
              </div>

              <button
                onClick={() => assignMetalToTarget(b.key, selectedMetal.gradient)}
                className="px-2 py-0.5 rounded bg-[#14171C] hover:bg-[#DAA520] text-[#94A3B8] hover:text-black border border-[#2B3545] text-[7.5px] font-bold transition-colors cursor-pointer shadow flex-shrink-0"
              >
                APPLY
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1 p-2.5 bg-gradient-to-b from-[#12161F] to-[#090C10] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#DAA520] uppercase flex items-center gap-1">
              <Frame className="w-3 h-3" />
              BORDER FRAME &amp; TEXT BACKDROP
            </span>
            <button
              type="button"
              onClick={handleCopyFrameSpec}
              className="text-[7.5px] px-2 py-0.5 rounded bg-[#141923] hover:bg-[#DAA520] text-[#C5BD9F] hover:text-black border border-[#2B3545] font-bold uppercase cursor-pointer"
            >
              {copiedFrameCss ? 'COPIED CSS' : 'COPY FRAME'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'PHOTO', label: 'PHOTO FRAME', icon: ImageIcon },
              { id: 'TEXT', label: 'TEXT BOX', icon: Type },
              { id: 'PAGE', label: 'PAGE BORDER', icon: Frame }
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFrameMode(m.id)}
                  className={`py-1 px-1.5 rounded text-[7.5px] font-bold border flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    frameMode === m.id
                      ? 'bg-[#DAA520] text-black border-[#FFE58F]'
                      : 'bg-[#0E131B] text-[#94A3B8] border-[#222A38] hover:text-white'
                  }`}
                >
                  <Icon className="w-2.5 h-2.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-1">
            <span className="text-[7.5px] text-[#94A3B8] uppercase font-bold">BORDER:</span>
            <div className="flex gap-1">
              {BORDER_PRESETS.map((preset, idx) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setBorderSizeIdx(idx)}
                  className={`px-1.5 py-0.5 rounded text-[7.5px] font-bold border cursor-pointer ${
                    borderSizeIdx === idx
                      ? 'bg-[#38bdf8] text-black border-[#bae6fd]'
                      : 'bg-[#0E131B] text-gray-300 border-[#232B3A]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[7.5px] font-bold uppercase">
              <span className="text-[#C5BD9F]">INNER TEXT / PHOTO BACKDROP</span>
              <span className="text-[#DAA520]">{innerBackdropOpacity}% DARK VEIL</span>
            </div>
            <input
              type="range"
              min="15"
              max="92"
              value={innerBackdropOpacity}
              onChange={(e) => setInnerBackdropOpacity(Number(e.target.value))}
              className="slider-3d w-full"
            />
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleSandboxDrop}
            className="rounded border border-white/20 transition-all"
            style={{
              ...frameOuterStyle,
              padding: `${visualBorderPx}px`,
              borderRadius: `${frameRadius}px`
            }}
          >
            <div
              className="rounded p-2.5 flex flex-col gap-1.5 border border-white/15"
              style={{
                backgroundColor: `rgba(10, 13, 18, ${(innerBackdropOpacity / 100).toFixed(2)})`,
                borderRadius: `${Math.max(4, frameRadius - 4)}px`
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[7.5px] font-bold text-[#DAA520] uppercase">
                  FRAME: {activeBorderPreset.label} ({frameMode})
                </span>
                {frameMode === 'PHOTO' && (
                  <button
                    type="button"
                    onClick={() => framePhotoInputRef.current?.click()}
                    className="text-[7px] px-1.5 py-0.5 rounded bg-[#DAA520]/20 text-[#FFE58F] border border-[#DAA520]/50 font-bold cursor-pointer"
                  >
                    + PHOTO
                  </button>
                )}
              </div>

              {frameMode === 'PHOTO' ? (
                <div className="flex items-center gap-2">
                  <img
                    src={framePhotoUrl}
                    alt="Framed sample"
                    className="w-14 h-12 object-cover rounded border border-white/25 flex-shrink-0 shadow"
                  />
                  <div className="min-w-0">
                    <div className="text-[9.5px] font-bold text-white leading-tight truncate">
                      Framed Photo Showcase
                    </div>
                    <div className="text-[7.5px] text-gray-300 leading-snug mt-0.5">
                      Woven {activeBorderPreset.label} border with readable backdrop.
                    </div>
                  </div>
                </div>
              ) : frameMode === 'TEXT' ? (
                <input
                  type="text"
                  value={frameTextContent}
                  onChange={(e) => setFrameTextContent(e.target.value)}
                  className="bg-black/45 border border-white/15 rounded px-2 py-1 text-[9.5px] font-bold text-white outline-none w-full"
                />
              ) : (
                <div className="text-[9px] font-bold text-white leading-snug">
                  Page / Document Frame ({activeBorderPreset.label} margin) — drop any swatch or weave directly onto this frame.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

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
                    setSandboxTexture(previewAsset);
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
                src={getTextureSrc(previewAsset)}
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
