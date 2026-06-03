import { useState, useRef, useEffect } from 'react';
import { Archive, ArchiveRestore, Edit2, Trash2, Tag, Check, Pin, X } from 'lucide-react';

function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleArchive,
  onTogglePin,
  allCategories,
  onToggleCategory
}) {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasCategory = (categoryId) => {
    return note.categories?.some(c => c.id === categoryId);
  };

  return (
    <div className={`group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 flex flex-col h-64 relative ${showCategoryDropdown ? 'z-20' : ''}`}>
      
      {/* Header Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
        {/* Pin button (always visible if pinned, otherwise visible on hover) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1.5 rounded transition-all duration-200 ${
            note.isPinned 
              ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 opacity-100' 
              : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700 opacity-0 group-hover:opacity-100'
          }`}
          title={note.isPinned ? "Unpin note" : "Pin note"}
        >
          <Pin size={16} fill={note.isPinned ? "currentColor" : "none"} />
        </button>

        {/* Hover-only actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/80 p-0.5 rounded-lg backdrop-blur-md">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onToggleArchive}
            className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-700 rounded transition-colors"
            title={note.isArchived ? "Unarchive" : "Archive"}
          >
            {note.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-2 truncate pr-20">{note.title}</h3>
      <p className="text-slate-400 text-sm flex-1 overflow-hidden line-clamp-6 leading-relaxed whitespace-pre-wrap">
        {note.content}
      </p>
      
      {/* Footer / Tags */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap items-center gap-2 relative">
        {note.categories?.map(cat => (
          <span key={cat.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md">
            #{cat.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCategory(cat, false);
              }}
              className="text-indigo-400/50 hover:text-red-400 hover:bg-red-400/10 p-0.5 rounded transition-all"
              title={`Remove ${cat.name}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-md transition-colors border border-dashed border-slate-600 hover:border-slate-500"
            title="Add tag"
          >
            <Tag size={14} />
          </button>
          
          {showCategoryDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-20 max-h-48 overflow-y-auto custom-scrollbar">
              {allCategories.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">No categories available</div>
              ) : (
                allCategories.map(cat => {
                  const isSelected = hasCategory(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCategory(cat, !isSelected);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-700 transition-colors"
                    >
                      <span className={isSelected ? 'text-indigo-400 font-medium' : 'text-slate-300'}>
                        {cat.name}
                      </span>
                      {isSelected && <Check size={14} className="text-indigo-400" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
