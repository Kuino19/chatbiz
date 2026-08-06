"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../layout.module.css";
import { ReactNode } from "react";

interface ActiveLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
}

export default function ActiveLink({ href, icon, label, exact }: ActiveLinkProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
    >
      <span className={styles.icon}>{icon}</span>
      {label}
      {isActive && <span className={styles.activeDot} />}
    </Link>
  );
}
