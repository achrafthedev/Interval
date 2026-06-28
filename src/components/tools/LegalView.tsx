import { useState } from 'react'
import { useTheme } from '../ThemeProvider'

type Tab = 'about' | 'privacy' | 'terms'

export function LegalView() {
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const [tab, setTab] = useState<Tab>('about')

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-2xl">
        <div className={`flex rounded-xl border ${border} p-1 mb-8`}>
          {([['about', 'About'], ['privacy', 'Privacy Policy'], ['terms', 'Terms of Service']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-indigo-600 text-white' : textSecondary}`}>
              {label}
            </button>
          ))}
        </div>

        <div className={`prose-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'} leading-relaxed space-y-4`}>
          {tab === 'about' && (
            <>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>About Interval</h1>
              <p>Interval is a free, open-source progressive web app built for precise time management. It provides a complete suite of clock, alarm, timer, and stopwatch tools — all running directly in your browser with no sign-up, no ads, and no tracking.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Our Mission</h2>
              <p>We believe essential utility tools should be free, fast, private, and accessible to everyone. Interval is designed to replace bloated, ad-heavy clock websites with a clean, modern, and fully offline-capable alternative.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Open Source</h2>
              <p>Interval is fully open-source under the MIT License. You can view, fork, and contribute to the source code on <a href="https://github.com/achrafthedev/Interval" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">GitHub</a>.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Technology</h2>
              <p>Built with React, TypeScript, Tailwind CSS, and Vite. Audio is synthesized using the Web Audio API. All data is stored locally in your browser using localStorage — nothing is sent to any server.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Contact</h2>
              <p>For bug reports, feature requests, or questions, please open an issue on <a href="https://github.com/achrafthedev/Interval/issues" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">GitHub Issues</a>.</p>
            </>
          )}

          {tab === 'privacy' && (
            <>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>Privacy Policy</h1>
              <p className={`text-xs ${textMuted}`}>Last updated: June 28, 2025</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Summary</h2>
              <p>Interval does not collect, store, or transmit any personal data. Your privacy is absolute.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Data Storage</h2>
              <p>All user data (alarms, timers, preferences, world clock cities) is stored exclusively in your browser's localStorage. This data never leaves your device and is not accessible to us or any third party.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Analytics & Tracking</h2>
              <p>Interval does not use any analytics services, cookies, tracking pixels, or fingerprinting techniques. We do not use Google Analytics, Facebook Pixel, or any similar tools. There are zero third-party trackers.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Geolocation</h2>
              <p>If you choose to use the location detection feature, your browser will ask for permission first. Your coordinates are sent to BigDataCloud's free reverse geocoding API solely to determine your city name and timezone. Your location is not stored on any server and is only cached locally in your browser.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>City Search</h2>
              <p>When searching for cities, queries may be sent to OpenStreetMap's Nominatim API and TimeAPI.io to resolve city names and timezones. These are free, privacy-respecting public APIs. No personal data is included in these requests.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Third-Party Services</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Google Fonts</strong> — Inter and Orbitron fonts are loaded from Google Fonts CDN. Google's <a href="https://developers.google.com/fonts/faq/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">font privacy policy</a> applies.</li>
                <li><strong>OpenStreetMap Nominatim</strong> — Used for city search geocoding. <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">OSM privacy policy</a> applies.</li>
                <li><strong>GitHub Pages</strong> — The app is hosted on GitHub Pages. GitHub's <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">privacy statement</a> applies to hosting.</li>
              </ul>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Cookies</h2>
              <p>Interval does not set any cookies. We use localStorage (not cookies) for preference storage, which is not transmitted in HTTP requests.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Children's Privacy</h2>
              <p>Interval does not knowingly collect any information from children. The app collects no personal information from anyone.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Changes</h2>
              <p>Any changes to this privacy policy will be posted on this page. Since Interval collects no data, material changes are unlikely.</p>
            </>
          )}

          {tab === 'terms' && (
            <>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>Terms of Service</h1>
              <p className={`text-xs ${textMuted}`}>Last updated: June 28, 2025</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Acceptance</h2>
              <p>By accessing and using Interval, you agree to these Terms of Service. If you do not agree, please do not use the application.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Service Description</h2>
              <p>Interval is a free, open-source web application providing clock, alarm, timer, stopwatch, and time utility tools. The service is provided "as is" without warranties of any kind.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Accuracy Disclaimer</h2>
              <p>While Interval strives for accuracy, time displays depend on your device's system clock. Alarm reliability depends on browser behavior, tab state, and operating system power management. Interval should not be used as the sole alarm for safety-critical wake-up scenarios.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Limitation of Liability</h2>
              <p>Interval and its developers are not liable for any damages arising from the use or inability to use the application, including but not limited to missed alarms, inaccurate time displays, or data loss.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Intellectual Property</h2>
              <p>Interval is released under the MIT License. You are free to use, modify, and distribute the source code in accordance with the license terms.</p>
              <h2 className={`text-lg font-semibold ${textPrimary} pt-2`}>Modifications</h2>
              <p>We reserve the right to modify these terms at any time. Continued use of Interval after changes constitutes acceptance of the updated terms.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
