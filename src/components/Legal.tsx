import { useEffect, useState } from "react";
import { EFFECTIVE_DATE, LEGAL_DOCS, legalDoc, type LegalDocId } from "../legal/documents.ts";

export type LegalTarget = LegalDocId | "index";

type LegalCenterProps = {
  initial: LegalTarget;
  onClose: () => void;
};

export function LegalCenter({ initial, onClose }: LegalCenterProps) {
  const [docId, setDocId] = useState<LegalDocId | null>(initial === "index" ? null : initial);
  const doc = docId ? legalDoc(docId) : null;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="legal-layer" role="dialog" aria-modal="true" aria-labelledby="legal-title">
      <article className="legal-doc">
        <header className="legal-head">
          <div className="legal-nav">
            {doc && (
              <button type="button" className="text-btn" onClick={() => setDocId(null)}>
                All documents
              </button>
            )}
            <button type="button" className="text-btn" onClick={onClose}>
              Close
            </button>
          </div>
          <p className="eyebrow">Caltek legal</p>
          <h1 id="legal-title">{doc ? doc.title : "Legal"}</h1>
          <p className="lede">{doc ? doc.summary : `Documents for this copy of Caltek. Effective ${EFFECTIVE_DATE}.`}</p>
        </header>

        {!doc && (
          <ul className="legal-index">
            {LEGAL_DOCS.map((item) => (
              <li key={item.id}>
                <button type="button" className="legal-card" onClick={() => setDocId(item.id)}>
                  <strong>{item.title}</strong>
                  <span>{item.summary}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {doc && (
          <div className="legal-body">
            <p className="legal-date">Effective {EFFECTIVE_DATE}</p>
            {doc.sections.map((section) => (
              <section key={section.heading} className="legal-section">
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
            <nav className="legal-more" aria-label="Other documents">
              {LEGAL_DOCS.filter((item) => item.id !== doc.id).map((item) => (
                <button key={item.id} type="button" className="text-btn" onClick={() => setDocId(item.id)}>
                  {item.title}
                </button>
              ))}
            </nav>
          </div>
        )}
      </article>
    </div>
  );
}

export function LegalLinks({ onOpen }: { onOpen: (target: LegalTarget) => void }) {
  return (
    <footer className="legal-footer">
      <span>© {EFFECTIVE_DATE.slice(-4)} Caltek</span>
      <button type="button" onClick={() => onOpen("index")}>
        Legal
      </button>
      <button type="button" onClick={() => onOpen("privacy")}>
        Privacy
      </button>
      <button type="button" onClick={() => onOpen("terms")}>
        Terms
      </button>
      <button type="button" onClick={() => onOpen("health")}>
        Health disclaimer
      </button>
      <button type="button" onClick={() => onOpen("notices")}>
        Notices
      </button>
    </footer>
  );
}
