// BotSectionGrid.tsx
import Link from 'next/link'
import ReactIconComponent from '@/components/ReactIconComponent'
import { BotSection } from '@/types/bot-ag'

export function BotSectionGrid({ section }: { section: BotSection }) {
  const cols = section.cols ?? 4
  const gridCls = `grid grid-cols-1 md:grid-cols-${cols} gap-4 sm:gap-6`

  const baseClass =
    'block p-2 sm:p-3 rounded-2xl ring-1 transition-colors shadow-sm border'
  const enabledClass =
    'ring-gray-200 bg-white/90 border-purple-200 hover:bg-gradient-to-r from-[#A78BFA50] to-[#34D39950] hover:shadow-md cursor-pointer'
  const disabledClass =
    'ring-gray-100 bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-70'

  const Badge = ({ type }: { type?: 'new' | 'beta' | 'soon' }) => {
    if (!type) return null
    const map: Record<string, string> = {
      new: 'bg-emerald-100 text-emerald-700',
      beta: 'bg-blue-100 text-blue-700',
      soon: 'bg-gray-200 text-gray-600',
    }
    const label = type === 'soon' ? 'Soon' : type.toUpperCase()
    return (
      <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${map[type]}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="p-4 rounded-2xl ring-1 ring-gray-200 shadow-lg backdrop-blur shadow-gray-900/5 sm:p-6 sm:mb-8 bg-white/90">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-2">
        {section.title}
      </h2>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{section.subtitle}</p>

      <div className={gridCls}>
        {section.items.map((btn) =>
          btn.enabled ? (
            <Link key={btn.key} href={btn.href} className={`${baseClass} ${enabledClass}`}>
              <div className="flex items-center">
                <ReactIconComponent icon={btn.icon} setClass="w-8 h-8 mr-2" />
                <div>
                  <h3 className="text-purple-500 text-base sm:text-lg md:text-xl font-semibold text-gray-900 flex items-center">
                    {btn.title}
                    <Badge type={btn.badge} />
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">{btn.desc}</p>
                </div>
              </div>
            </Link>
          ) : (
            <div key={btn.key} className={`${baseClass} ${disabledClass}`}>
              <div className="flex items-center">
                <ReactIconComponent icon={btn.icon} setClass="w-8 h-8 mr-2 text-gray-400" />
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-500 flex items-center">
                    {btn.title}
                    <Badge type={btn.badge} />
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400">{btn.desc}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
