import { type FC } from 'react'
import type { PanelId } from '../types'

interface NavItem {
  id: PanelId
  icon: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'main', icon: '🎭', label: 'アバター管理' },
  { id: 'history', icon: '📋', label: '変更履歴' },
  { id: 'setup', icon: '⚙️', label: '設定' },
  { id: 'guide', icon: '📖', label: '使い方' },
]

interface SidebarProps {
  activePanel: PanelId
  onNavigate: (panel: PanelId) => void
  connected: boolean
}

export const Sidebar: FC<SidebarProps> = ({ activePanel, onNavigate, connected }) => (
  <div className="w-[200px] bg-bg2 border-r border-border flex flex-col py-3 px-2 gap-0.5 flex-shrink-0">
    {NAV_ITEMS.map(({ id, icon, label }) => (
      <button
        key={id}
        onClick={() => onNavigate(id)}
        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] cursor-pointer transition-all duration-150 border-none font-sans w-full text-left ${
          activePanel === id
            ? 'bg-[rgba(124,106,247,0.15)] text-accent font-medium'
            : 'bg-transparent text-text2 hover:bg-bg3 hover:text-text1'
        }`}
      >
        <span className="text-base">{icon}</span>
        {label}
      </button>
    ))}

    <div className="flex-1" />

    <div className="px-3 py-2.5 text-[11px] text-text3 flex items-center gap-1.5">
      <span
        className={`w-1.5 h-1.5 rounded-full transition-all ${
          connected
            ? 'bg-green-500 shadow-[0_0_6px_#22c55e]'
            : 'bg-text3'
        }`}
      />
      {connected ? '接続済み' : '未接続'}
    </div>
  </div>
)
