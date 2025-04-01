import { useState } from 'react';
import { format } from 'date-fns';

const TaskList = ({ tasks, onEdit, onDelete, onAssign, isAdmin, users }) => {
  const [expandedTask, setExpandedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const filteredTasks = tasks.filter(task => {
    return (statusFilter === 'all' || task.status.toLowerCase() === statusFilter) &&
           (priorityFilter === 'all' || task.priority.toLowerCase() === priorityFilter);
  });
  
  const handleExpandTask = (id) => {
    setExpandedTask(expandedTask === id ? null : id);
  };
  
  const handleAssignTask = (taskId, e) => {
    onAssign(taskId, e.target.value);
  };
  
  const handleAddComment = (taskId) => {
    if (!comment.trim()) return;
    
    // This would need to be implemented with your API
    console.log("Adding comment to task", taskId, comment);
    setComment('');
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          {isAdmin ? 'All Tasks' : 'My Tasks'} ({filteredTasks.length})
        </h3>
        
        <div className="mt-3 flex flex-wrap gap-2">
          <select 
            className="border rounded p-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <select 
            className="border rounded p-1 text-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No tasks found matching the current filters.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredTasks.map(task => (
            <li key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-lg cursor-pointer" onClick={() => handleExpandTask(task.id)}>
                    {task.title}
                  </h4>
                  
                  <div className="text-sm text-gray-500 mt-1 flex gap-3">
                    <span>
                      Deadline: {task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : 'None'}
                    </span>
                    {task.assignedTo && (
                      <span>
                        Assigned to: {users.find(u => u.id === task.assignedTo)?.email || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(task)} 
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  
                  {isAdmin && (
                    <button 
                      onClick={() => onDelete(task.id)} 
                      className="text-red-500 hover:text-red-700"
                      title="Delete task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {expandedTask === task.id && (
                <div className="mt-3 border-t pt-3">
                  <p className="text-gray-700 mb-3">{task.description}</p>
                  
                  {isAdmin && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign to:
                      </label>
                      <select 
                        className="border rounded w-full p-2"
                        value={task.assignedTo || ''}
                        onChange={(e) => handleAssignTask(task.id, e)}
                      >
                        <option value="">Not assigned</option>
                        {users.filter(u => u.role === 'employee').map(user => (
                          <option key={user.id} value={user.id}>
                            {user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Add comment:
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        className="flex-1 border rounded-l p-2"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                      />
                      <button
                        onClick={() => handleAddComment(task.id)}
                        className="bg-blue-500 text-white rounded-r px-3"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                  
                  {task.comments && task.comments.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-sm">Comments:</h5>
                      <ul className="mt-1 space-y-2">
                        {task.comments.map((comment, index) => (
                          <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                            <div className="font-medium">{comment.user}</div>
                            <div>{comment.text}</div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(comment.timestamp), 'MMM d, yyyy HH:mm')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;