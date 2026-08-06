import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const business = await db.business.findUnique({
    where: { userId: session.user.id },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });

  if (!business) redirect("/dashboard");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            {business.products.length} product{business.products.length !== 1 ? "s" : ""} in your WhatsApp catalog
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <ProductsClient
          initialProducts={business.products}
          businessId={business.id}
        />
      </div>
    </div>
  );
}
