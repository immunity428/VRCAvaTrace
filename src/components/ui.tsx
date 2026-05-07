import { type FC, type ReactNode } from 'react'
import type { ToastType, Toast } from '../hooks/useToast'

// ━━━ Button ━━━
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success'
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-accent to-accent2 text-white shadow-[0_2px_12px_rgba(124,106,247,0.3)] hover:shadow-[0_4px_20px_rgba(124,106,247,0.4)] hover:-translate-y-px',
  secondary:
    'bg-bg3 text-text1 border border-border2 hover:bg-border',
  danger:
    'bg-[rgba(239,68,68,0.15)] text-red-400 border border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.28)]',
  success:
    'bg-[rgba(34,197,94,0.15)] text-green-400 border border-[rgba(34,197,94,0.3)] hover:bg-[rgba(34,197,94,0.25)]',
}

export const Button: FC<ButtonProps> = ({
  variant = 'secondary',
  className = '',
  children,
  ...props
}) => (
  <button
    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-semibold font-sans transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
)

// ━━━ Input ━━━
export const Input: FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className = '',
  ...props
}) => (
  <input
    className={`w-full bg-bg3 border border-border rounded-lg px-3 py-2.5 text-text1 text-[13px] font-sans outline-none focus:border-accent transition-colors placeholder:text-text3 ${className}`}
    {...props}
  />
)

// ━━━ Textarea ━━━
export const Textarea: FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className = '',
  ...props
}) => (
  <textarea
    className={`w-full bg-bg3 border border-border rounded-lg px-3 py-2.5 text-text1 text-[13px] font-sans outline-none focus:border-accent transition-colors placeholder:text-text3 resize-none min-h-[60px] ${className}`}
    {...props}
  />
)

// ━━━ Card ━━━
export const Card: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`bg-bg2 border border-border rounded-xl p-4 ${className}`}>
    {children}
  </div>
)

// ━━━ SectionTitle ━━━
export const SectionTitle: FC<{ children: ReactNode; right?: ReactNode }> = ({
  children,
  right,
}) => (
  <div className="flex items-center justify-between mb-2.5">
    <span className="text-[11px] font-bold text-text2 uppercase tracking-widest">
      {children}
    </span>
    {right}
  </div>
)

// ━━━ Badge ━━━
export const Badge: FC<{ count: number }> = ({ count }) => (
  <span className="bg-[rgba(124,106,247,0.2)] text-accent text-[10px] px-1.5 py-0.5 rounded-full font-bold">
    {count}
  </span>
)

// ━━━ Loading Overlay ━━━
export const LoadingOverlay: FC<{ text: string }> = ({ text }) => (
  <div className="fixed inset-0 bg-[rgba(12,12,18,0.8)] backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-bg2 border border-border2 rounded-2xl px-9 py-7 flex flex-col items-center gap-3.5">
      <div className="w-9 h-9 border-[3px] border-border2 border-t-accent rounded-full animate-spin" />
      <div className="text-[14px] text-text2">{text}</div>
    </div>
  </div>
)

// ━━━ Toast Container ━━━
const toastIcon: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
}

export const ToastContainer: FC<{ toasts: Toast[] }> = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
    {toasts.map(t => (
      <div
        key={t.id}
        className="bg-bg2 border border-border2 rounded-xl px-4 py-3 text-[13px] flex items-center gap-2.5 max-w-xs shadow-[0_4px_24px_rgba(0,0,0,0.4)] animate-[slideIn_0.2s_ease]"
      >
        <span className="text-base">{toastIcon[t.type]}</span>
        <span>{t.message}</span>
      </div>
    ))}
  </div>
)

// ━━━ Warn Banner ━━━
export const WarnBanner: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded-lg px-3.5 py-2.5 text-[12px] text-yellow-400 flex items-center gap-2 mb-3.5">
    {children}
  </div>
)

// ━━━ Step Item ━━━
export const StepItem: FC<{
  num: number
  color?: string
  children: ReactNode
}> = ({ num, color = 'rgba(124,106,247,0.2)', children }) => (
  <div className="flex gap-2.5 mb-2 items-start text-[13px] text-text2 leading-relaxed">
    <span
      className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold"
      style={{ background: color, color: color.includes('239') ? '#ef4444' : '#7c6af7' }}
    >
      {num}
    </span>
    <span>{children}</span>
  </div>
)
