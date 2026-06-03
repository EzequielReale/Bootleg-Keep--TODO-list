import { useState, useEffect } from 'react';
import { Plus, Loader2, Search } from 'lucide-react';
import NoteCard from './NoteCard';

function MainContent({
  notes,
  loading,
  activeTab,
  selectedCategory,
  search,
  onSearch,
  onOpenNoteModal,
  onDeleteNote,
  onToggleArchive,
  onTogglePin,
  categories,
  onToggleNoteCategory
}) {
  const [colCount, setColCount] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColCount(4);      // xl
      else if (width >= 1024) setColCount(3); // lg
      else if (width >= 768) setColCount(2);  // md
      else setColCount(1);                    // sm / default
    };

    handleResize(); // run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getHeaderTitle = () => {
    if (selectedCategory) return `Notes in #${selectedCategory.name}`;
    return activeTab === 'active' ? 'My Notes' : 'Archived Notes';
  };

  // Distribute notes round-robin across the columns
  const columns = Array.from({ length: colCount }, () => []);
  notes.forEach((note, index) => {
    columns[index % colCount].push(note);
  });

  return (
    <main className="flex-1 flex flex-col h-full bg-slate-900 overflow-y-auto">
      <header className="sticky top-0 z-10 glass px-8 py-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            {getHeaderTitle()}
            {loading && notes.length > 0 && (
              <Loader2 className="animate-spin text-indigo-400" size={18} />
            )}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} found
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by title or content..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        
        <button
          onClick={() => onOpenNoteModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 shrink-0"
        >
          <Plus size={20} />
          Create Note
        </button>
      </header>

      <div className="p-8">
        {loading && notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-800/20 rounded-3xl border border-slate-800/50 border-dashed">
            <div className="p-4 bg-slate-800 rounded-full mb-4">
              <Plus size={32} className="text-slate-400" />
            </div>
            <p className="text-lg">No notes found.</p>
            <p className="text-sm mt-1">Create a new one to get started!</p>
          </div>
        ) : (
          <div className={`flex gap-6 w-full items-start transition-opacity duration-200 ${
            loading ? 'opacity-50 pointer-events-none' : ''
          }`}>
            {columns.map((colNotes, colIdx) => (
              <div key={colIdx} className="flex-1 flex flex-col gap-6 min-w-0">
                {colNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => onOpenNoteModal(note)}
                    onDelete={() => onDeleteNote(note.id)}
                    onToggleArchive={() => onToggleArchive(note)}
                    onTogglePin={() => onTogglePin(note)}
                    allCategories={categories}
                    onToggleCategory={(category, isAdding) => onToggleNoteCategory(note.id, category, isAdding)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default MainContent;
