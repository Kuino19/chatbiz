import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./layout.module.css";
import { LogOut, Package, ShoppingCart, Settings, Home, MessageSquare } from "lucide-react";
import MobileNav from "./components/MobileNav";
import ActiveLink from "./components/ActiveLink";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const navItems = [
    { href: "/dashboard", icon: <Home size={18} />, label: "Dashboard", exact: true },
    { href: "/dashboard/products", icon: <Package size={18} />, label: "Products" },
    { href: "/dashboard/orders", icon: <ShoppingCart size={18} />, label: "Orders" },
    { href: "/dashboard/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  const sidebarContent = (
    <>
      <div className={styles.brand}>
        <div className={styles.logoIconBg}>
          <MessageSquare size={14} color="white" />
        </div>
        <h2>ChatBiz</h2>
      </div>

      <nav className={styles.nav}>
        {navItems.map(item => (
          <ActiveLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            exact={item.exact}
          />
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{session.user.name}</p>
          <p className={styles.userEmail}>{session.user.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className={styles.logoutBtn}>
            <LogOut size={16} /> Logout
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${styles.desktopOnly}`}>
        {sidebarContent}
      </aside>

      <div className={styles.mainWrapper}>
        <MobileNav>
          {sidebarContent}
        </MobileNav>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
