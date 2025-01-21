import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface GoogleButtonProps {
  text?: string;
  onClick?: () => Promise<void>;
  disabled?: boolean;
}

export function GoogleButton({ 
  text = "Continue with Google",
  onClick,
  disabled = false
}: GoogleButtonProps) {
  const { signInWithGoogle } = useAuth();

  const handleClick = async () => {
    if (onClick) {
      await onClick();
    } else {
      await signInWithGoogle();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {disabled ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span>{text}</span>
        </div>
      ) : (
        <>
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          {text}
        </>
      )}
    </button>
  );
}
