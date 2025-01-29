import React, { createContext, useContext, useState } from 'react';

// Membuat context
const SidebarContext = createContext();

export const useSidebar = () => {
    return useContext(SidebarContext); // Hook untuk mengakses context
};

export const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true); // Menyimpan status sidebar
    
    const toggleSidebar = () => {
        setIsOpen(prevState => !prevState); // Fungsi toggle sidebar
    };

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};
