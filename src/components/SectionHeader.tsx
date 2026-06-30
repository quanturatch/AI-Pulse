"use client";

import { motion } from "framer-motion";
import {
  Atom,
  Bot,
  Brain,
  Database,
  GraduationCap,
  Layers,
  LockKeyhole,
  Newspaper,
  Shield,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Bot,
  Database,
  Wrench,
  Brain,
  Layers,
  Newspaper,
  Atom,
  LockKeyhole,
  GraduationCap,
  Shield,
};

interface SectionHeaderProps {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  gradient?: string;
  accent?: string;
}

export function SectionHeader({
  id,
  title,
  description,
  icon,
  gradient,
  accent,
}: SectionHeaderProps) {
  const Icon = icon ? iconMap[icon] : null;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-8 flex items-start gap-4"
    >
      {(Icon || accent) && (
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient || "from-violet-500 to-cyan-500"} shadow-lg`}
          style={accent ? { background: accent } : undefined}
        >
          {Icon ? (
            <Icon className="h-6 w-6 text-white" />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>
      )}
      <div>
        <h2
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-space)" }}
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-white/50 sm:text-base">{description}</p>
      </div>
    </motion.div>
  );
}