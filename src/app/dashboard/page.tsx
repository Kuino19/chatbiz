import { auth } from "@/auth";
import { db } from "@/lib/db";
import styles from "./page.module.css";
import { redirect } from "next/navigation";
import OnboardingWrapper from "./components/OnboardingWrapper";
import { Package, ShoppingCart, Clock, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const business = await db.business.findUnique({
    where: { userId: session.user.id },
    include: { products: true, orders: true }
  });

  if (!business) {
    await db.business.create({
      data: {
        userId: session.user.id!,
        name: `${session.user.name}'s Shop`,
      }
    });
    redirect("/dashboard");
  }

  const productsCount = await db.product.count({ where: { businessId: business.id } });
  const ordersCount = await db.order.count({ where: { businessId: business.id } });
  const pendingOrders = await db.order.count({ where: { businessId: business.id, status: "PENDING" } });

  // Total revenue from PAID orders
  const revenueResult = await db.order.aggregate({
    where: { businessId: business.id, status: "PAID" },
    _sum: { totalAmount: true }
  });
  const totalRevenue = revenueResult._sum.totalAmount ?? 0;

  // Recent 5 orders
  const recentOrders = await db.order.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: { include: { product: true } } }
  });

  // Define Onboarding Steps
  const onboardingSteps = [
    {
      id: "whatsapp",
      title: "Setup WhatsApp",
      description: "Connect your WhatsApp number to start receiving orders.",
      link: "/dashboard/settings",
      isCompleted: !!business.whatsappNumber
    },
    {
      id: "products",
      title: "Add Products",
      description: "Add your first product to your catalog.",
      link: "/dashboard/products",
      isCompleted: productsCount > 0
    },
    {
      id: "test",
      title: "Test Connection",
      description: "Send a test message to ensure everything is working.",
      link: "/dashboard/settings",
      isCompleted: !!business.metaAccessToken
    }
  ];

  const showOnboarding = !business.onboardingCompleted;

  return (
    <div>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Welcome back, {session.user.name}</h1>
        <p className={styles.subtitle}>Here is an overview of your WhatsApp business.</p>
      </div>

      {showOnboarding && (
        <OnboardingWrapper businessId={business.id} steps={onboardingSteps} />
      )}

      <div className={styles.statsGrid}>
        <div className="card">
          <h3><Package size={20} className={styles.statIcon} /> Total Products</h3>
          <p className={styles.statValue}>{productsCount}</p>
        </div>
        <div className="card">
          <h3><ShoppingCart size={20} className={styles.statIcon} /> Total Orders</h3>
          <p className={styles.statValue}>{ordersCount}</p>
        </div>
        <div className="card">
          <h3><Clock size={20} className={styles.statIcon} /> Pending Orders</h3>
          <p className={styles.statValue}>{pendingOrders}</p>
        </div>
        <div className="card">
          <h3><DollarSign size={20} className={styles.statIcon} /> Total Revenue</h3>
          <p className={styles.statValue}>₦{totalRevenue.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {recentOrders.length > 0 && (
        <div className={styles.recentSection}>
          <h2 className={styles.recentTitle}>Recent Orders</h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className={styles.recentTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</td>
                    <td>{order.customerPhone}</td>
                    <td>{order.items.map((i: any) => `${i.quantity}x ${i.product.name}`).join(", ")}</td>
                    <td>₦{order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={styles[`status${order.status}` as keyof typeof styles]}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


