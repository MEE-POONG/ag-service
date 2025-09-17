// pages/bot-ag/index.tsx
import { TheLayout } from '@/components/TheLayout'
import { botSections } from '@/types/bot-ag'
import { BotSectionGrid } from '@/container/bot-ag/BotSectionGrid'
import ReactIconComponent from '@/components/ReactIconComponent'
import PageHeader from '@/components/PageHeader'

export default function BotAgPage() {
  return (
    <TheLayout>
      <PageHeader
        title="คำสั่งบอทระหว่างการพัฒนา"
        icon='FaRobot'
        description="ระบบจัดการคำสั่งบอทระหว่างการพัฒนา"
        gradient={true}
      />
      <div className="mx-auto"> {/* Themed header */}
        {botSections.map((sec) => (
          <BotSectionGrid key={sec.key} section={sec} />
        ))}
      </div>
    </TheLayout>
  )
}
