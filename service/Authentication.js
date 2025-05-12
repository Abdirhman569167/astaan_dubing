import axios from "axios";

const userService = process.env.NEXT_PUBLIC_USER_SERVICE_URL;

const Authentication = {
  login: async (identifier, password) => {
    return await axios.post(
      `${userService}/api/auth/login`,
      { identifier, password },
      { withCredentials: true }
    );
  },
  
  logout: async () => {
    return await axios.get(
      `${userService}/api/auth/logout`,
      { withCredentials: true }
    );
  },
  
  getUsers: async () => {
    return await axios.get(
      `${userService}/api/auth/users`,
      { withCredentials: true }
    );
  },
  
  getUserById: async (userId) => {
    return await axios.get(
      `${userService}/api/auth/users/${userId}`,
      { withCredentials: true }
    );
  },
  
  createUser: async (userData) => {
    return await axios.post(
      `${userService}/api/auth/register`,
      userData,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  },
  
  updateUser: async (userId, userData) => {
    return await axios.put(
      `${userService}/api/auth/users/${userId}`,
      userData,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
  },
  
  deleteUser: async (userId) => {
    return await axios.delete(
      `${userService}/api/auth/users/${userId}`,
      { withCredentials: true }
    );
  }
};

export default Authentication;
