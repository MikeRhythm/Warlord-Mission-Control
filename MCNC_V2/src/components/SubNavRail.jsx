import React from 'react';
import { ArrowLeft, ChevronRight, Pin } from 'lucide-react';

export default function SubNavRail({
  title = "EXEC CONTROL",
  categories = [],
  activeCategory = null,
  onSelectCategory,
  onBack,
  renderSubPanel,
  isPinned = false,
  onTogglePin
}) {
  const currentCategoryObj = categories.find(c => c.id === activeCategory);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0c0e] text-[#e2e8f0] font-mono text-[11px] select-none overflow-hidden border-r border-[#1f242d]">
      
      {/* HEADER BAR */}
      <div className="flex items-center justify-between px-2.5 py-2 bg-[#0d1013] border-b border-[#1f242d] min-h-[38px] flex-shrink-0">
        {activeCategory ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[#ffb800] hover:text-[#fef08a] font-bold text-[10px] tracking-wider cursor-pointer bg-transparent border-none p-0 outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="truncate">ROOT // {currentCategoryObj ? currentCategoryObj.label : 'MENU'}</span>
          </button>
        ) : (
          <span className="text-[#ffb800] font-bold text-xs tracking-wider uppercase">
            {title}
          </span>
        )}

        {onTogglePin && (
          <button
            onClick={onTogglePin}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider border cursor-pointer transition-colors ${
              isPinned
                ? 'bg-[#10b981]/15 border-[#10b981]/50 text-[#10b981]'
                : 'bg-[#14171c] border-[#1f242d] text-[#64748b] hover:text-white'
            }`}
          >
            {isPinned ? 'PINNED' : 'PIN'}
          </button>
        )}
      </div>

      {/* VIEWPORT AREA */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {!activeCategory ? (
          categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group flex items-center justify-between p-2 rounded bg-[#0d1013] hover:bg-[#14181f] border border-[#191e26] hover:border-[#ffb800]/50 cursor-pointer transition-all shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {Icon && (
                    <div className="p-1 rounded bg-[#ffb800]/10 border border-[#ffb800]/30 text-[#ffb800] group-hover:border-[#ffb800] flex-shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-[#e2e8f0] group-hover:text-white text-[10px] truncate leading-tight">
                      {cat.label}
                    </div>
                    {cat.subtext && (
                      <div className="text-[8px] text-[#64748b] truncate leading-tight mt-0.5">
                        {cat.subtext}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                  {cat.badge && (
                    <span className="text-[8px] bg-[#141820] text-[#38bdf8] border border-[#1f2836] px-1 py-0.2 rounded font-bold">
                      {cat.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3 h-3 text-[#475569] group-hover:text-[#ffb800]" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col h-full space-y-2">
            {renderSubPanel(activeCategory)}
          </div>
        )}
      </div>
    </div>
  );
}