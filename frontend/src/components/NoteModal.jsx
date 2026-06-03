import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function NoteModal({ note, categories = [], onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedCategoryIds(note.categories?.map(c => c.id) || []);
    } else {
      setTitle('');
      setContent('');
      setSelectedCategoryIds([]);
    }
    setError('');
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setError('');
    setIsSaving(true);
    try {
      await onSave({ title, content, categoryIds: selectedCategoryIds });
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message;
      if (Array.isArray(serverMessage)) {
        setError(serverMessage.join(', '));
      } else if (typeof serverMessage === 'string') {
        setError(serverMessage);
      } else {
        setError('An error occurred while saving the note.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100">
            {note ? 'Edit Note' : 'Create Note'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
              <span className="font-semibold shrink-0">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="title" className="block text-sm font-medium text-slate-400">Title</label>
                <span className={`text-xs ${title.length >= 240 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {title.length}/255
                </span>
              </div>
              <input
                id="title"
                type="text"
                maxLength={255}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give it a title..."
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                autoFocus
                disabled={isSaving}
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-400 mb-1">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={6}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-900/30 border border-slate-700/50 rounded-xl">
                {categories.map(cat => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cat.id));
                        } else {
                          setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700/80 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      #{cat.name}
                    </button>
                  );
                })}
                {categories.length === 0 && (
                  <span className="text-xs text-slate-500 p-1">No categories created yet.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim() || !content.trim()}
              className="px-5 py-2.5 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteModal;
