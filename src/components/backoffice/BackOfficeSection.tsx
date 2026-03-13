interface Props {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const BackOfficeSection = ({ id, title, children }: Props) => {
  return (
    <section className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-visible">
      <div className="sticky top-[120px] z-10 px-5 py-3.5 border-b border-border/30 bg-card/95 backdrop-blur-md shadow-[0_4px_12px_-2px_hsl(var(--foreground)/0.08)]">
        <h2 className="text-base font-display font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-5 pb-5 pt-4">
        {children}
      </div>
    </section>
  );
};

export default BackOfficeSection;
