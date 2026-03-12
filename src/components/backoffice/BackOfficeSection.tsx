interface Props {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const BackOfficeSection = ({ id, title, children }: Props) => {
  return (
    <section className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/30">
        <h2 className="text-base font-display font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-5 pb-5 pt-4">
        {children}
      </div>
    </section>
  );
};

export default BackOfficeSection;
