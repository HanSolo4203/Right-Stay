import { notFound } from 'next/navigation';

const SIZES = [16, 32, 48] as const;

export default function FaviconPreviewPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#0b100b] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#6ba066]">
            Right Stay Africa
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Favicon preview
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Green badge with RSA set in the Right Stay logo serif, with a solid bar under the
            letters. This is the mark that will replace the globe in browser tabs and Google search.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-white/45">Large</p>
          <img
            src="/apple-touch-icon.png?v=serif2"
            alt="RSA favicon large"
            width={180}
            height={180}
            className="mx-auto rounded-[40px] shadow-2xl shadow-black/40"
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-white/45">Actual sizes</p>
          <div className="flex flex-wrap items-end gap-8">
            {SIZES.map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <div className="flex h-16 items-center justify-center">
                  <img
                    src={`/favicon-${size}x${size}.png?v=serif2`}
                    alt={`RSA favicon ${size}px`}
                    width={size}
                    height={size}
                    className="rounded-[20%]"
                    style={{ width: size, height: size }}
                  />
                </div>
                <span className="text-xs text-white/50">{size}px</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-white/45">Browser tab</p>
          <div className="inline-flex items-center gap-2 rounded-t-lg border border-b-0 border-white/10 bg-[#1f1f1f] px-3 py-2">
            <img src="/favicon-16x16.png?v=serif2" alt="" width={16} height={16} className="rounded-[3px]" />
            <span className="text-sm text-white/85">Right Stay Africa</span>
            <span className="ml-2 text-white/35">×</span>
          </div>
          <div className="h-10 rounded-b-lg rounded-tr-lg border border-white/10 bg-[#141414]" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white p-6 text-black">
          <p className="mb-5 text-xs uppercase tracking-[0.2em] text-black/40">Google search result</p>
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <img
                  src="/favicon-32x32.png?v=serif2"
                  alt="RSA favicon"
                  width={18}
                  height={18}
                  className="rounded-full"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm leading-tight text-[#202124]">rightstayafrica.com</p>
                  <p className="truncate text-xs text-[#4d5156]">https://www.rightstayafrica.com</p>
                </div>
              </div>
              <p className="mt-2 text-xl leading-snug text-[#1a0dab]">
                Right Stay Africa | Premium Accommodations &amp; African ...
              </p>
              <p className="mt-1 text-sm leading-snug text-[#4d5156]">
                Your premier destination for exceptional short-term rentals across Africa. Discover
                luxury accommodations, curated tours, and professional property ...
              </p>
            </div>
            <img
              src="/og-landing-square.jpg"
              alt="Right Stay Africa landing page"
              width={92}
              height={92}
              className="hidden h-[92px] w-[92px] shrink-0 rounded-lg object-cover object-center sm:block"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
