import React, { useState } from 'react';
import { X, Upload, File } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (documentData: any) => Promise<void>;
  reservation: any;
}

const documentTypes = [
  'Supplier Confirmation',
  'Hotel Voucher',
  'Flight Ticket',
  'Tour Confirmation',
  'Transfer Voucher',
  'Insurance Document',
  'Visa Document',
  'Payment Receipt',
  'Other'
];

const mockExistingDocuments = [
  {
    id: 1,
    name: 'Hotel_Confirmation_Steigenberger.pdf',
    type: 'Supplier Confirmation',
    uploadedBy: 'Sarah Johnson',
    uploadDate: '2025-01-14T10:30:00Z',
    size: '245 KB'
  },
  {
    id: 2,
    name: 'Payment_Receipt_001.pdf',
    type: 'Payment Receipt',
    uploadedBy: 'Finance Team',
    uploadDate: '2025-01-13T16:45:00Z',
    size: '128 KB'
  }
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  reservation 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('Supplier Confirmation');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      return;
    }

    setIsLoading(true);
    try {
      const documentData = {
        file: selectedFile,
        type: documentType,
        description: description,
        reservationId: reservation.id,
        uploadedBy: 'Current User', // In real app, get from auth context
        uploadDate: new Date().toISOString()
      };

      await onSave(documentData);
      
      // Reset form
      setSelectedFile(null);
      setDocumentType('Supplier Confirmation');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Upload className="h-6 w-6 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Document - {reservation.id}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Form */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Upload New Document
                </h3>
                
                {/* Reservation Info */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                    Reservation Details
                  </h4>
                  <div className="text-sm text-purple-700 dark:text-purple-400">
                    <p><strong>Customer:</strong> {reservation.customer}</p>
                    <p><strong>Service:</strong> {reservation.tripItem}</p>
                    <p><strong>Supplier:</strong> {reservation.supplier}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Select
                    label="Document Type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select File *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleFileSelect}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, DOC, DOCX, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                    
                    {selectedFile && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add description or notes about this document..."
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
                      disabled={isLoading || !selectedFile}
                      loading={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </form>
              </div>

              {/* Existing Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Existing Documents
                </h3>
                <div className="space-y-3">
                  {mockExistingDocuments.map((doc) => (
                    <div key={doc.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doc.type} • {doc.size}
                            </p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                          Download
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Uploaded by {doc.uploadedBy} on {formatDate(doc.uploadDate)}
                      </div>
                    </div>
                  ))}
                  
                  {mockExistingDocuments.length === 0 && (
                    <div className="text-center py-8">
                      <File className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};