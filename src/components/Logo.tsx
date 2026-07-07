import { motion, useScroll, useSpring } from "motion/react";
import logo from "@/assets/logo.png";

export function Logo({ className }: { className?: string }) {
  return (
    <img src={logo} alt="Tindi Group Logo" className={`h-12 w-auto object-contain ${className}`} />
  );
}
