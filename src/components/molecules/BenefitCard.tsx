export function BenefitCard({ title, text }: { title: string; text: string }) {
  return <article className="benefit-card"><h3>{title}</h3><p>{text}</p></article>
}
