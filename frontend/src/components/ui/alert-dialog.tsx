// frontend/src/components/ui/alert-dialog.tsx
import React from 'react';

export const AlertDialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        {React.Children.map(children, child => 
          React.cloneElement(child, { onOpenChange })
        )}
      </div>
    </div>
  );
};

export const AlertDialogContent = ({ children, onOpenChange }: any) => (
  <div className="p-6">
    {React.Children.map(children, child => 
      React.cloneElement(child, { onOpenChange })
    )}
  </div>
);

export const AlertDialogHeader = ({ children }: any) => (
  <div className="flex flex-col space-y-2 text-center sm:text-left">{children}</div>
);

export const AlertDialogTitle = ({ children }: any) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const AlertDialogDescription = ({ children }: any) => (
  <p className="text-sm text-slate-500">{children}</p>
);

export const AlertDialogFooter = ({ children, onOpenChange }: any) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
    {React.Children.map(children, child => 
      React.cloneElement(child, { onOpenChange })
    )}
  </div>
);

export const AlertDialogCancel = ({ children, onOpenChange }: any) => (
  <button 
    onClick={() => onOpenChange(false)}
    className="mt-2 sm:mt-0 px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
  >
    {children}
  </button>
);

export const AlertDialogAction = ({ children, onClick }: any) => (
  <button 
    onClick={onClick}
    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm transition-colors"
  >
    {children}
  </button>
);