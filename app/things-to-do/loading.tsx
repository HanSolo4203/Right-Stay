import Header from "@/components/sections/Header";
import { ThingsToDoExplorerSkeleton } from "@/components/guide/GuideExplorerSkeletons";

export default function ThingsToDoLoading() {
  return (
    <>
      <Header guideEnabled />
      <ThingsToDoExplorerSkeleton />
    </>
  );
}
