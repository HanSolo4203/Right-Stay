import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/sections/SiteHeader";
import ThingsToDoExplorer from "@/components/guide/ThingsToDoExplorer";
import { findPublishedGuideProperty, getPublicGuidePageData } from "@/lib/guide-data";
import { isGuideEnabled } from "@/lib/public-site-settings";

export const metadata: Metadata = {
  title: "Things To Do in Cape Town | Right Stay Africa",
  description:
    "A local shortlist of restaurants, beaches, viewpoints and neighbourhood favourites to explore around Cape Town — pinned on the map near where you're staying.",
};

type ThingsToDoPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ThingsToDoPage({ searchParams }: ThingsToDoPageProps) {
  const guideEnabled = await isGuideEnabled();
  if (!guideEnabled) {
    notFound();
  }

  const params = await searchParams;
  const { categories, places, properties, loadError } = await getPublicGuidePageData();
  const activeProperty = findPublishedGuideProperty(properties, params.property);

  return (
    <>
      <SiteHeader />
      <ThingsToDoExplorer
        categories={categories}
        places={places}
        properties={properties}
        activeProperty={activeProperty}
        loadError={loadError}
      />
    </>
  );
}
