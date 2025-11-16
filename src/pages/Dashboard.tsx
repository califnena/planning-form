// src/pages/Dashboard.tsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type TextSize = "normal" | "large" | "xlarge"

const TEXT_SIZE_KEY = "efa-text-size"

const textSizeToClass: Record<TextSize, string> = {
  normal: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
}

const tiles = [
  {
    key: "pre-planning",
    title: "Pre-Planning",
    description: "Plan wishes, documents, and details in advance.",
    icon: "📝",
    href: "/app",
  },
  {
    key: "after-death",
    title: "After Death Steps",
    description: "Simple checklist of what to do after a loss.",
    icon: "📌",
    href: "/next-steps",
  },
  {
    key: "vendors",
    title: "Helpful Contacts & Vendors",
    description: "Insurance, lawyers, financial advisors, funeral providers.",
    icon: "📇",
    href: "/vendors",
  },
  {
    key: "blank-forms",
    title: "Blank / Fillable Forms",
    description: "Printable and digital forms you can fill in.",
    icon: "📂",
    href: "/forms",
  },
  {
    key: "vip-coach",
    title: "VIP Coach Assistant",
    description: "Work with a live advisor or premium support.",
    icon: "⭐",
    href: "/vip-coach",
  },
  {
    key: "quote",
    title: "Request a Quote / Contact Us",
    description: "Ask questions, request pricing, or schedule a call.",
    icon: "☎️",
    href: "/contact",
  },
  {
    key: "trusted-contacts",
    title: "Trusted Contacts",
    description: "List the people who should have access to this plan.",
    icon: "👥",
    href: "/app",
  },
  {
    key: "resources",
    title: "Helpful Resources",
    description: "Guides, links, and videos to help you and your family.",
    icon: "📚",
    href: "/resources",
  },
  {
    key: "questions",
    title: "Common Questions",
    description: "Short answers to common planning questions.",
    icon: "❓",
    href: "/faq",
  },
]

export default function Dashboard() {
  const [textSize, setTextSize] = useState<TextSize>("normal")

  // Load saved text size from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TEXT_SIZE_KEY) as TextSize | null
      if (saved && ["normal", "large", "xlarge"].includes(saved)) {
        setTextSize(saved)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  // Save text size when it changes
  useEffect(() => {
    try {
      localStorage.setItem(TEXT_SIZE_KEY, textSize)
    } catch {
      // ignore storage errors
    }
  }, [textSize])

  const textSizeClass = textSizeToClass[textSize]

  return (
    <div className={`min-h-screen bg-slate-50 px-4 py-8 md:px-8 ${textSizeClass}`}>
      <div className="mx-auto max-w-6xl">
        {/* Top bar with greeting and text size controls */}
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-slate-500">Welcome back</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              What would you like to work on today?
            </h1>
          </div>

          {/* Text size controls */}
          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 shadow-sm">
            <span className="text-xs font-medium text-slate-600">Text size</span>
            <button
              type="button"
              onClick={() => setTextSize("normal")}
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                textSize === "normal"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-label="Normal text size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setTextSize("large")}
              className={`rounded-full px-2 py-1 text-sm font-semibold ${
                textSize === "large"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-label="Large text size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setTextSize("xlarge")}
              className={`rounded-full px-2 py-1 text-base font-semibold ${
                textSize === "xlarge"
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-label="Extra large text size"
            >
              A
            </button>
          </div>
        </header>

        {/* Tiles grid */}
        <section aria-label="Main actions">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tiles.map((tile) => (
              <Link
                key={tile.key}
                to={tile.href}
                className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-xl">
                    <span aria-hidden="true">{tile.icon}</span>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-sky-700">
                    {tile.title}
                  </h2>
                  <p className="text-sm text-slate-600">{tile.description}</p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-sky-700 group-hover:underline">
                  Open
                  <span className="ml-1" aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
