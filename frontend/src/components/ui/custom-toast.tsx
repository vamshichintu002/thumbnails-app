import { Toast, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  t: Toast;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

const CustomToast = ({ t, message, type = 'info' }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />
  };

  const bgColors = {
    success: 'bg-green-900/80',
    error: 'bg-red-900/80',
    info: 'bg-blue-900/80',
    warning: 'bg-yellow-900/80'
  };

  const borderColors = {
    success: 'border-green-500/50',
    error: 'border-red-500/50',
    info: 'border-blue-500/50',
    warning: 'border-yellow-500/50'
  };

  return (
    <div
      className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
        max-w-md w-full ${bgColors[type]} backdrop-blur-sm border ${borderColors[type]} 
        shadow-lg rounded-lg pointer-events-auto flex items-center p-4 gap-3`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">
          {message}
        </p>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 rounded-md p-1 
          hover:bg-white/10 transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-white/20"
      >
        <X className="w-4 h-4 text-white/70" />
      </button>
    </div>
  );
};

export const showToast = {
  success: (message: string) => 
    toast.custom((t) => <CustomToast t={t} message={message} type="success" />, {
      duration: 3000,
    }),
  error: (message: string) => 
    toast.custom((t) => <CustomToast t={t} message={message} type="error" />, {
      duration: 4000,
    }),
  info: (message: string) => 
    toast.custom((t) => <CustomToast t={t} message={message} type="info" />, {
      duration: 3000,
    }),
  warning: (message: string) => 
    toast.custom((t) => <CustomToast t={t} message={message} type="warning" />, {
      duration: 4000,
    })
};
