/** Shared Tailwind classes for the Right Stay Africa admin dashboard (light theme). */
export const admin = {
  page: 'p-6 lg:p-8',
  heading: 'text-2xl font-bold tracking-tight text-slate-900',
  subheading: 'text-slate-500 mt-1',
  sectionTitle: 'text-lg font-semibold text-slate-900',
  label: 'block text-sm font-medium text-slate-700 mb-1.5',
  hint: 'text-sm text-slate-500',
  card: 'bg-white rounded-xl border border-slate-200 shadow-sm',
  cardHover:
    'bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all',
  cardMuted: 'bg-slate-50 rounded-xl border border-slate-200',
  statCard: 'bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5',
  input:
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors',
  inputMono:
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors',
  select:
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors appearance-none cursor-pointer',
  textarea:
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-right-stay-500/25 focus:border-right-stay-500 transition-colors resize-none',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-right-stay-500 hover:bg-right-stay-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50',
  btnGhost:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors',
  btnDanger:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors',
  btnIcon: 'p-2 rounded-lg transition-colors min-h-11 min-w-11 inline-flex items-center justify-center',
  tableWrap: 'overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm',
  table: 'w-full text-sm',
  thead: 'bg-slate-50 border-b border-slate-200',
  th: 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
  tbody: 'divide-y divide-slate-100',
  tr: 'hover:bg-slate-50/80 transition-colors',
  td: 'px-4 py-3 text-slate-700 whitespace-nowrap',
  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm',
  modalOverlayScroll: 'fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6',
  modalPanel: 'bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto',
  modalHeader:
    'sticky top-0 z-10 bg-white border-b border-slate-200 p-6 flex justify-between items-center rounded-t-2xl',
  alertSuccess: 'p-4 rounded-lg flex items-center gap-2 bg-green-50 border border-green-200 text-green-800',
  alertError: 'p-4 rounded-lg flex items-center gap-2 bg-red-50 border border-red-200 text-red-800',
  spinner: 'w-8 h-8 text-right-stay-500 animate-spin',
  empty: 'text-center py-12 text-slate-500',
  iconBtnBlue: 'p-2 text-right-stay-600 hover:bg-right-stay-50 rounded-lg transition-colors min-h-11',
  iconBtnGreen: 'p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors min-h-11',
  iconBtnRed: 'p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-11',
} as const;

export function statusBadge(status: string): string {
  const base = 'px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize';
  switch (status) {
    case 'confirmed':
      return `${base} bg-green-50 text-green-700 border-green-200`;
    case 'pending':
      return `${base} bg-amber-50 text-amber-700 border-amber-200`;
    case 'cancelled':
      return `${base} bg-red-50 text-red-700 border-red-200`;
    case 'completed':
      return `${base} bg-blue-50 text-blue-700 border-blue-200`;
    default:
      return `${base} bg-slate-50 text-slate-600 border-slate-200`;
  }
}

export function paymentBadge(status: string): string {
  const base = 'px-2.5 py-0.5 text-xs font-medium rounded-full border capitalize';
  switch (status) {
    case 'paid':
      return `${base} bg-green-50 text-green-700 border-green-200`;
    case 'partial':
      return `${base} bg-amber-50 text-amber-700 border-amber-200`;
    case 'pending':
      return `${base} bg-orange-50 text-orange-700 border-orange-200`;
    case 'refunded':
      return `${base} bg-red-50 text-red-700 border-red-200`;
    default:
      return `${base} bg-slate-50 text-slate-600 border-slate-200`;
  }
}
