'use client';

import { useState } from 'react';

type PreviewTab = 'admin' | 'guest' | 'both';

interface EmailPreviewClientProps {
  adminHtml: string;
  guestHtml: string;
  adminSubject: string;
  guestSubject: string;
  initialTab?: PreviewTab;
}

export default function EmailPreviewClient({
  adminHtml,
  guestHtml,
  adminSubject,
  guestSubject,
  initialTab = 'both',
}: EmailPreviewClientProps) {
  const [tab, setTab] = useState<PreviewTab>(initialTab);

  const tabs: { id: PreviewTab; label: string }[] = [
    { id: 'both', label: 'Both' },
    { id: 'admin', label: 'Admin notification' },
    { id: 'guest', label: 'Guest auto-reply' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-4 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Development only
        </p>
        <h1 className="mt-1 text-2xl font-bold">Booking email preview</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600">
          Renders the same HTML as Resend sends after a booking request. Edit templates under{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">lib/email-templates/</code>{' '}
          and refresh this page.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? 'bg-[#337e2f] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-8">
        {(tab === 'both' || tab === 'admin') && (
          <PreviewPanel title="Admin notification" subject={adminSubject} html={adminHtml} />
        )}
        {(tab === 'both' || tab === 'guest') && (
          <PreviewPanel title="Guest auto-reply" subject={guestSubject} html={guestHtml} />
        )}
      </main>
    </div>
  );
}

function PreviewPanel({
  title,
  subject,
  html,
}: {
  title: string;
  subject: string;
  html: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Subject: <span className="font-medium text-gray-800">{subject}</span>
        </p>
      </div>
      <iframe
        title={`${title} preview`}
        srcDoc={html}
        sandbox=""
        className="block h-[920px] w-full border-0 bg-gray-50"
      />
    </section>
  );
}
