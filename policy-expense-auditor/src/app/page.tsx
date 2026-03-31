import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          Policy-First <span className="text-slate-500">Expense Auditor</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Automate your expense auditing with Gemini-powered OCR and RAG-based policy checking.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/dashboard"
            className="rounded-xl bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            Go to Dashboard
          </Link>
          <Link href="/about" className="text-base font-semibold leading-7 text-slate-900 hover:text-slate-600">
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
