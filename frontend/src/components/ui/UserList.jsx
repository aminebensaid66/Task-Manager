const UserList = ({ users }) => {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Users ({users.length})</h3>
        </div>
        
        <ul className="divide-y divide-gray-200">
          {users.map(user => (
            <li key={user.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{user.email}</h4>
                  <p className="text-sm text-gray-500">
                    Role: <span className="capitalize">{user.role}</span>
                  </p>
                </div>
                
                <span className={`px-2 py-1 rounded text-xs ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default UserList;