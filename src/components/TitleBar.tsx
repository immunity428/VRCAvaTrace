import { type FC } from 'react'
import { ipc } from '../lib/ipc'

export const TitleBar: FC = () => (
  <div
    className="flex items-center h-[38px] bg-bg2 border-b border-border px-3 gap-2.5 flex-shrink-0"
    style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
  >
    <div className="w-[18px] h-[18px] rounded-[4px] bg-gradient-to-br from-accent to-accent2 flex-shrink-0" />
    <span className="text-[12px] font-medium text-text2 tracking-wide flex-1">
      VRC Avatar Git
    </span>
    <div
      className="flex gap-1.5"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {[
        { label: '─', action: ipc.minimize },
        { label: '□', action: ipc.maximize },
        { label: '✕', danger: true, action: ipc.close },
      ].map(({ label, danger, action }) => (
        <button
          key={label}
          onClick={action}
          className={`w-[26px] h-[26px] rounded-md text-[11px] bg-bg3 text-text2 border-none cursor-pointer flex items-center justify-center transition-colors hover:bg-border2 hover:text-text1 ${danger ? 'hover:!bg-red-500 hover:!text-white' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
)
