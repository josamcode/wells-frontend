import React, { memo } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastWrapper = memo(() => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={document.dir === 'rtl'}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="!rounded-xl !shadow-soft-lg !border !border-secondary-100"
      bodyClassName="!text-sm !font-medium"
      progressClassName="!bg-primary-500"
    />
  );
});

ToastWrapper.displayName = 'ToastWrapper';

export default ToastWrapper;
