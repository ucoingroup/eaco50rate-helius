import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, LANGUAGES, type Lang, type Translation, type LangInfo } from '../locales/i18n'

interface LanguageContextType {
  t: Translation
  lang: Lang
  setLang: (l: Lang) => void
  languages: LangInfo[]
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    // Try to detect browser language
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase()
      for (const l of LANGUAGES) {
        if (browserLang.startsWith(l.code)) return l.code
      }
    }
    return 'zh'
  })

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const setLang = (l: Lang) => setLangState(l)
  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ t, lang, setLang, languages: LANGUAGES, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
