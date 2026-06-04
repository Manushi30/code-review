import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  Gauge,
  GraduationCap,
  Languages,
  ListChecks,
  Trophy,
  ArrowRight,
  Code2,
  Sparkles,
  ShieldCheck,
  BarChart3,
  BookOpen,
  Zap,
} from 'lucide-react';
import styles from './HomePage.module.css';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Code Analysis',
    description: 'Understand bugs, style issues, and logic flaws with intelligent review that explains why.',
  },
  {
    icon: Zap,
    title: 'Instant Feedback',
    description: 'Get actionable suggestions the moment you submit code and keep your momentum going.',
  },
  {
    icon: BarChart3,
    title: 'Score Tracking',
    description: 'See progress over time with clear scores that make improvement easy to measure.',
  },
  {
    icon: Languages,
    title: 'Multi-Language Support',
    description: 'Review Python, Java, and C++ code with language-aware analysis that fits your stack.',
  },
  {
    icon: BookOpen,
    title: 'Learning Insights',
    description: 'Turn every code review into a lesson with AI guidance built for students.',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    description: 'Compete, compare, and stay motivated with a friendly learning leaderboard.',
  },
];

const STEPS = [
  {
    icon: Code2,
    title: 'Write Code',
    description: 'Code naturally in the editor using the language you are learning.',
  },
  {
    icon: ShieldCheck,
    title: 'Get AI Review',
    description: 'Submit your code and receive a structured review with issues and improvements.',
  },
  {
    icon: GraduationCap,
    title: 'Improve & Learn',
    description: 'Apply the feedback, grow your skills, and build better habits over time.',
  },
];

const STATS = [
  { label: 'Reviews Done', value: 10000, suffix: '+' },
  { label: 'Accuracy', value: 95, suffix: '%' },
  { label: 'Languages Supported', value: 3, suffix: '' },
  { label: 'Students', value: 500, suffix: '+' },
];

function CountUp({ end, suffix = '', duration = 1400 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    if (!inView) return undefined;

    const startTime = performance.now();
    let frameId = 0;

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(end * eased));
      if (progress < 1) frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [duration, end, inView]);

  return (
    <span ref={ref} className={styles.statValue}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className={styles.sectionHeading}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const heroVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }),
    [],
  );

  return (
    <div className={styles.page}>
      <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.brand} aria-label="CodeReview AI home">
            <span className={styles.brandIcon}></></span>
            <span>CodeReview AI</span>
          </Link>

          <div className={styles.navActions}>
            <Link to="/login" className={`${styles.navButton} ${styles.navButtonOutline}`}>
              Login
            </Link>
            <Link to="/signup" className={`${styles.navButton} ${styles.navButtonFilled}`}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.heroSection}>
          <div className={styles.heroBackdrop} />
          <div className={styles.container}>
            <motion.div
              className={styles.heroContent}
              variants={heroVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <div className={styles.heroBadge}>
                <Sparkles size={16} />
                AI-powered code review for students
              </div>
              <h1>Review Smarter, Code Better</h1>
              <p>
                Get clear, supportive, AI-powered feedback on your code so you can improve faster,
                build confidence, and learn by doing.
              </p>
              <div className={styles.heroActions}>
                <Link to="/signup" className={`${styles.primaryButton} ${styles.buttonBase}`}>
                  Start Learning Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className={`${styles.secondaryButton} ${styles.buttonBase}`}>
                  Login to Continue
                </Link>
              </div>

              <div className={styles.heroMeta}>
                <div className={styles.metaCard}>
                  <Gauge size={18} />
                  <span>Fast feedback</span>
                </div>
                <div className={styles.metaCard}>
                  <ListChecks size={18} />
                  <span>Structured insights</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className={styles.altSection}>
          <div className={styles.container}>
            <SectionHeading
              eyebrow="Features"
              title="Everything you need to learn from every submission"
              description="A polished review experience that helps students understand issues, track growth, and keep improving."
            />
            <div className={styles.featureGrid}>
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.title}
                    className={styles.featureCard}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.55, delay: index * 0.06 }}
                  >
                    <div className={styles.cardIcon}>
                      <Icon size={22} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <SectionHeading
              eyebrow="How It Works"
              title="A simple flow from code to confidence"
              description="Review, learn, and iterate with a system designed to make practice feel rewarding."
            />
            <div className={styles.stepsGrid}>
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.article
                    key={step.title}
                    className={styles.stepCard}
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <div className={styles.stepNumber}>0{index + 1}</div>
                    <div className={styles.stepIcon}>
                      <Icon size={24} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.altSection}>
          <div className={styles.container}>
            <SectionHeading
              eyebrow="Impact"
              title="Built to help students learn at scale"
              description="Real learning outcomes backed by meaningful metrics and an experience that feels motivating."
            />
            <div className={styles.statsGrid}>
              {STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className={styles.statCard}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <CountUp end={stat.value} suffix={stat.suffix} />
                  <span className={styles.statLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.container}>
            <div className={styles.ctaCard}>
              <div>
                <span className={styles.eyebrow}>Get Started</span>
                <h2>Ready to review smarter and improve faster?</h2>
                <p>Log in to continue your progress or create an account and start learning today.</p>
              </div>
              <div className={styles.ctaActions}>
                <Link to="/login" className={`${styles.secondaryButton} ${styles.buttonBase}`}>
                  Login
                </Link>
                <Link to="/signup" className={`${styles.primaryButton} ${styles.buttonBase}`}>
                  Sign Up
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <span className={styles.footerBrand}>CodeReview AI</span>
            <p>AI-powered code review built to help students learn, improve, and grow with confidence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
