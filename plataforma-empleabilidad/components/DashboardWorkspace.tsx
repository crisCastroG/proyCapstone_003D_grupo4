"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CURRICULUM_UPDATED_EVENT,
  DEFAULT_CURRICULUM,
  loadCurriculum,
  saveCurriculum,
  type Curriculum,
  type LearningModule,
} from "../lib/curriculum";
import styles from "./DashboardWorkspace.module.css";

type DashboardWorkspaceProps = {
  mode: "learner" | "admin";
};

export default function DashboardWorkspace({ mode }: DashboardWorkspaceProps) {
  const [curriculum, setCurriculum] = useState<Curriculum>(DEFAULT_CURRICULUM);
  const isAdmin = mode === "admin";

  useEffect(() => {
    const syncCurriculum = () => setCurriculum(loadCurriculum());

    syncCurriculum();
    window.addEventListener("storage", syncCurriculum);
    window.addEventListener(CURRICULUM_UPDATED_EVENT, syncCurriculum);

    return () => {
      window.removeEventListener("storage", syncCurriculum);
      window.removeEventListener(CURRICULUM_UPDATED_EVENT, syncCurriculum);
    };
  }, []);

  return (
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link className={styles.brand} href="/" aria-label="Empleamás, inicio">
            <span className={styles.brandMark} aria-hidden="true">E+</span>
            <span>Empleamás</span>
          </Link>
          <nav className={styles.navigation} aria-label="Navegación principal">
            <a className={!isAdmin ? styles.activeNav : ""} href={isAdmin ? "/dashboard#modules" : "#modules"}>
              Módulos
            </a>
            <a href={isAdmin ? "/dashboard#progress" : "#progress"}>Progreso</a>
            <a href={isAdmin ? "/dashboard#resources" : "#resources"}>Recursos</a>
          </nav>
          <div className={styles.accountArea}>
            {isAdmin ? (
              <>
                <span className={styles.adminBadge}>Administración</span>
                <Link className={styles.accountLink} href="/dashboard">Vista de usuario</Link>
              </>
            ) : (
              <>
                <span className={styles.accountName}>Alejandro</span>
                <span className={styles.avatar} aria-label="Perfil de Alejandro">A</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcome} id="progress" aria-labelledby="welcome-title">
          <div className={styles.welcomeCopy}>
            {isAdmin && <p className={styles.eyebrow}>Panel de administración</p>}
            <h1 id="welcome-title">¡Hola, Alejandro!</h1>
            <p>{curriculum.welcomeMessage}</p>
          </div>
          <div className={styles.progress}>
            <div className={styles.progressLabel}>
              <span>Progreso general</span>
              <strong>25%</strong>
            </div>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Progreso general"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={25}
            >
              <span />
            </div>
            <p>Tu ruta de aprendizaje está en marcha.</p>
          </div>
        </section>

        {isAdmin ? (
          <AdminContentEditor curriculum={curriculum} setCurriculum={setCurriculum} />
        ) : (
          <LearnerContent curriculum={curriculum} />
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}>Empleamás</span>
          <p>Asesorías laborales que impulsan tu futuro.</p>
          <Link href="/">Volver al inicio</Link>
        </div>
      </footer>
    </div>
  );
}

function LearnerContent({ curriculum }: { curriculum: Curriculum }) {
  return (
    <div className={styles.userGrid}>
      <section className={styles.moduleSection} id="modules" aria-labelledby="modules-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Tu formación</p>
            <h2 id="modules-title">Mi ruta de aprendizaje</h2>
          </div>
          <span className={styles.moduleCount}>{curriculum.modules.length} módulos</span>
        </div>
        <div className={styles.moduleList}>
          {curriculum.modules.length ? (
            curriculum.modules.map((module, index) => (
              <ModuleAccordion key={module.id} module={module} index={index} />
            ))
          ) : (
            <p className={styles.emptyState}>Todavía no hay módulos disponibles.</p>
          )}
        </div>
      </section>

      <aside className={styles.sidebar}>
        <section className={styles.nextStep} id="resources" aria-labelledby="next-step-title">
          <span className={styles.nextStepIcon} aria-hidden="true">↗</span>
          <p className={styles.eyebrow}>Siguiente paso</p>
          <h2 id="next-step-title">Construye tu perfil profesional</h2>
          <p>Reúne tus habilidades y experiencias para presentarte con confianza.</p>
          <a href="#modules">Explorar mi ruta <span aria-hidden="true">→</span></a>
        </section>
        <section className={styles.support}>
          <h2>¿Necesitas orientación?</h2>
          <p>Tu proceso profesional avanza paso a paso. Revisa tus recursos y continúa cuando estés listo.</p>
        </section>
      </aside>
    </div>
  );
}

function ModuleAccordion({ module, index }: { module: LearningModule; index: number }) {
  return (
    <details className={styles.module} open={index === 0 && !module.locked}>
      <summary className={styles.moduleSummary}>
        <span className={`${styles.moduleIcon} ${module.locked ? styles.lockedIcon : ""}`} aria-hidden="true">
          {module.locked ? "•" : "▤"}
        </span>
        <span className={styles.moduleHeading}>
          <strong>{module.title}</strong>
          <span>{module.description}</span>
        </span>
        {module.locked ? (
          <span className={styles.lockedLabel}>Bloqueado</span>
        ) : (
          <span className={styles.expandIcon} aria-hidden="true">⌄</span>
        )}
      </summary>
      <div className={styles.resourceList}>
        {module.locked ? (
          <p className={styles.lockedNotice}>Se desbloqueará al completar el módulo anterior.</p>
        ) : module.resources.length ? (
          module.resources.map((resource) => (
            <div className={styles.resource} key={resource}>
              <span className={styles.resourceIcon} aria-hidden="true">↳</span>
              <span>{resource}</span>
            </div>
          ))
        ) : (
          <p className={styles.lockedNotice}>Próximamente habrá recursos para este módulo.</p>
        )}
      </div>
    </details>
  );
}

function AdminContentEditor({
  curriculum,
  setCurriculum,
}: {
  curriculum: Curriculum;
  setCurriculum: React.Dispatch<React.SetStateAction<Curriculum>>;
}) {
  const [status, setStatus] = useState("");

  function updateModule(id: string, changes: Partial<LearningModule>) {
    setCurriculum((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.id === id ? { ...module, ...changes } : module,
      ),
    }));
    setStatus("");
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(
      saveCurriculum(curriculum)
        ? "Cambios guardados."
        : "No se pudieron guardar los cambios en este navegador.",
    );
  }

  function addModule() {
    const nextModule: LearningModule = {
      id: crypto.randomUUID(),
      title: "Nuevo módulo",
      description: "Agrega una descripción para este módulo.",
      resources: [],
      locked: false,
    };
    setCurriculum((current) => ({ ...current, modules: [...current.modules, nextModule] }));
    setStatus("");
  }

  function resetCurriculum() {
    setCurriculum(DEFAULT_CURRICULUM);
    setStatus(
      saveCurriculum(DEFAULT_CURRICULUM)
        ? "Se restauró el contenido inicial."
        : "No se pudo restaurar el contenido.",
    );
  }

  return (
    <div className={styles.adminGrid}>
      <form className={styles.editor} id="modules" onSubmit={handleSave}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Administración</p>
            <h2>Contenido del panel</h2>
          </div>
          <span className={styles.moduleCount}>{curriculum.modules.length} módulos</span>
        </div>

        <label className={styles.editField}>
          <span>Mensaje de bienvenida</span>
          <textarea
            onChange={(event) => setCurriculum((current) => ({ ...current, welcomeMessage: event.target.value }))}
            rows={3}
            value={curriculum.welcomeMessage}
          />
        </label>

        <div className={styles.editorModules}>
          {curriculum.modules.map((module, index) => (
            <fieldset className={styles.moduleEditor} key={module.id}>
              <legend>Módulo {String(index + 1).padStart(2, "0")}</legend>
              <label className={styles.editField}>
                <span>Título</span>
                <input
                  onChange={(event) => updateModule(module.id, { title: event.target.value })}
                  required
                  value={module.title}
                />
              </label>
              <label className={styles.editField}>
                <span>Descripción</span>
                <textarea
                  onChange={(event) => updateModule(module.id, { description: event.target.value })}
                  rows={2}
                  value={module.description}
                />
              </label>
              <label className={styles.editField}>
                <span>Recursos, uno por línea</span>
                <textarea
                  onChange={(event) =>
                    updateModule(module.id, {
                      resources: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                    })
                  }
                  rows={Math.max(3, Math.min(module.resources.length + 1, 6))}
                  value={module.resources.join("\n")}
                />
              </label>
              <div className={styles.moduleEditorFooter}>
                <label className={styles.lockToggle}>
                  <input
                    checked={module.locked}
                    onChange={(event) => updateModule(module.id, { locked: event.target.checked })}
                    type="checkbox"
                  />
                  <span>Mostrar como bloqueado</span>
                </label>
                <button
                  className={styles.deleteButton}
                  onClick={() => {
                    setCurriculum((current) => ({
                      ...current,
                      modules: current.modules.filter((item) => item.id !== module.id),
                    }));
                    setStatus("");
                  }}
                  type="button"
                >
                  Eliminar módulo
                </button>
              </div>
            </fieldset>
          ))}
        </div>

        <div className={styles.editorActions}>
          <button className={styles.addButton} onClick={addModule} type="button">
            <span aria-hidden="true">+</span> Agregar módulo
          </button>
          <button className={styles.resetButton} onClick={resetCurriculum} type="button">
            Restaurar
          </button>
          <button className={styles.saveButton} type="submit">Guardar cambios</button>
        </div>
        <p aria-live="polite" className={styles.editorStatus} role="status">{status}</p>
      </form>

      <aside className={styles.preview}>
        <div className={styles.previewHeading}>
          <p className={styles.eyebrow}>Vista previa</p>
          <h2>Así lo verá el usuario</h2>
        </div>
        <p className={styles.previewWelcome}>{curriculum.welcomeMessage}</p>
        <div className={styles.previewModules}>
          {curriculum.modules.map((module, index) => (
            <article className={styles.previewModule} key={module.id}>
              <span className={styles.previewNumber}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{module.title || "Módulo sin título"}</h3>
                <p>{module.description}</p>
                {module.locked && <span className={styles.previewLocked}>Bloqueado</span>}
              </div>
            </article>
          ))}
          {!curriculum.modules.length && <p className={styles.emptyState}>No hay módulos en la vista previa.</p>}
        </div>
      </aside>
    </div>
  );
}