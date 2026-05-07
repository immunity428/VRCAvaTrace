import { type FC } from 'react'
import { Card } from './ui'

const Step: FC<{ num: number; color?: 'purple' | 'green' | 'red'; children: React.ReactNode }> = ({
  num, color = 'purple', children,
}) => {
  const cls = {
    purple: 'bg-[rgba(124,106,247,0.2)] text-accent',
    green: 'bg-[rgba(34,197,94,0.15)] text-green-400',
    red: 'bg-[rgba(239,68,68,0.15)] text-red-400',
  }[color]

  return (
    <div className="flex gap-2.5 mb-2 items-start text-[13px] text-text2 leading-relaxed">
      <span className={`flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold ${cls}`}>
        {num}
      </span>
      <span>{children}</span>
    </div>
  )
}

export const GuidePanel: FC = () => (
  <div className="flex flex-col flex-1 overflow-hidden">
    <div className="px-6 pt-[18px] pb-3.5 border-b border-border flex-shrink-0">
      <div className="text-[18px] font-bold tracking-tight">📖 使い方</div>
      <div className="text-[12px] text-text3 mt-0.5">アプリの基本的な使い方とよくある注意点</div>
    </div>

    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

      {/* セットアップ */}
      <Card>
        <div className="text-[13px] font-bold mb-4 flex items-center gap-2"><span className="text-lg">🚀</span> はじめてのセットアップ</div>
        <Step num={1}>GitHubで<strong>プライベートの</strong>リポジトリを作成する</Step>
        <Step num={2}>⚙️ 設定タブでフォルダ・URL・トークンを入力して接続</Step>
        <Step num={3}>自動で <code className="bg-bg3 px-1 py-0.5 rounded text-[11px]">.gitignore</code> が生成され、素材フォルダは除外される</Step>
        <Step num={4}>あとは普段通りUnityで作業してバックアップしたいときに送信するだけ！</Step>
      </Card>

      {/* Push */}
      <Card>
        <div className="text-[13px] font-bold mb-4 flex items-center gap-2"><span className="text-lg">📤</span> バックアップの送信（Push）</div>
        <Step num={1} color="green">🎭 アバター管理タブで変更ファイルを確認</Step>
        <Step num={2} color="green">変更メモに「何をしたか」を入力（例：表情アニメーション追加）</Step>
        <Step num={3} color="green">「📤 保存して送信」ボタンを押す</Step>
      </Card>

      {/* 復元 */}
      <Card>
        <div className="text-[13px] font-bold mb-4 flex items-center gap-2"><span className="text-lg">⏪</span> 過去の状態に戻す（復元）</div>
        <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg px-3 py-2.5 mb-3.5 text-[12px] text-red-400">
          ⚠️ <strong>復元前に必ずUnityを閉じてください！</strong><br />
          Unityを開いたままだとファイルがロックされ、復元が正常に完了しません。
        </div>
        <Step num={1} color="red">Unityを閉じる</Step>
        <Step num={2} color="red">📋 変更履歴タブを開く</Step>
        <Step num={3} color="red">戻したいバージョンの「⏪ この状態に戻す」を押す</Step>
        <Step num={4} color="red">「GitHubにも反映しますか？」が表示されるので選択する（下の説明を参照）</Step>
        <Step num={5} color="red">完了後にUnityを開き直す（自動でプロジェクト再構築される）</Step>

        <div className="text-[13px] font-bold text-text1 mt-4 mb-3">復元の仕組みと選択肢</div>
        <div className="flex flex-col gap-2 text-[12px]">
          <div className="bg-bg3 border border-border rounded-lg p-3.5">
            <div className="font-bold text-text1 mb-1.5">💾 復元前に自動バックアップ</div>
            <div className="text-text2 leading-relaxed">
              「この状態に戻す」を押すと、まず現在の状態が<strong className="text-text1">自動でバックアップ</strong>されます。<br />
              復元後も変更履歴にバックアップが残るので、いつでも復元前の状態に戻せます。
            </div>
          </div>
          <div className="bg-bg3 border border-border rounded-lg p-3.5">
            <div className="font-bold text-text1 mb-1.5">💻 ローカルのみ復元（キャンセル）</div>
            <div className="text-text2 leading-relaxed">
              自分のPCだけ過去の状態に戻します。GitHubはそのまま変わりません。<br />
              <span className="text-accent text-[12px]">📌 こんな時に使う：「昨日の衣装に戻して試したい、気に入らなければ元に戻したい」。何度でもやり直せるので気軽に試せます。</span>
            </div>
          </div>
          <div className="bg-bg3 border border-border rounded-lg p-3.5">
            <div className="font-bold text-text1 mb-1.5">☁️ GitHubにも反映（OK）</div>
            <div className="text-text2 leading-relaxed">
              PCとGitHub両方を過去の状態に更新します。<br />
              <span className="text-accent text-[12px]">📌 こんな時に使う：「別のPCでも同じ状態で作業したい」「このバージョンに完全に確定した」。</span><br />
              <span className="text-yellow-400 text-[11px]">⚠️ GitHubの履歴が上書きされます。</span>
            </div>
          </div>
          <div className="bg-[rgba(124,106,247,0.08)] border border-[rgba(124,106,247,0.2)] rounded-lg px-3.5 py-2.5 text-[11px] text-text2">
            💡 <strong>迷ったらキャンセル（ローカルのみ）が安全です。</strong><br />
            復元前の状態は自動バックアップ済みなので、変更履歴からいつでも戻せます。
          </div>
        </div>
      </Card>

      {/* セキュリティ */}
      <Card>
        <div className="text-[13px] font-bold mb-4 flex items-center gap-2"><span className="text-lg">🔒</span> セキュリティについて</div>
        <div className="bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)] rounded-lg px-3 py-2.5 text-[12px] text-yellow-400 mb-3">
          ⚠️ リポジトリは必ず <strong>Private（非公開）</strong> で作成してください。<br />
          Publicにすると購入素材・アバターデータが全世界に公開されてしまいます。
        </div>
        <div className="text-[13px] text-text2">
          Personal Access Token はパスワードと同じです。他人には絶対に教えないでください。
        </div>
      </Card>

      {/* FAQ */}
      <Card>
        <div className="text-[13px] font-bold mb-4 flex items-center gap-2"><span className="text-lg">❓</span> よくある質問</div>
        <div className="flex flex-col gap-4 text-[13px]">
          {[
            {
              q: 'Q. 素材（購入したアバター）はバックアップされますか？',
              a: 'されません。.gitignore により自動で除外されています。自分が編集したマテリアル・アニメーション・シーンだけが対象です。',
            },
            {
              q: 'Q. 復元後にUnityのエラーが出ます',
              a: '正常です。UnityがLibraryフォルダを再構築中です。しばらく待つと自動で解消されます。',
            },
            {
              q: 'Q.「変更なし」と表示されるのに送信できません',
              a: 'すでに最新の状態がGitHubに送信済みです。Unityで何か変更してから再度お試しください。',
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <div className="font-bold text-text1 mb-1">{q}</div>
              <div className="text-text2">{a}</div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  </div>
)
