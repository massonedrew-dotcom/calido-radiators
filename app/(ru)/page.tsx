import { JsonLd } from '@/app/_shared/JsonLd';
import { Site } from '@/components/Site';
import { ru } from '@/content/ru';

export default function RuPage() {
  return (
    <>
      <JsonLd dict={ru} locale="ru" />
      <Site dict={ru} />
    </>
  );
}
