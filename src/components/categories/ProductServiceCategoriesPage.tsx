import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Link, ChevronDown, ChevronUp, Package, Plane, MapPin, Car, Calendar, Ship, Waves, Droplets, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { usePermissions } from '../../hooks/usePermissions';
import { RoleGuard } from '../auth/RoleGuard';
import { ActionGuard } from '../auth/ActionGuard';
import { AddItemModal } from './AddItemModal';
import { ViewItemModal } from './ViewItemModal';
import { EditItemModal } from './EditItemModal';
import { LinkedBookingsModal } from './LinkedBookingsModal';
import { AddSupplierModal } from './AddSupplierModal';
import { useToastContext } from '../../contexts/ToastContext';
import itemService from '../../services/itemService';
import supplierService from '../../services/supplierService';
import categoryService from '../../services/categoryService';
import { Item } from '../../services/itemService';
import { Supplier } from '../../services/supplierService';
import { Category } from '../../services/categoryService';

// Legacy mock data structure for reference - will be replaced with API data
const mockItems = [
  {
    id: 'ITEM-001',
    categoryType: 'Hotel',
    name: 'Steigenberger Luxor Hotel',
    description: '5-star luxury hotel, Nile view, full board',
    price: 180,
    priceUnit: 'per night',
    supplierId: 'SUP-001',
    supplierName: 'Steigenberger Hotels',
    status: 'Available',
    linkedBookings: 3,
    notes: 'Premium location with excellent amenities',
    createdAt: '2024-01-15'
  },
  {
    id: 'ITEM-002',
    categoryType: 'Hotel',
    name: 'Hilton Aswan Resort',
    description: '4-star resort, pool, half board',
    price: 120,
    priceUnit: 'per night',
    supplierId: 'SUP-002',
    supplierName: 'Hilton Hotels',
    status: 'Booked',
    linkedBookings: 7,
    notes: 'Popular family destination',
    createdAt: '2024-01-10'
  },
  {
    id: 'ITEM-003',
    categoryType: 'Trip Package',
    name: 'CAI-LXR Economy',
    description: 'Cairo to Luxor, EgyptAir MS123, Economy class',
    price: 85,
    priceUnit: 'per person',
    supplierId: 'SUP-003',
    supplierName: 'EgyptAir',
    status: 'Available',
    linkedBookings: 5,
    notes: 'Direct flight, 1.5 hours',
    createdAt: '2024-01-12'
  },
  {
    id: 'ITEM-004',
    categoryType: 'Tour',
    name: 'Valley of Kings Tour',
    description: 'Full day tour, 3 tombs, guide included',
    price: 45,
    priceUnit: 'per person',
    supplierId: 'SUP-004',
    supplierName: 'Memphis Tours',
    status: 'Available',
    linkedBookings: 12,
    notes: 'Most popular tour package',
    createdAt: '2024-01-08'
  },
  {
    id: 'ITEM-005',
    categoryType: 'Activities',
    name: 'Nile Felucca Ride',
    description: '2-hour sunset sailing, traditional boat',
    price: 25,
    priceUnit: 'per person',
    supplierId: 'SUP-005',
    supplierName: 'Local Operators',
    status: 'Available',
    linkedBookings: 8,
    notes: 'Romantic sunset experience',
    createdAt: '2024-01-05'
  }
];

const mockSuppliers = [
  { id: 'SUP-001', name: 'Steigenberger Hotels', type: 'Hotel', email: 'contact@steigenberger.com', phone: '+20-123-456-789', location: 'Luxor, Egypt' },
  { id: 'SUP-002', name: 'Hilton Hotels', type: 'Hotel', email: 'reservations@hilton.com', phone: '+20-987-654-321', location: 'Aswan, Egypt' },
  { id: 'SUP-003', name: 'EgyptAir', type: 'Airline', email: 'booking@egyptair.com', phone: '+20-555-123-456', location: 'Cairo, Egypt' },
  { id: 'SUP-004', name: 'Memphis Tours', type: 'Tour Operator', email: 'info@memphistours.com', phone: '+20-111-222-333', location: 'Luxor, Egypt' },
  { id: 'SUP-005', name: 'Local Operators', type: 'Activity Provider', email: 'info@localops.com', phone: '+20-444-555-666', location: 'Aswan, Egypt' }
];

const categoryTypes = [
  'Hotel', 'Hostel', 'Apartment', 'Trip Package', 'Tour', 'Activities', 
  'Car Rental', 'Transportation', 'Events', 'Cruise', 'Boat', 'Diving', 
  'Aqua Park', 'Day Trip'
];

const categoryIcons = {
  'Hotel': Package,
  'Hostel': Package,
  'Apartment': Package,
  'Trip Package': Plane,
  'Tour': MapPin,
  'Activities': Sun,
  'Car Rental': Car,
  'Transportation': Car,
  'Events': Calendar,
  'Cruise': Ship,
  'Boat': Ship,
  'Diving': Droplets,
  'Aqua Park': Waves,
  'Day Trip': MapPin
};

const categoryDistribution = [
  { category: 'Hotels', count: 74, percentage: 30 },
  { category: 'Flights', count: 58, percentage: 23 },
  { category: 'Tours', count: 45, percentage: 18 },
  { category: 'Activities', count: 38, percentage: 15 },
  { category: 'Transportation', count: 32, percentage: 13 }
];

export const ProductServiceCategoriesPage: React.FC = () => {
  const { canPerformAction } = usePermissions();
  const toast = useToastContext();
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Hotel', 'Trip Package', 'Tour']);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkedBookingsModalOpen, setIsLinkedBookingsModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, suppliersData, categoriesData] = await Promise.all([
        itemService.getAllItems(),
        supplierService.getAllSuppliers(),
        categoryService.getAllCategories()
      ]);
      // Ensure items is always an array
      setItems(Array.isArray(itemsData) ? itemsData : []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error('Error loading items and suppliers:', error);
      toast.error('Error', error.userMessage || 'Failed to load items and suppliers');
      // Set empty arrays on error to prevent crashes
      setItems([]);
      setSuppliers([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get category name by ID
  const getCategoryName = (categoryId?: string): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  // Helper to get supplier name by ID
  const getSupplierName = (supplierId?: string): string => {
    if (!supplierId) return 'No Supplier';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown Supplier';
  };

  // Transform items for display (add computed properties)
  // Ensure items is always an array before mapping
  const transformedItems = (Array.isArray(items) ? items : []).map(item => ({
    ...item,
    categoryType: getCategoryName(item.category_id),
    supplierName: getSupplierName(item.supplier_id),
    linkedBookings: 0, // TODO: Calculate from reservations when endpoint available
    priceUnit: 'per unit' // Add default priceUnit if missing
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Booked': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleAddItem = async (itemData: any) => {
    if (!canPerformAction('categories', 'create')) {
      toast.error('Access Denied', 'You do not have permission to add items.');
      return;
    }

    try {
      const newItem = await itemService.createItem(itemData);
      setItems(prev => [newItem, ...prev]);
      toast.success('Success', 'Item created successfully');
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast.error('Error', error.userMessage || 'Failed to create item');
    }
  };

  const handleUpdateItem = async (updatedItem: any) => {
    if (!canPerformAction('categories', 'update')) {
      toast.error('Access Denied', 'You do not have permission to update items.');
      return;
    }

    try {
      const updated = await itemService.updateItem(updatedItem.id, updatedItem);
      setItems(prev => prev.map(item => item.id === updated.id ? updated : item));
      toast.success('Success', 'Item updated successfully');
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast.error('Error', error.userMessage || 'Failed to update item');
    }
  };

  const handleAddSupplier = async (supplierData: any) => {
    if (!canPerformAction('suppliers', 'create')) {
      toast.error('Access Denied', 'You do not have permission to add suppliers.');
      return;
    }

    try {
      const newSupplier = await supplierService.createSupplier(supplierData);
      setSuppliers(prev => [newSupplier, ...prev]);
      toast.success('Success', 'Supplier created successfully');
      setIsAddSupplierModalOpen(false);
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      toast.error('Error', error.userMessage || 'Failed to create supplier');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!canPerformAction('categories', 'delete')) {
      toast.error('Access Denied', 'You do not have permission to delete items.');
      return;
    }

    try {
      await itemService.deleteItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Success', 'Item deleted successfully');
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error('Error', error.userMessage || 'Failed to delete item');
    }
  };

  const handleViewItem = (item: any) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleLinkedBookings = (item: any) => {
    setSelectedItem(item);
    setIsLinkedBookingsModalOpen(true);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleQuickStatFilter = (filterType: string) => {
    switch (filterType) {
      case 'available':
        setStatusFilter('Available');
        break;
      case 'booked':
        setStatusFilter('Booked');
        break;
      case 'total':
        setStatusFilter('All Status');
        break;
      default:
        setStatusFilter('All Status');
    }
  };

  const handleCategoryDistributionFilter = (category: string) => {
    // Map display names to actual category types
    const categoryMap: { [key: string]: string } = {
      'Hotels': 'Hotel',
      'Flights': 'Trip Package',
      'Tours': 'Tour',
      'Activities': 'Activities',
      'Transportation': 'Transportation'
    };
    setCategoryFilter(categoryMap[category] || category);
  };

  // Filter items
  const filteredItems = transformedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || item.categoryType === categoryFilter;
    const matchesStatus = statusFilter === 'All Status' || 
      (statusFilter === 'Available' && item.status === 'Active') ||
      (statusFilter === 'Booked' && item.status === 'Inactive') ||
      (statusFilter === 'Inactive' && item.status === 'Inactive');
    const matchesSupplier = supplierFilter === 'All Suppliers' || item.supplierName === supplierFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const categoryType = item.categoryType || 'Uncategorized';
    if (!acc[categoryType]) {
      acc[categoryType] = [];
    }
    acc[categoryType].push(item);
    return acc;
  }, {} as { [key: string]: any[] });

  // Calculate stats
  const totalItems = transformedItems.length;
  const availableItems = transformedItems.filter(item => item.status === 'Active').length;
  const bookedToday = transformedItems.filter(item => item.status === 'Inactive').length;
  const thisMonth = transformedItems.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product & Service Categories</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your travel products and services</p>
        </div>
        <ActionGuard module="categories" action="create">
          <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </ActionGuard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option>All Categories</option>
                  {categoryTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Status</option>
                  <option>Available</option>
                  <option>Booked</option>
                  <option>Inactive</option>
                </Select>
                <Select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
                  <option>All Suppliers</option>
                  {(Array.isArray(suppliers) ? suppliers : []).map(supplier => (
                    <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                  ))}
                </Select>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grouped Items Table */}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {Object.entries(groupedItems).map(([category, categoryItems]) => {
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Package;
                  const isExpanded = expandedCategories.includes(category);
                  
                  return (
                    <div key={category} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {category} Booking
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {categoryItems.length} items
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>

                      {/* Category Items */}
                      {isExpanded && (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Item Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Supplier
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Linked
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {categoryItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {item.name}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                      {item.description}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      ${item.price || 0}/{item.priceUnit ? item.priceUnit.replace('per ', '') : 'unit'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {item.supplierName}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {item.linkedBookings} bookings
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex space-x-2">
                                      <button 
                                        onClick={() => handleViewItem(item)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        title="View Details"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>
                                      <ActionGuard module="categories" action="update">
                                        <button 
                                          onClick={() => handleEditItem(item)}
                                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                          title="Edit Item"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                      </ActionGuard>
                                      <RoleGuard module="categories" action="view" hideIfNoAccess>
                                        <button 
                                          onClick={() => handleLinkedBookings(item)}
                                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                          title="Linked Bookings"
                                        >
                                          <Link className="h-4 w-4" />
                                        </button>
                                      </RoleGuard>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button
                  onClick={() => handleQuickStatFilter('total')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{totalItems}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleQuickStatFilter('available')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{availableItems}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleQuickStatFilter('booked')}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Booked Today</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{bookedToday}</span>
                  </div>
                </button>
                
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{thisMonth}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryDistribution.map((item) => (
                  <button
                    key={item.category}
                    onClick={() => handleCategoryDistributionFilter(item.category)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.category}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ActionGuard module="categories" action="create">
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddItem}
          suppliers={suppliers}
          onAddSupplier={() => setIsAddSupplierModalOpen(true)}
        />
      </ActionGuard>

      <ViewItemModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={selectedItem}
      />

      <ActionGuard module="categories" action="update">
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateItem}
          item={selectedItem}
          suppliers={suppliers}
          onAddSupplier={() => setIsAddSupplierModalOpen(true)}
        />
      </ActionGuard>

      <RoleGuard module="categories" action="view">
        <LinkedBookingsModal
          isOpen={isLinkedBookingsModalOpen}
          onClose={() => setIsLinkedBookingsModalOpen(false)}
          item={selectedItem}
        />
      </RoleGuard>

      <ActionGuard module="suppliers" action="create">
        <AddSupplierModal
          isOpen={isAddSupplierModalOpen}
          onClose={() => setIsAddSupplierModalOpen(false)}
          onSave={handleAddSupplier}
        />
      </ActionGuard>
    </div>
  );
};