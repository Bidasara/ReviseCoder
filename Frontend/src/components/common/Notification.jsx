// NotificationPortal.jsx
import ReactDOM from 'react-dom';

const NotificationPortal = ({ notification, isVisible }) => {
  const { message, type } = notification;

  const positionClass = type === 'success'
    ? 'bottom-4 '
    : 'top-4 ';

  const colorClass = type === 'success'
    ? 'bg-green-400'
    : 'bg-red-400';

  const visibleClasses = isVisible
    ? 'opacity-100 transform-none'
    : 'opacity-100';

  const notificationContent = (
    <div
      className={`absolute ${positionClass} left-1/2 transform -translate-x-1/2
            rounded-lg shadow-xl z-[9999] 
            text-white text-center border-2 ${colorClass}
            transition-all duration-500 ease-in-out
            ${visibleClasses}`}
      style={{
        padding: 'calc(1 * var(--unit))',
        width: 'calc(22 * var(--unit))',
        maxWidth: 'calc(28 * var(--unit))',
        bottom: type === 'success' ? 'calc(1 * var(--unit))' : 'auto',
        top: type === 'error' ? 'calc(1 * var(--unit))' : 'auto'
      }}
      role="alert"
      aria-live="assertive"
    >
      <p className="font-semibold" style={{ fontSize: 'var(--text-base)' }}>{message}</p>
    </div>
  );

  return ReactDOM.createPortal(
    notificationContent,
    document.getElementById('notification-root')
  );
};

export default NotificationPortal;
