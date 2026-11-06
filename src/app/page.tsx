import { Section } from '@/components/layout/Section';
import { ButtonLink } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <Section tone="white" spacing="lg">
      <h1 className="text-h2">Obsidixz Real Estate</h1>
      <p className="mt-4 max-w-xl text-charcoal">
        Foundation placeholder. The homepage is built in Stage 2.
      </p>
      <div className="mt-8">
        <ButtonLink href="/contact" variant="primary">
          Contact
        </ButtonLink>
      </div>
    </Section>
  );
}
