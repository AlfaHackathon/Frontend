import { useEffect, useRef, useState } from 'react'

const TICK_MS = 20

export function SmoothText({ text, streaming }: { text: string; streaming: boolean }) {
  const [shown, setShown] = useState(() => (streaming ? 0 : text.length))
  const target = useRef(text)
  target.current = text
  const behind = shown < text.length

  useEffect(() => {
    if (!behind) return
    const timer = setInterval(() => {
      setShown((count) => {
        const rest = target.current.length - count
        if (rest <= 0) return count
        return count + Math.max(1, Math.floor(rest / (streaming ? 120 : 40)))
      })
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [behind, streaming])

  return <>{text.slice(0, shown)}</>
}
