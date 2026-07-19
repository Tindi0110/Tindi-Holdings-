import { motion, useScroll, useSpring } from "motion/react";
import logo from "@/assets/logo_mockup_1784469206024.jpg";

export function Logo({ className }: { className?: string }) {
  return (
    <img src={logo} alt="Tindi Group Logo" className={`h-12 w-auto object-contain ${className}`} />
  );
}
