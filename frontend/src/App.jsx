import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import NoteModal from './components/NoteModal';
import CategoryModal from './components/CategoryModal';
import Login from './pages/Login';
import * as api from './services/api';
import { useAuth } from './context/AuthContext';
import { LogOut } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function MainApp() {
  const { logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await api.getNotes(activeTab, selectedCategory?.id, search);
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [activeTab, selectedCategory, search]);

  const handleSaveNote = async (noteData) => {
    if (editingNote) {
      await api.updateNote(editingNote.id, noteData);
    } else {
      await api.createNote(noteData);
    }
    fetchNotes();
    setIsNoteModalOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await api.deleteNote(id);
      fetchNotes();
    }
  };

  const handleToggleArchive = async (note) => {
    await api.updateNote(note.id, { isArchived: !note.isArchived });
    fetchNotes();
  };

  const handleTogglePin = async (note) => {
    await api.updateNote(note.id, { isPinned: !note.isPinned });
    fetchNotes();
  };

  const handleSaveCategory = async (categoryData) => {
    await api.createCategory(categoryData);
    fetchCategories();
    setIsCategoryModalOpen(false);
  };

  const handleEditCategory = async (id, data) => {
    try {
      await api.updateCategory(id, data);
      fetchCategories();
      if (selectedCategory?.id === id) {
        setSelectedCategory(prev => ({ ...prev, ...data }));
      }
      fetchNotes(); // reload notes to reflect updated category name in note tags
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await api.deleteCategory(id);
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }
      fetchCategories();
      fetchNotes(); // re-fetch to reflect changes
    }
  };

  const handleToggleNoteCategory = async (noteId, category, isAdding) => {
    if (isAdding) {
      await api.addCategoryToNote(noteId, category.id);
    } else {
      await api.removeCategoryFromNote(noteId, category.id);
    }
    fetchNotes(); // Refresh to get updated relations
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="flex h-full w-full relative">
        <Sidebar
          categories={categories}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onLogout={logout}
        />
        
        <div className="flex-1 flex flex-col relative">
          <MainContent
            notes={notes}
            loading={loading}
            activeTab={activeTab}
            selectedCategory={selectedCategory}
            search={search}
            onSearch={setSearch}
            onOpenNoteModal={(note = null) => {
              setEditingNote(note);
              setIsNoteModalOpen(true);
            }}
            onDeleteNote={handleDeleteNote}
            onToggleArchive={handleToggleArchive}
            onTogglePin={handleTogglePin}
            categories={categories}
            onToggleNoteCategory={handleToggleNoteCategory}
          />
        </div>
      </div>

      {isNoteModalOpen && (
        <NoteModal
          note={editingNote}
          categories={categories}
          onClose={() => {
            setIsNoteModalOpen(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
