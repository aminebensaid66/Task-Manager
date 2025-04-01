import React, { useState } from "react";

const TaskManager = ({ userRole }) => {
  // Sample tasks (Stored in state)
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design Homepage",
      description: "Create a responsive homepage design.",
      deadline: "2025-04-10",
      priority: "High",
      status: "In Progress",
      comments: "Started working on the wireframe.",
      assignedTo: "employee1@example.com",
    },
    {
      id: 2,
      title: "Fix Backend Bug",
      description: "Resolve authentication issue in API.",
      deadline: "2025-04-15",
      priority: "Medium",
      status: "Pending",
      comments: "Need more details from QA.",
      assignedTo: "employee2@example.com",
    },
  ]);

  // New Task State
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "Low",
    status: "Pending",
    comments: "",
    assignedTo: "",
  });

  // Function to handle input changes
  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  // Admin: Add a new task
  const addTask = () => {
    setTasks([...tasks, { id: tasks.length + 1, ...newTask }]);
    setNewTask({
      title: "",
      description: "",
      deadline: "",
      priority: "Low",
      status: "Pending",
      comments: "",
      assignedTo: "",
    });
  };

  // Admin: Delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Employee: Update task status and comments
  const updateTask = (id, field, value) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>

      {/* Task List */}
      <div className="w-full max-w-4xl bg-white shadow-md p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Tasks</h2>
        {tasks.map((task) => (
          <div key={task.id} className="border-b pb-3 mb-3">
            <h3 className="font-bold">{task.title}</h3>
            <p>{task.description}</p>
            <p><strong>Deadline:</strong> {task.deadline}</p>
            <p><strong>Priority:</strong> {task.priority}</p>
            <p><strong>Assigned To:</strong> {task.assignedTo}</p>

            {/* Employee: Can update status and comments */}
            {userRole === "employee" && (
              <div>
                <label className="block mt-2">Update Status:</label>
                <select
                  className="border p-1 rounded w-full"
                  value={task.status}
                  onChange={(e) => updateTask(task.id, "status", e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <label className="block mt-2">Add Comment:</label>
                <input
                  type="text"
                  className="border p-1 rounded w-full"
                  value={task.comments}
                  onChange={(e) => updateTask(task.id, "comments", e.target.value)}
                />
              </div>
            )}

            {/* Admin: Can delete task */}
            {userRole === "admin" && (
              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-500 text-white p-1 rounded mt-2"
              >
                Delete Task
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Admin: Create New Task */}
      {userRole === "admin" && (
        <div className="w-full max-w-4xl bg-white shadow-md p-4 mt-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Create New Task</h2>
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            className="border p-2 rounded w-full mb-2"
            value={newTask.title}
            onChange={handleInputChange}
          />
          <textarea
            name="description"
            placeholder="Task Description"
            className="border p-2 rounded w-full mb-2"
            value={newTask.description}
            onChange={handleInputChange}
          />
          <input
            type="date"
            name="deadline"
            className="border p-2 rounded w-full mb-2"
            value={newTask.deadline}
            onChange={handleInputChange}
          />
          <select
            name="priority"
            className="border p-2 rounded w-full mb-2"
            value={newTask.priority}
            onChange={handleInputChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <input
            type="text"
            name="assignedTo"
            placeholder="Assign to (email)"
            className="border p-2 rounded w-full mb-2"
            value={newTask.assignedTo}
            onChange={handleInputChange}
          />
          <button
            onClick={addTask}
            className="bg-green-500 text-white p-2 rounded w-full"
          >
            Add Task
          </button>
        </div>
      )}
    </div>
  );
};

// Main App Component (Simulating Different Users)
const App = () => {
  const [role, setRole] = useState("admin"); // Change to "employee" for testing

  return (
    <div>
      <select
        onChange={(e) => setRole(e.target.value)}
        className="p-2 border rounded m-4"
      >
        <option value="admin">Admin</option>
        <option value="employee">Employee</option>
      </select>
      <TaskManager userRole={role} />
    </div>
  );
};

export default App;