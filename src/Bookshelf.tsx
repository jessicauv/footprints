import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  query,
  where,
  writeBatch
} from 'firebase/firestore';

interface Journal {
  id: string;
  title: string;
  createdAt: Date;
  description?: string;
  color?: string;
}

interface BookshelfProps {
  onJournalClick: (journal: Journal) => void;
}

const Bookshelf: React.FC<BookshelfProps> = ({ onJournalClick }) => {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedJournals, setSelectedJournals] = useState<Set<string>>(new Set());
  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalDescription, setNewJournalDescription] = useState('');

  const bookColors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#DEB887', '#F4A460', '#D2B48C'];

  // Load journals from Firestore on component mount
  useEffect(() => {
    if (!user) return;

    const loadJournals = async () => {
      try {
        const journalsRef = collection(db, 'journals');
        const q = query(journalsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const loadedJournals: Journal[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedJournals.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            createdAt: data.createdAt.toDate(),
            color: data.color,
          });
        });

        setJournals(loadedJournals);
      } catch (error) {
        console.error('Error loading journals:', error);
      }
    };

    loadJournals();
  }, [user]);

  const createJournal = async () => {
    if (!newJournalTitle.trim() || !user) return;

    try {
      const journalData = {
        title: newJournalTitle.trim(),
        description: newJournalDescription.trim(),
        createdAt: new Date(),
        color: bookColors[Math.floor(Math.random() * bookColors.length)],
        userId: user.uid,
      };

      const docRef = await addDoc(collection(db, 'journals'), journalData);

      const newJournal: Journal = {
        id: docRef.id,
        ...journalData,
        createdAt: journalData.createdAt,
      };

      setJournals([...journals, newJournal]);
      setNewJournalTitle('');
      setNewJournalDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating journal:', error);
    }
  };



  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedJournals(new Set()); // Clear selections when toggling
  };

  const toggleJournalSelection = (journalId: string) => {
    if (!isEditMode) return;

    const newSelected = new Set(selectedJournals);
    if (newSelected.has(journalId)) {
      newSelected.delete(journalId);
    } else {
      newSelected.add(journalId);
    }
    setSelectedJournals(newSelected);
  };

  const deleteSelectedJournals = async () => {
    if (selectedJournals.size === 0) return;

    try {
      const batch = writeBatch(db);

      selectedJournals.forEach(journalId => {
        const journalRef = doc(db, 'journals', journalId);
        batch.delete(journalRef);
      });

      await batch.commit();

      setJournals(journals.filter(journal => !selectedJournals.has(journal.id)));
      setSelectedJournals(new Set());
      setIsEditMode(false);
    } catch (error) {
      console.error('Error deleting selected journals:', error);
    }
  };

  return (
    <div className="bookshelf">
      <div className="bookshelf-header">
        <h2>My Journals</h2>
        <div className="header-buttons">
          {journals.length > 0 && (
            <button
              onClick={toggleEditMode}
              className={`edit-journals-btn ${isEditMode ? 'active' : ''}`}
            >
              {isEditMode ? 'Cancel Edit' : 'Edit Journals'}
            </button>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            className="create-journal-btn"
          >
            + New Journal
          </button>
        </div>
      </div>

      {isEditMode && (
        <div className="edit-mode-bar">
          <span className="edit-instruction">
            Select journals to delete ({selectedJournals.size} selected)
          </span>
          <button
            onClick={deleteSelectedJournals}
            className="delete-selected-btn"
            disabled={selectedJournals.size === 0}
          >
            Delete Selected ({selectedJournals.size})
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="create-journal-modal">
          <div className="modal-content">
            <h3>Create New Journal</h3>
            <div className="form-group">
              <label htmlFor="journal-title">Title:</label>
              <input
                type="text"
                id="journal-title"
                value={newJournalTitle}
                onChange={(e) => setNewJournalTitle(e.target.value)}
                placeholder="Enter journal title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="journal-description">Description (optional):</label>
              <textarea
                id="journal-description"
                value={newJournalDescription}
                onChange={(e) => setNewJournalDescription(e.target.value)}
                placeholder="Enter journal description"
                rows={3}
                maxLength={100}
              />
            </div>
            <div className="modal-actions">
              <button onClick={createJournal} className="create-btn">
                Create Journal
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="actual-bookshelf">
        <div className="floating-shelf"></div>
        <div className="books-on-shelf">
          {journals.length === 0 ? (
            <div className="empty-shelf-message">
              <p>No journals yet. Create your first journal to get started!</p>
            </div>
          ) : (
            journals.map((journal) => (
              <div
                key={journal.id}
                className={`book-front ${isEditMode ? 'edit-mode' : ''} ${selectedJournals.has(journal.id) ? 'selected' : ''}`}
                onClick={() => isEditMode ? toggleJournalSelection(journal.id) : onJournalClick(journal)}
                style={{
                  backgroundColor: journal.color || '#8B4513',
                  cursor: isEditMode ? 'pointer' : 'pointer',
                }}
              >
                <div className="book-spine-front"></div>
                <div className="book-cover">
                  <div className="book-title-front">{journal.title}</div>
                </div>
                <div className="book-pages-front"></div>

                {isEditMode && (
                  <div className={`selection-indicator ${selectedJournals.has(journal.id) ? 'selected' : ''}`}>
                    {selectedJournals.has(journal.id) ? '✓' : ''}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>


    </div>
  );
};

export default Bookshelf;
