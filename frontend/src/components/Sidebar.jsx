import { useState } from 'react';
import { FolderPlus, Hash, Inbox, Archive, Trash2, Edit2, LogOut } from 'lucide-react';

function Sidebar({
  categories,
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  onOpenCategoryModal,
  onEditCategory,
  onDeleteCategory,
  onLogout
}) {
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleSaveEdit = async (catId) => {
    if (!editingCategoryName.trim()) {
      setEditingCategoryId(null);
      return;
    }
    await onEditCategory(catId, { name: editingCategoryName.trim() });
    setEditingCategoryId(null);
  };

  return (
    <aside className="w-72 bg-slate-900/50 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-6 flex-1 flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2 mb-8">
          <img src="/logo.svg" alt="logo" className="w-8 h-8 rounded-xl object-contain" /> Bootleg Keep
        </h1>

        <div className="space-y-1 mb-8">
          <button
            onClick={() => { setActiveTab('active'); setSelectedCategory(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'active' && !selectedCategory
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Inbox size={20} />
            <span className="font-medium">My Notes</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('archived'); setSelectedCategory(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === 'archived' && !selectedCategory
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Archive size={20} />
            <span className="font-medium">Archived</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</h2>
          <button
            onClick={onOpenCategoryModal}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="New Category"
          >
            <FolderPlus size={18} />
          </button>
        </div>

        <div className="space-y-1 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                selectedCategory?.id === cat.id
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
              onClick={() => {
                if (editingCategoryId !== cat.id) {
                  setSelectedCategory(cat);
                }
              }}
            >
              {editingCategoryId === cat.id ? (
                <div className="flex items-center gap-2 flex-1 mr-2" onClick={(e) => e.stopPropagation()}>
                  <Hash size={16} className="shrink-0 opacity-50 text-indigo-400" />
                  <input
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(cat.id);
                      } else if (e.key === 'Escape') {
                        setEditingCategoryId(null);
                      }
                    }}
                    onBlur={() => handleSaveEdit(cat.id)}
                    className="w-full bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-slate-100 text-sm focus:outline-none"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 truncate">
                  <Hash size={16} className="shrink-0 opacity-50" />
                  <span className="truncate">{cat.name}</span>
                </div>
              )}

              {editingCategoryId !== cat.id && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategoryId(cat.id);
                      setEditingCategoryName(cat.name);
                    }}
                    className="p-1 text-slate-500 hover:text-indigo-400 rounded transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCategory(cat.id);
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors rounded"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-slate-500 italic px-3 py-2">No categories yet.</p>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-xl transition-all duration-200 border border-slate-800 hover:border-slate-700/50"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
