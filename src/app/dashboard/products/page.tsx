import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import styles from "./page.module.css";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let business = await db.business.findUnique({
    where: { userId: session.user.id },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });

  if (!business) {
    business = await db.business.create({
      data: {
        userId: session.user.id,
        name: `${session.user.name || "My"}'s Shop`,
      },
      include: { products: true },
    });
  }

  const productsList = (business.products || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price) || 0,
    stock: Number(p.stock) || 0,
    lowStockThreshold: Number(p.lowStockThreshold) || 5,
    imageUrl: p.imageUrl,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>
            {productsList.length} product{productsList.length !== 1 ? "s" : ""} in your WhatsApp catalog
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <ProductsClient
          initialProducts={productsList}
          businessId={business.id}
        />
      </div>
    </div>
  );
}
