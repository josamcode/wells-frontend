import React from 'react';
import { ToastContainer } from 'react-toastify';

// Wrapper component for ToastContainer
const ToastWrapper = ({ isRTL }) => {
  return (
    <ToastContainer
      position={isRTL ? 'top-left' : 'top-right'}
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={true}
      pauseOnFocusLoss={true}
      draggable={true}
      pauseOnHover={true}
      enableMultiContainer={false}
    />
  );
};

export default ToastWrapper;
