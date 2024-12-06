import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UsersList = ({ setSelectedUserId }) => {
  const [users, setUsers] = useState([]); // Initialize with an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Replace with your correct API endpoint
        const response = await axios.get('http://localhost:5000/api/users'); 

        console.log(response.data); // Log the data to inspect its structure

        // Check if response data contains an array
        if (Array.isArray(response.data.data)) {
          setUsers(response.data.data); // Ensure it's an array
        } else {
          setError('Unexpected response format.');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users.');
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    fetchUsers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="w-1/3 p-4 bg-gray-100 border-r border-gray-300">
        <p className="text-lg font-semibold">Loading users...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-1/3 p-4 bg-gray-100 border-r border-gray-300">
        <p className="text-lg font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  // If users is not an array, handle that gracefully
  if (!Array.isArray(users)) {
    return (
      <div className="w-1/3 p-4 bg-gray-100 border-r border-gray-300">
        <p className="text-lg font-semibold text-red-500">Users data is invalid.</p>
      </div>
    );
  }

  // Users list rendering
  return (
    <div className="w-1/3 p-4 bg-gray-100 border-r border-gray-300 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Users</h2>
      <ul>
        {users.length === 0 ? (
          <p>No users available.</p>
        ) : (
          users.map((user) => (
            <li
              key={user._id} // Assuming `user._id` is the correct identifier
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => setSelectedUserId(user._id)} // Use user._id as the identifier
            >
              <div className="flex items-center space-x-2">
                {/* User avatar: Assuming avatar URL is available in user.avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-300">
                  <img
                    src={user.avatar || 'path/to/default-avatar.png'} // Default avatar if none exists
                    alt={user.name || 'User Avatar'} // Default alt if name is missing
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span>{user.name || 'Unnamed User'}</span> {/* Default name if missing */}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UsersList;
