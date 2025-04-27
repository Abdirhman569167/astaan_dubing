import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  profile_image: string;
  isverified: boolean;
  created_at: string;
}

interface UserAuthState {
  user: User | null;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  updateUser: (updatedUser: User) => void;
}

const userAuth = create<UserAuthState>()(
  persist(
    (set) => ({
      user: null,
      loginUser: (user) => set({ user }),
      logoutUser: () => set({ user: null }),
      updateUser: (updatedUser) => set({ user: updatedUser }),
    }),
    {
      name: "Astan-storage", 
      getStorage: () => localStorage,  
    }
  )
);

export default userAuth;
