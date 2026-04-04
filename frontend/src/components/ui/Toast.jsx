import React from 'react';
import { useApp } from '../../context/AppContext';

function Toast({ toast, onClose }) {
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-icon">{icons[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  const handleClose = (id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  return (
    <div className="toast-container">
      {state.toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => handleClose(toast.id)} />
      ))}
    </div>
  );
}
