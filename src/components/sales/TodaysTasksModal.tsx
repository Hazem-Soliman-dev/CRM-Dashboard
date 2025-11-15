import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus, Eye, Edit, X, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { formatDate } from '../../utils/format';

interface TodaysTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: any[];
  onTaskUpdate: (tasks: any[]) => void;
}

export const TodaysTasksModal: React.FC<TodaysTasksModalProps> = ({ 
  isOpen, 
  onClose, 
  tasks, 
  onTaskUpdate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Due Today': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'Pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const handleCompleteTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: 'Completed' } : task
    );
    onTaskUpdate(updatedTasks);
  };

  const handleViewCase = (caseId: string) => {
    console.log('Viewing case:', caseId);
    // In real app, navigate to case details or open case modal
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleCreateTask = () => {
    setIsNewTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    // In real app, save to Supabase
    console.log('Saving task:', taskData);
    setIsNewTaskModalOpen(false);
  };

  const handleUpdateTask = async (taskData: any) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskData.id ? { ...task, ...taskData } : task
    );
    onTaskUpdate(updatedTasks);
    setIsEditTaskModalOpen(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todaysTasks = filteredTasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate === today || task.status === 'Overdue';
  });

  const overdueTasks = todaysTasks.filter(task => task.status === 'Overdue');
  const dueTodayTasks = todaysTasks.filter(task => task.status === 'Due Today');
  const completedTasks = todaysTasks.filter(task => task.status === 'Completed');

  if (!isOpen) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Today's Tasks ({todaysTasks.length})
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-300">
                  {overdueTasks.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Due Today</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                  {dueTodayTasks.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Completed</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                  {completedTasks.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="All">All Status</option>
              <option value="Overdue">Overdue</option>
              <option value="Due Today">Due Today</option>
              <option value="Completed">Completed</option>
            </select>
            <Button size="sm" onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {todaysTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {task.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {task.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewCase(task.caseId)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                      >
                        {task.caseId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewCase(task.caseId)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="View Case"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditTask(task.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Edit Task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {task.status !== 'Completed' && (
                          <button 
                            onClick={() => handleCompleteTask(task.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Mark Complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {todaysTasks.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks for today
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              All caught up! No tasks are due today.
            </p>
          </div>
        )}

        {/* New Task Modal */}
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsNewTaskModalOpen(false)} />
              <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Task</h3>
                  <button onClick={() => setIsNewTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveTask({}); }}>
                    <div className="space-y-4">
                      <Input label="Task Title" placeholder="Enter task title" required />
                      <Input label="Customer" placeholder="Enter customer name" required />
                      <Input label="Case ID" placeholder="Enter case ID" />
                      <Input type="date" label="Due Date" required />
                      <Select label="Priority">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </Select>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter task description"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsNewTaskModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {isEditTaskModalOpen && selectedTask && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsEditTaskModalOpen(false)} />
              <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Task</h3>
                  <button onClick={() => setIsEditTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateTask(selectedTask); }}>
                    <div className="space-y-4">
                      <Input label="Task Title" defaultValue={selectedTask.title} required />
                      <Input label="Customer" defaultValue={selectedTask.customer} required />
                      <Input label="Case ID" defaultValue={selectedTask.caseId} />
                      <Input type="date" label="Due Date" defaultValue={selectedTask.dueDate} required />
                      <Select label="Priority" defaultValue={selectedTask.priority}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </Select>
                      <Select label="Status" defaultValue={selectedTask.status}>
                        <option value="Pending">Pending</option>
                        <option value="Due Today">Due Today</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Completed">Completed</option>
                      </Select>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          defaultValue={selectedTask.description}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter task description"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <Button type="button" variant="outline" onClick={() => setIsEditTaskModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Update Task
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};