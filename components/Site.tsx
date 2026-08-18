import { GLStage } from '@/components/gl/GLLayer';
import { Header } from '@/components/layout/Header';
import { ProgressRail } from '@/components/layout/ProgressRail';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { About } from '@/components/sections/About';
import { Anatomy } from '@/components/sections/Anatomy';
import { Benefits } from '@/components/sections/Benefits';
import { Capacity } from '@/components/sections/Capacity';
import { Colors } from '@/components/sections/Colors';
import { Connection } from '@/components/sections/Connection';
import { Contact } from '@/components/sections/Contact';
import { HeatOutput } from '@/components/sections/HeatOutput';
import { Hero } from '@/components/sections/Hero';
import { ModelRange } from '@/components/sections/ModelRange';
import { Quality } from '@/components/sections/Quality';
import { Systems } from '@/components/sections/Systems';
import { Technology } from '@/components/sections/Technology';
import { Warranty } from '@/components/sections/Warranty';
import type { Dictionary } from '@/content';

/** Single page composition, shared by both locales. */
export function Site({ dict }: { dict: Dictionary }) {
  return (
    <>
      <SmoothScroll />
      <GLStage />
      <Header dict={dict} />
      <ProgressRail label={dict.progress.label} of={dict.progress.of} />

      <main>
        <Hero dict={dict} />
        <About dict={dict} />
        <Capacity dict={dict} />
        <Technology dict={dict} />
        <Anatomy dict={dict} />
        <Quality dict={dict} />
        <HeatOutput dict={dict} />
        <Benefits dict={dict} />
        <Systems dict={dict} />
        <Connection dict={dict} />
        <ModelRange dict={dict} />
        <Colors dict={dict} />
        <Warranty dict={dict} />
        <Contact dict={dict} />
      </main>
    </>
  );
}
