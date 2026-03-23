import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function VideoSection() {
  return (
    <section id="video" className="py-32 bg-dark text-dark-foreground">
      <div className="section-padding max-w-[1400px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="space-y-12"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-sm font-semibold tracking-widest uppercase text-accent">
              Veja na prática
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold">
              Conheça o Planest
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/20"
          >
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/gQhPqfa-gYQ"
                title="Vídeo explicativo do Planest"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
