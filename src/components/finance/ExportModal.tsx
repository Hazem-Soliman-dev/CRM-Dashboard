import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, data }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeFields, setIncludeFields] = useState({
    basicInfo: true,
    paymentDetails: true,
    supplierInfo: true,
    profitAnalysis: true,
    invoiceHistory: false
  });

  const handleExport = () => {
    const exportData = {
      format: exportFormat,
      dateRange: dateRange === 'custom' ? { start: startDate, end: endDate } : dateRange,
      fields: includeFields,
      recordCount: data.length
    };
    
    console.log('Exporting financial data:', exportData);
    // Here you would implement the actual export logic
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Download className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Export Financial Data
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'excel', label: 'Excel', desc: 'Microsoft Excel format' },
                  { value: 'csv', label: 'CSV', desc: 'Comma-separated values' },
                  { value: 'pdf', label: 'PDF', desc: 'Portable document format' }
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setExportFormat(format.value)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      exportFormat === format.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{format.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{format.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Date Range
              </label>
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </Select>
              
              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Input
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Include Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Include Fields
              </label>
              <div className="space-y-2">
                {[
                  { key: 'basicInfo', label: 'Basic Information', desc: 'Booking ID, customer, service details' },
                  { key: 'paymentDetails', label: 'Payment Details', desc: 'Payment status, amounts, due dates' },
                  { key: 'supplierInfo', label: 'Supplier Information', desc: 'Supplier costs and payment status' },
                  { key: 'profitAnalysis', label: 'Profit Analysis', desc: 'Profit amounts and margins' },
                  { key: 'invoiceHistory', label: 'Invoice History', desc: 'Invoice details and status' }
                ].map((field) => (
                  <label key={field.key} className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={includeFields[field.key as keyof typeof includeFields]}
                      onChange={(e) => setIncludeFields(prev => ({
                        ...prev,
                        [field.key]: e.target.checked
                      }))}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {field.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {field.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Export Summary
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <div>Format: {exportFormat.toUpperCase()}</div>
                <div>Date Range: {dateRange === 'custom' ? `${startDate} to ${endDate}` : dateRange}</div>
                <div>Records: {data.length} bookings</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};