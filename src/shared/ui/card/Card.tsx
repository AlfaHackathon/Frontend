import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib'
import styles from './Card.module.css'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.card, className)} {...props} />
}
