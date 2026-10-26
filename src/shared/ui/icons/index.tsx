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
