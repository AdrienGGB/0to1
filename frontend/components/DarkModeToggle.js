import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Switch checked={theme === 'dark'} onCheckedChange={val => setTheme(val ? 'dark' : 'light')} />
  )
}
