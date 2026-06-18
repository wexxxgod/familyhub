"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-1">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {action}
    </motion.div>
  );
}
