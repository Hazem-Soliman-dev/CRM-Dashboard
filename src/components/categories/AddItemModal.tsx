import React, { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: any) => Promise<void>;
  suppliers: any[];
  onAddSupplier: () => void;
}

const categoryTypes = [
  'Hotel', 'Hostel', 'Apartment', 'Trip Package', 'Tour', 'Activities', 
  'Car Rental', 'Transportation', 'Events', 'Cruise', 'Boat', 'Diving', 
  'Aqua Park', 'Day Trip'
];

const priceUnits = {
  'Hotel': ['per night', 'per week', 'per month'],
  'Hostel': ['per night', 'per week'],
  'Apartment': ['per night', 'per week', 'per month'],
  'Trip Package': ['per person', 'per trip', 'per group'],
  'Tour': ['per person', 'per group'],
  'Activities': ['per person', 'per group', 'per hour'],
  'Car Rental': ['per day', 'per week', 'per month'],
  'Transportation': ['per person', 'per trip', 'per km'],
  'Events': ['per person', 'per event'],
  'Cruise': ['per person', 'per cabin'],
  'Boat': ['per person', 'per hour', 'per day'],
  'Diving': ['per person', 'per dive'],
  'Aqua Park': ['per person', 'per day'],
  'Day Trip': ['per person', 'per group']
};

const statuses = ['Available', 'Booked', 'Inactive'];

export const AddItemModal: React.FC<AddItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  suppliers,
  onAddSupplier 
}) => {
  const [formData, setFormData] = useState({
    categoryType: 'Hotel',
    name: '',
    description: '',
    price: '',
    priceUnit: 'per night',
    supplierId: '',
    status: 'Available',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.supplierId) {
      newErrors.supplierId = 'Supplier is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      const itemData = {
        ...formData,
        price: Number(formData.price),
        supplierName: supplier?.name || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(itemData);
      
      // Reset form
      setFormData({
        categoryType: 'Hotel',
        name: '',
        description: '',
        price: '',
        priceUnit: 'per night',
        supplierId: '',
        status: 'Available',
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (categoryType: string) => {
    const availableUnits = priceUnits[categoryType as keyof typeof priceUnits] || ['per item'];
    setFormData(prev => ({ 
      ...prev, 
      categoryType,
      priceUnit: availableUnits[0]
    }));
  };

  if (!isOpen) return null;

  const availablePriceUnits = priceUnits[formData.categoryType as keyof typeof priceUnits] || ['per item'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Item
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Category Type *"
                value={formData.categoryType}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categoryTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

              <Input
                label="Item Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="Enter item name"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter item description"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
                )}
              </div>

              <Input
                label="Price *"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={errors.price}
                placeholder="Enter price"
              />

              <Select
                label="Price Unit"
                value={formData.priceUnit}
                onChange={(e) => handleInputChange('priceUnit', e.target.value)}
              >
                {availablePriceUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </Select>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supplier *
                </label>
                <div className="flex space-x-2">
                  <Select
                    value={formData.supplierId}
                    onChange={(e) => handleInputChange('supplierId', e.target.value)}
                    error={errors.supplierId}
                    className="flex-1"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onAddSupplier}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.supplierId && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.supplierId}</p>
                )}
              </div>

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes about this item..."
              />
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                disabled={isLoading}
                loading={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Item
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};