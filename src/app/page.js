"use client";

import { useCallback, useState } from "react";
import IntroLoader from "@/components/intro/IntroLoader";
import Hero from "@/components/home/Hero";

export default function HomePage() {
  const [introDone, setIntroDone] = useState(false);

  const handleIntroFinish = useCallback(() => setIntroDone(true), []);

  return (
    <>
      {/* The hero renders underneath from the start — the loader needs it laid
          out so it can measure where to fly the logo to. */}
      <Hero revealed={introDone} />
      <IntroLoader onFinish={handleIntroFinish} />
    </>
  );
}
