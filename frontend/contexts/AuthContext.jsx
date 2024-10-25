import axios from "axios";
import { createContext, useState } from "react";
export const AuthContext = createContext();
import React from 'react'
import { API } from "../utils/API";

const AuthState = ({children}) => {

    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated]  = useState(false)


    const getUser = async () => {
        try {
            const {data} = await API.get('/api/users/profile');
            if(data?.data){
                setUser(data.data);
                setIsAuthenticated(true)
            }
            else{
                setUser();
                setIsAuthenticated(false)
            }
        } catch (error) {
            setIsAuthenticated(false)
            setUser()
        }
    }

    const logout = ()=>{
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
    }

  

  return (
    <AuthContext.Provider
    value={{
        user, isAuthenticated,getUser,logout,
    }}
    >
        {children}
    </AuthContext.Provider>
  )
}

export default AuthState; 