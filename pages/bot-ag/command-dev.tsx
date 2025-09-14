// pages/bot-ag/index.tsx
import { TheLayout } from '@/components/TheLayout'
import { botSections } from '@/types/bot-ag'
import { BotSectionGrid } from '@/container/bot-ag/BotSectionGrid'
import ReactIconComponent from '@/components/ReactIconComponent'

export default function BotAgPage() {
  return (
    <TheLayout>
      <div className="mx-auto"> {/* Themed header */}
        <div className="p-4 sm:p-6 sm:mb-4 rounded-2xl ring-1 ring-gray-200 shadow-lg shadow-gray-900/10 backdrop-blur bg-white/90 bg-gradient-to-r from-[#A78BFA] via-[#A78BFA] to-[#34D399] relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-white">
            <ReactIconComponent icon="FaRobot" setClass="w-5 h-5 sm:w-6 sm:h-6" />
            <span>
              <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-sm sm:text-3xl md:text-4xl"> คำสั่งบอท AG </h1>
            </span>
          </div>
          {/* <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-white/15" />
         <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none bg-gray-800/10" /> */} </div>
        {/* Header เดิมของคุณคงไว้ได้เลย */}

        {botSections.map((sec) => (
          <BotSectionGrid key={sec.key} section={sec} />
        ))}
      </div>
    </TheLayout>
  )
}
