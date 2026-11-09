import { Diamond } from './Motifs';

type FieldListProps = {
  items: { label: string; description?: string; caveat?: string }[];
  tone?: 'light' | 'dark';
  /** Two columns on wide screens. */
  columns?: 1 | 2;
};

/**
 * Renders a list of research fields / deliverables. Each row has a small
 * geometric marker, a label and an optional explanation. Caveats are rendered
 * inline rather than hidden in a footnote: the point of the list is honesty
 * about what may be missing.
 */
export function FieldList({ items, tone = 'light', columns = 2 }: FieldListProps) {
  const isDark = tone === 'dark';

  return (
    <ul
      className={[
        'grid gap-x-10 gap-y-0',
        columns === 2 ? 'sm:grid-cols-2' : '',
        isDark ? 'border-charcoal/0' : '',
      ].join(' ')}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className={[
            'flex gap-3.5 border-t py-5 first:border-t-0 sm:first:border-t',
            isDark ? 'border-white/12' : 'border-charcoal/10',
          ].join(' ')}
        >
          <Diamond
            className={[
              'mt-[0.45rem] h-2.5 w-2.5 shrink-0',
              isDark ? 'text-gold' : 'text-gold-deep',
            ].join(' ')}
          />
          <div className="min-w-0">
            <p
              className={[
                'text-[0.98rem] font-semibold',
                isDark ? 'text-white' : 'text-ink',
              ].join(' ')}
            >
              {item.label}
            </p>
            {item.description ? (
              <p
                className={[
                  'mt-1 text-[0.93rem] leading-relaxed',
                  isDark ? 'text-[#a8b3c0]' : 'text-charcoal/75',
                ].join(' ')}
              >
                {item.description}
              </p>
            ) : null}
            {item.caveat ? (
              <p
                className={[
                  'mt-2 border-l-2 pl-3 text-[0.85rem] leading-relaxed',
                  isDark
                    ? 'border-gold/50 text-[#93a0b0]'
                    : 'border-gold/45 text-charcoal/60',
                ].join(' ')}
              >
                {item.caveat}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
