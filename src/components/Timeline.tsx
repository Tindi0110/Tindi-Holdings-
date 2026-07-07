import { motion } from "motion/react";

const milestones = [
  { year: "2015", title: "Foundation", desc: "Tindi Group established." },
  { year: "2017", title: "Tech Launch", desc: "Tindi Tech revolutionizes regional connectivity." },
  { year: "2019", title: "Global Expansion", desc: "Operations scale to 15 countries." },
  { year: "2022", title: "Sustainable Future", desc: "Launch of green hospitality & logistics." },
];

export function Timeline() {
  return (
    <section className="py-24 bg-muted border-b border-border">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground text-center mb-16">
          Our Journey
        </h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.1 }}
          className="relative border-l border-border ml-4 md:ml-12 space-y-12"
        >
          {milestones.map((m, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              className="relative pl-8"
            >
              <div className="absolute -left-2 top-1.5 h-4 w-4 rounded-full bg-slate-400 border-4 border-slate-50" />
              <div className="text-sm font-semibold text-primary mb-1">{m.year}</div>
              <h3 className="text-xl font-bold text-foreground mb-2">{m.title}</h3>
              <p className="text-slate-600">{m.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
