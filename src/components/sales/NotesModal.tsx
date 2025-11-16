import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../ui/Pagination';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => Promise<void>;
  caseData: any;
}

const mockExistingNotes = [
  {
    id: 1,
    content: 'Customer prefers morning flights and 4-star hotels. Budget is flexible.',
    author: 'Sarah Johnson',
    timestamp: '2025-01-15T10:30:00Z',
    type: 'internal'
  },
  {
    id: 2,
    content: 'Discussed package options. Customer interested in Nile cruise extension.',
    author: 'Mike Chen',
    timestamp: '2025-01-14T16:45:00Z',
    type: 'internal'
  },
  {
    id: 3,
    content: 'Customer requested vegetarian meal options for all flights.',
    author: 'Sarah Johnson',
    timestamp: '2025-01-13T09:15:00Z',
    type: 'requirement'
  }
];

export const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, onSave, caseData }) => {
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalNotes, setTotalNotes] = useState(0);
  const { page, perPage, offset, pageCount, setPage } = usePagination({
    perPage: 3,
    total: totalNotes
  });

  // Effects must be declared before any conditional returns to preserve hook order
  React.useEffect(() => {
    setTotalNotes(mockExistingNotes.length);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(newNote);
      setNewNote('');
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !caseData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notes - {caseData.id}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Case Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Case Information
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-400">
                <p><strong>Customer:</strong> {caseData.customer}</p>
                <p><strong>Status:</strong> {caseData.status}</p>
                <p><strong>Type:</strong> {caseData.type}</p>
              </div>
            </div>

            {/* Existing Notes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Existing Notes
              </h3>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {mockExistingNotes.slice(offset, offset + perPage).map((note) => (
                  <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          note.type === 'internal' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                        }`}>
                          {note.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(note.timestamp)}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{note.content}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {note.author}
                    </p>
                  </div>
                ))}
              </div>
              <Pagination
                page={page}
                pageCount={pageCount}
                perPage={perPage}
                total={totalNotes}
                onPageChange={(p) => setPage(p)}
                compact
              />
            </div>

            {/* Add New Note */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add New Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your note here..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !newNote.trim()}
                  loading={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};