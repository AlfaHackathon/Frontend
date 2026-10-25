import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function AccountsMIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6Zm1 5h10v2H7V8Zm0 3.5h10v2H7v-2ZM7 15h7v2H7v-2Z"
      />
    </svg>
  )
}

export function MegaphoneMIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 4.5v15l-7.5-3.75H9.6l1.15 4.25H8.2l-1.3-4.33A3.5 3.5 0 0 1 3 12.25v-.5A3.5 3.5 0 0 1 6.5 8.25h5L19 4.5Zm1.5 5.25a2.5 2.5 0 0 1 0 4.5v-4.5Z" />
    </svg>
  )
}
