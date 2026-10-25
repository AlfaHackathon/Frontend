type IconName = 'plusCircle' | 'arrows' | 'import' | 'statement' | 'accounts' | 'people' | 'briefing' | 'calculator' | 'wallet' | 'cards' | 'documents' | 'crest' | 'cart' | 'search' | 'calendar' | 'mail' | 'bell' | 'settings' | 'logout' | 'template' | 'receipt' | 'oneC' | 'invoice' | 'globe' | 'bot' | 'grid' | 'news' | 'percent' | 'chat' | 'chevronRight'

const exportedIcons = import.meta.glob('../../../assets/figma-icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const iconUrls = Object.fromEntries(
  Object.entries(exportedIcons).map(([path, url]) => [path.split('/').pop()!.replace(/\.svg$/, ''), url as string]),
) as Partial<Record<IconName, string>>

export function BankIcon({ name, className }: { name: IconName; className?: string }) {
  const src = iconUrls[name]
  if (src) return <img src={src} className={className} alt="" aria-hidden="true" />

  if (name === 'cart') {
    return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 4h3l2.5 12h12l2-9H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="20" r="1.5" fill="currentColor"/><circle cx="19" cy="20" r="1.5" fill="currentColor"/></svg>
  }

  return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
