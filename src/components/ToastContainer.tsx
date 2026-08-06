"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import type { Toast } from "@/hooks/useToast";
import styles from "./ToastContainer.module.css";

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.portal}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${styles.toast} ${
            t.type === "success" ? styles.success :
            t.type === "error"   ? styles.error   :
            styles.info
          }`}
        >
          {t.type === "success" && <CheckCircle2 size={16} />}
          {t.type === "error"   && <AlertCircle  size={16} />}
          {t.type === "info"    && <Info          size={16} />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
