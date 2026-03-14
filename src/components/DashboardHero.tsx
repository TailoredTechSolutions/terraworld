import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPIBadge {
  icon: LucideIcon;
  label: string;
  value: string;
}

interface DashboardHeroProps {
  title: string;
  subtitle: string;
  badge?: string;
  backgroundImage: string;
  kpis?: KPIBadge[];
  children?: React.ReactNode;
}

const DashboardHero = ({ title, subtitle, badge, backgroundImage, kpis = [], children }: DashboardHeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 0.75]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <div ref={heroRef} className="relative h-[260px] md:h-[300px] -mx-4 -mt-6 mb-6 overflow-hidden rounded-b-[2rem]">
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y: imageY, scale: imageScale }}>
        <img
          src={backgroundImage}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
      </motion.div>

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--earth-dark))] via-[hsl(var(--earth-dark)/0.5)] to-transparent"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-end px-6 pb-6 md:px-8 md:pb-8"
        style={{ y: contentY }}
      >
        {/* Badge */}
        {badge && (
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 w-fit rounded-full text-xs font-medium
              bg-[hsl(var(--glass))] backdrop-blur-md border border-[hsl(var(--glass-border))]
              text-white/90 shadow-sm"
          >
            {badge}
          </motion.span>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-white/70 text-sm mt-1 max-w-lg"
        >
          {subtitle}
        </motion.p>

        {/* KPI Badges row */}
        {kpis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex flex-wrap gap-2 mt-4"
          >
            {kpis.map((kpi, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                  bg-[hsl(var(--glass))] backdrop-blur-md border border-[hsl(var(--glass-border))]
                  shadow-sm"
              >
                <kpi.icon className="h-3.5 w-3.5 text-white/70" />
                <span className="text-xs font-semibold text-white">{kpi.value}</span>
                <span className="text-[10px] text-white/60">{kpi.label}</span>
              </div>
            ))}
          </motion.div>
        )}

        {children}
      </motion.div>
    </div>
  );
};

export default DashboardHero;
