import Reveal from './Reveal'

/**
 * Standard page masthead. The top padding clears the fixed header.
 */
export default function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string
  title: string
  intro?: string
}) {
  return (
    <header className="mx-auto max-w-7xl px-6 pb-14 pt-36 lg:px-10 lg:pb-20 lg:pt-48">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] tracking-tight text-bone">
          {title}
        </h1>
        {intro && (
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-bone-dim sm:text-lg">
            {intro}
          </p>
        )}
      </Reveal>
    </header>
  )
}
