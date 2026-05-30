import { redirect } from 'next/navigation';

type AccommodationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccommodationsPage({
  searchParams,
}: AccommodationsPageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      qs.set(key, value);
    } else if (Array.isArray(value) && value[0]) {
      qs.set(key, value[0]);
    }
  }

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  redirect(`/stay-with-us${suffix}`);
}
