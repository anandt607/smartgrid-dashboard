'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ConfigProvider, theme } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'

const ThemeContext = createContext({})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
      document.body.classList.add('dark-theme')
    }
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light')
    if (newTheme) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  // Ant Design theme config
  const antTheme = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#10b981',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: '#3b82f6',
      borderRadius: 8,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      colorBgContainer: isDark ? '#171717' : '#ffffff',
      colorBgElevated: isDark ? '#262626' : '#ffffff',
      colorBgLayout: isDark ? '#0a0a0a' : '#ffffff',
      colorBorder: isDark ? '#262626' : '#e5e7eb',
      colorText: isDark ? '#fafafa' : '#171717',
      colorTextSecondary: isDark ? '#a3a3a3' : '#6b7280',
      controlHeight: 40,
      motion: true,
      motionUnit: 0.2,
      motionBase: 0,
      motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      motionEaseOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      motionEaseIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
    components: {
      Layout: {
        headerBg: isDark ? '#171717' : '#ffffff',
        siderBg: isDark ? '#171717' : '#ffffff',
        bodyBg: isDark ? '#0a0a0a' : '#ffffff',
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: isDark ? '#262626' : '#f3f4f6',
        itemHoverBg: isDark ? '#262626' : '#f3f4f6',
      },
      Card: {
        colorBgContainer: isDark ? '#171717' : '#ffffff',
      },
      Button: {
        primaryColor: '#ffffff',
        primaryShadow: '0 2px 0 rgba(16, 185, 129, 0.1)',
      },
      Input: {
        activeBorderColor: '#10b981',
        hoverBorderColor: '#10b981',
      },
      Table: {
        headerBg: isDark ? '#262626' : '#f9fafb',
        rowHoverBg: isDark ? '#262626' : '#f9fafb',
      },
    },
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ConfigProvider theme={antTheme}>
        {children}
        {/* Theme Toggle Button */}
        {/* <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <SunOutlined style={{ fontSize: 20 }} /> : <MoonOutlined style={{ fontSize: 20 }} />}
        </button> */}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
