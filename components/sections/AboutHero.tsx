import HeroBackgroundImage from "@/components/ui/HeroBackgroundImage";
import HeroPremiumFadeOverlay from "@/components/ui/HeroPremiumFadeOverlay";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

export default function AboutHero() {
  return (
    <>
      <div className="absolute inset-0">
        <HeroBackgroundImage
          src={MARKETING_IMAGES.heroCapeTown}
          priority
          className="object-[center_58%] sm:object-[center_52%]"
        />
        <div aria-hidden className="hero-copy-wash-left" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto flex min-h-[calc(100svh-96px)] max-w-7xl flex-col justify-center px-6 pb-28 pt-16 md:px-8 md:pb-32 md:pt-20 lg:min-h-[720px]">
          <p
            className="hero-copy-readable animate-on-scroll text-xs font-medium uppercase tracking-[0.32em] text-right-stay-400/90"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.1s both" }}
          >
            About Right Stay Africa
          </p>

          <h1
            className="hero-copy-readable animate-on-scroll mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ animation: "fadeSlideIn 1s ease-out 0.2s both" }}
          >
            Built From Experience.
            <br />
            <span className="text-white/90">Driven By Standards.</span>
          </h1>

          <p
            className="hero-copy-readable animate-on-scroll mt-7 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg lg:text-xl"
            style={{ animation: "fadeSlideIn 1s ease-out 0.35s both" }}
          >
            Right Stay Africa was founded by property owners who believed hospitality, transparency
            and asset management could be done better.
          </p>
        </div>
      </div>

      <HeroPremiumFadeOverlay />
    </>
  );
}
