import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskList from '../components/ui/TaskList';
import TaskForm from '../components/ui/TaskForm';
import UserList from '../components/ui/UserList';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    console.log("Stored User:", userData);
  console.log("Stored Token:", localStorage.getItem('token'));
    if (!userData || !localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const tasksEndpoint = userData.role === 'admin' ? '/tasks' : '/tasks/my-tasks';
        const { data: tasksData } = await api.get(tasksEndpoint);
        setTasks(tasksData);
        if (userData.role === 'admin') {
          const { data: usersData } = await api.get('/users');
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  const handleCreateTask = async (taskData) => {
    try {
      const { data } = await api.post('/tasks', taskData);
      setTasks([...tasks, data]);
      setShowTaskForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  
  const handleUpdateTask = async (id, taskData) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, taskData);
      setTasks(tasks.map(task => task.id === id ? data : task));
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  
  const handleDeleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  
  const handleAssignTask = async (taskId, userId) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}/assign`, { userId });
      setTasks(tasks.map(task => task.id === taskId ? data : task));
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="w-screen min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Task Management System</h1>
          <div className="flex items-center">
            <span className="mr-4">
              Welcome, <span className="font-semibold">{user?.email}</span> ({user?.role})
            </span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'My Tasks'}
          </h2>
          {user?.role === 'admin' && (
            <button
              onClick={() => {
                setSelectedTask(null);
                setShowTaskForm(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create New Task
            </button>
          )}
        </div>
        
        {showTaskForm && (
          <div className="mb-6">
            <TaskForm 
              onSubmit={handleCreateTask} 
              onCancel={() => setShowTaskForm(false)}
              users={users}
            />
          </div>
        )}
        
        {selectedTask && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Update Task</h3>
            <TaskForm 
              task={selectedTask}
              onSubmit={(data) => handleUpdateTask(selectedTask.id, data)}
              onCancel={() => setSelectedTask(null)}
              users={users}
              isAdmin={user?.role === 'admin'}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${user?.role === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <TaskList 
              tasks={tasks} 
              onEdit={setSelectedTask} 
              onDelete={handleDeleteTask}
              onAssign={handleAssignTask}
              isAdmin={user?.role === 'admin'}
              users={users}
            />
          </div>
          
          {user?.role === 'admin' && (
            <div className="lg:col-span-1">
              <UserList users={users} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;