import Link from "next/link";
import styles from "./LandingPage.module.css";

const plans = [
  {
    name: "Básico",
    price: "$49",
    featured: false,
    features: [
      { label: "Acceso a módulos fundamentales", included: true },
      { label: "Guías y plantillas descargables", included: true },
      { label: "Perfil Digital QR", included: false },
    ],
    action: "Elegir Básico",
  },
  {
    name: "Pro",
    price: "$99",
    featured: true,
    features: [
      { label: "Todo lo del Plan Básico", included: true },
      { label: "Generación de Perfil Digital QR", included: true },
      { label: "Una sesión de simulación de entrevista", included: true },
      { label: "Seguimiento personalizado", included: false },
    ],
    action: "Comenzar Pro",
  },
  {
    name: "Premium",
    price: "$199",
    featured: false,
    features: [
      { label: "Todo lo del Plan Pro", included: true },
      { label: "Seguimiento individual semanal", included: true },
      { label: "Acceso directo a una red de reclutadores", included: true },
    ],
    action: "Elegir Premium",
  },
];

const steps = [
  {
    number: "01",
    title: "Capacítate",
    icon: "✳",
    description:
      "Accede a módulos formativos clave para actualizar tus habilidades y entender las demandas del mercado laboral actual.",
  },
  {
    number: "02",
    title: "Prepárate",
    icon: "↗",
    description:
      "Optimiza tu CV, genera tu Perfil Digital QR y domina las entrevistas con nuestras sesiones de simulación personalizadas.",
  },
  {
    number: "03",
    title: "Empléate",
    icon: "✓",
    description:
      "Conecta con nuestra red de reclutadores y recibe seguimiento continuo hasta alcanzar tu objetivo profesional.",
  },
];

const companies = ["TechCorp", "GlobalBank", "InnovateInc", "StartUp Hub"];

export default function LandingPage() {
  return (
    <div className={styles.page} id="inicio">
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Navegación principal">
          <Link className={styles.brand} href="#inicio" aria-label="Empleamás, inicio">
            emplea<span>más</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#planes">Planes</a>
            <a href="#historias">Historias</a>
          </div>
          <Link className={styles.loginLink} href="/inicio_sesion">
            Iniciar sesión <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Tu carrera, en movimiento</p>
              <h1 id="hero-title">Tu próximo empleo comienza aquí.</h1>
              <p className={styles.heroDescription}>
                Asesoría laboral personalizada, herramientas digitales y
                acompañamiento profesional para impulsar tu carrera y destacar
                en el mercado actual.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href="#planes">
                  Explorar planes <span aria-hidden="true">→</span>
                </a>
                <a className={styles.secondaryButton} href="#como-funciona">
                  Conoce el proceso
                </a>
              </div>
              <p className={styles.heroNote}>Un camino claro hacia tu siguiente oportunidad.</p>
            </div>
            <div
              className={styles.heroPhoto}
              role="img"
              aria-label="Profesionales colaborando en un espacio de trabajo moderno"
            />
          </div>
          <a className={styles.scrollCue} href="#como-funciona">
            Descubre cómo <span aria-hidden="true">↓</span>
          </a>
        </section>

        <section className={styles.process} id="como-funciona" aria-labelledby="process-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Un plan que avanza contigo</p>
            <h2 id="process-title">De la búsqueda a tu próximo paso.</h2>
            <p>
              Un proceso estructurado en tres etapas para fortalecer tu perfil
              y abrir nuevas oportunidades profesionales.
            </p>
          </div>
          <div className={styles.steps}>
            {steps.map((step) => (
              <article className={styles.step} key={step.number}>
                <div className={styles.stepTop}>
                  <span className={styles.stepIcon} aria-hidden="true">{step.icon}</span>
                  <span className={styles.stepNumber}>{step.number}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.pricing} id="planes" aria-labelledby="pricing-title">
          <div className={styles.pricingHeading}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>Invierte en tu futuro</p>
              <h2 id="pricing-title">El impulso que necesitas.</h2>
            </div>
            <p>Elige el acompañamiento que mejor se adapta a tu búsqueda laboral.</p>
          </div>
          <div className={styles.planGrid}>
            {plans.map((plan) => (
              <article
                className={`${styles.plan} ${plan.featured ? styles.featuredPlan : ""}`}
                key={plan.name}
              >
                {plan.featured && <p className={styles.recommended}>Más elegido</p>}
                <div className={styles.planTitle}>
                  <h3>{plan.name}</h3>
                  <p>Plan anual</p>
                </div>
                <p className={styles.planPrice}>
                  {plan.price}<span> / año</span>
                </p>
                <ul className={styles.featureList}>
                  {plan.features.map((feature) => (
                    <li className={feature.included ? "" : styles.unavailable} key={feature.label}>
                      <span aria-hidden="true">{feature.included ? "✓" : "−"}</span>
                      {feature.label}
                    </li>
                  ))}
                </ul>
                <Link
                  className={plan.featured ? styles.planButtonPrimary : styles.planButton}
                  href="/inicio_sesion"
                >
                  {plan.action} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
          <p className={styles.pricingFootnote}>
            Todos los planes incluyen acceso seguro a tu espacio personal.
          </p>
        </section>

        <section className={styles.stories} id="historias" aria-labelledby="stories-title">
          <div className={styles.companyRow}>
            <p>Talento que hoy forma parte de equipos como</p>
            <div className={styles.companyNames}>
              {companies.map((company) => <span key={company}>{company}</span>)}
            </div>
          </div>
          <div className={styles.storiesHeading}>
            <div>
              <p className={styles.eyebrow}>Historias de avance</p>
              <h2 id="stories-title">El próximo logro puede ser tuyo.</h2>
            </div>
            <p>Personas que encontraron claridad, confianza y un nuevo rumbo profesional.</p>
          </div>
          <div className={styles.testimonials}>
            <figure className={styles.testimonial}>
              <div className={styles.person}>
                <div
                  className={`${styles.avatar} ${styles.laura}`}
                  role="img"
                  aria-label="Retrato de Laura"
                />
                <figcaption><strong>Laura M.</strong><span>Analista de datos</span></figcaption>
              </div>
              <blockquote>
                “La simulación de entrevista me dio la confianza que necesitaba.
                Hoy estoy en la empresa que siempre quise.”
              </blockquote>
            </figure>
            <figure className={styles.testimonial}>
              <div className={styles.person}>
                <div
                  className={`${styles.avatar} ${styles.carlos}`}
                  role="img"
                  aria-label="Retrato de Carlos"
                />
                <figcaption><strong>Carlos R.</strong><span>Project manager</span></figcaption>
              </div>
              <blockquote>
                “El acompañamiento marcó la diferencia. Mejoré mi perfil y
                entendí el valor que puedo aportar.”
              </blockquote>
            </figure>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Link className={styles.footerBrand} href="#inicio">emplea<span>más</span></Link>
          <p>© 2026 Empleamás. Asesorías laborales que impulsan tu futuro.</p>
          <nav aria-label="Enlaces legales">
            <a href="mailto:hola@empleamas.com">Contacto</a>
            <a href="mailto:soporte@empleamas.com">Soporte</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}