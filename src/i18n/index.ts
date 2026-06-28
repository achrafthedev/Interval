import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'

export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' },
] as const

export type LangCode = typeof LANGUAGES[number]['code']

// Lazy-load translation files
const loaders: Record<string, () => Promise<{ default: any }>> = {
  fr: () => import('./fr'),
  es: () => import('./es'),
  ar: () => import('./ar'),
  de: () => import('./de'),
  pt: () => import('./pt'),
  zh: () => import('./zh'),
  ja: () => import('./ja'),
  hi: () => import('./hi'),
  ru: () => import('./ru'),
  tr: () => import('./tr'),
  ko: () => import('./ko'),
}

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(result, flattenObject(obj[key], fullKey))
    } else {
      result[fullKey] = obj[key]
    }
  }
  return result
}

function detectLanguage(): string {
  const stored = localStorage.getItem('interval-language')
  if (stored && LANGUAGES.some((l) => l.code === stored)) return stored

  const browserLang = navigator.language?.slice(0, 2) || 'en'
  if (LANGUAGES.some((l) => l.code === browserLang)) return browserLang

  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: flattenObject(en) },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export async function changeLanguage(code: string) {
  if (code !== 'en' && !i18n.hasResourceBundle(code, 'translation')) {
    const loader = loaders[code]
    if (loader) {
      const module = await loader()
      i18n.addResourceBundle(code, 'translation', flattenObject(module.default))
    }
  }
  await i18n.changeLanguage(code)
  localStorage.setItem('interval-language', code)

  const lang = LANGUAGES.find((l) => l.code === code)
  document.documentElement.dir = lang?.dir || 'ltr'
  document.documentElement.lang = code
}

// Load initial language if not English
const initLang = detectLanguage()
if (initLang !== 'en') {
  changeLanguage(initLang)
}

export default i18n
