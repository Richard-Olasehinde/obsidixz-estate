import { processSteps } from '@/lib/content';

type ProcessIconName = (typeof processSteps)[number]['icon'];

const iconPaths: Record<ProcessIconName, React.ReactNode> = {
  document: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14.5 3v4.5H19" />
      <path d="M9.5 12.5h6M9.5 16h6M9.5 9h2.5" />
    </>
  ),
  scope: (
    <>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
      <path d="M8 10.5h5" />
    </>
  ),
  verify: (
    <>
      <path d="M12 3l7.5 3v6c0 4.2-3 7.2-7.5 9-4.5-1.8-7.5-4.8-7.5-9V6z" />
      <path d="M8.5 12l2.4 2.4L16 10" />
    </>
  ),
  handover: (
    <>
      <path d="M3.5 8.5h6l4 2h5a2 2 0 0 1 0 4h-3" />
      <path d="M3.5 8.5V18h4l3 2h6.5" />
      <path d="M3.5 12.5h5" />
    </>
  ),
};

function StepIcon({ name }: { name: ProcessIconName }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      {iconPaths[name]}
    </svg>
  );
}

type ProcessStepsProps = {
  /** `full` shows the detail paragraph. `compact` shows only the summary. */
  variant?: 'full' | 'compact';
  tone?: 'light' | 'dark';
  /** Optionally limit the number of steps shown. */
  limit?: number;
};

export function ProcessSteps({ variant = 'full', tone = 'light', limit }: ProcessStepsProps) {
  const steps = typeof limit === 'number' ? processSteps.slice(0, limit) : processSteps;
  const isDark = tone === 'dark';

  return (
    <ol className="grid gap-px border border-charcoal/10 bg-charcoal/10 sm:grid-cols-2 xl:grid-cols-5">
      {steps.map((step) => (
        <li
          key={step.step}
          className={[
            'group relative flex flex-col gap-4 p-6 transition-colors duration-200',
            isDark ? 'bg-ink' : 'bg-white',
            isDark ? 'hover:bg-[#181818]' : 'hover:bg-mist',
          ].join(' ')}
        >
          <div className="flex items-center justify-between">
            <span
              className={[
                'font-display text-[0.8rem] font-bold tracking-[0.16em]',
                isDark ? 'text-gold' : 'text-gold',
              ].join(' ')}
            >
              STEP {step.step}
            </span>
            <span className={isDark ? 'text-[#8fa3bf]' : 'text-royal'}>
              <StepIcon name={step.icon} />
            </span>
          </div>

          <h3
            className={[
              'text-h3 font-semibold',
              isDark ? 'text-white' : 'text-ink',
            ].join(' ')}
          >
            {step.title}
          </h3>

          <p
            className={[
              'text-[0.95rem] leading-relaxed',
              isDark ? 'text-[#a8b3c0]' : 'text-charcoal/80',
            ].join(' ')}
          >
            {variant === 'full' ? step.detail : step.summary}
          </p>
        </li>
      ))}
    </ol>
  );
}
