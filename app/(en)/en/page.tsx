import { JsonLd } from '@/app/_shared/JsonLd';
import { Site } from '@/components/Site';
import { en } from '@/content/en';

export default function EnPage() {
  return (
    <>
      <JsonLd dict={en} locale="en" />
      <Site dict={en} />
    </>
  );
}
