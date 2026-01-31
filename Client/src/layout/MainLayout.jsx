import React from 'react'
import Navbar from '../components/User/Navbar'
import Footer from '../components/User/Footer'
import FloatingChatWidget from '../components/User/FloatingChatWidget';
import { ErrorBoundary } from "react-error-boundary";

const MainLayout = ({ children }) => {
  return (
    <div className="bg-brand-dark min-h-screen transition-colors duration-300">
      <Navbar />
      <ErrorBoundary fallback={<div>Something went wrong in this page</div>}>
        {children}
      </ErrorBoundary>
      <Footer />
      <FloatingChatWidget />
    </div>
  );
};

export default MainLayout
