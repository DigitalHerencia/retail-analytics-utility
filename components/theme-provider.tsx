'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force dark theme and remove theme switching capability
  return <NextThemesProvider {...props} forcedTheme="dark">{children}</NextThemesProvider>
}
