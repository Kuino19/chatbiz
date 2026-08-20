"use client";

import { useState } from "react";
import { Menu, X, MessageSquare } from "lucide-react";
import styles from "./MobileNav.module.css";
import Link from "next/link";

export default function MobileNav({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.mobileWrapper}>
      <header className={styles.mobileHeader}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="ChatBiz Logo" style={{ width: 24, height: 24 }} />
          <span>ChatBiz</span>
        </div>
        <button className={styles.menuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className={`${styles.sidebarWrapper} ${isOpen ? styles.active : ""}`} onClick={() => setIsOpen(false)}>
        <div className={styles.sidebarContent} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  );
}
