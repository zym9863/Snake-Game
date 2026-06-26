interface ToastProps {
  message: string;
  tone?: 'error' | 'success';
}

export function Toast({ message, tone = 'error' }: ToastProps) {
  return (
    <div className={`toast ${tone}`} role="status">
      {message}
    </div>
  );
}
