import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import styles from "./page.module.css";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const business = await db.business.findUnique({
    where: { userId: session.user.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      }
    }
  });

  if (!business) redirect("/dashboard");

  async function markAsPaid(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const order = await db.order.findUnique({ 
      where: { id },
      include: { business: true }
    });
    
    if (!order) return;

    await db.order.update({
      where: { id },
      data: { status: "PAID" }
    });

    // Notify the customer on WhatsApp
    if (order.customerPhone && order.business) {
      try {
        await sendWhatsAppMessage(
          order.business,
          order.customerPhone,
          `✅ *Payment Confirmed!*\n\nYour order #${order.id.slice(-6).toUpperCase()} has been verified and is now being processed.\n\nThank you for shopping with us! 🛍️`
        );
      } catch (e) {
        console.error("Failed to notify customer:", e);
      }
    }

    revalidatePath("/dashboard/orders");
  }

  async function cancelOrder(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const order = await db.order.findUnique({ 
      where: { id },
      include: { business: true }
    });

    if (!order) return;

    await db.order.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    // Notify the customer on WhatsApp
    if (order.customerPhone && order.business) {
      try {
        await sendWhatsAppMessage(
          order.business,
          order.customerPhone,
          `❌ *Order Cancelled*\n\nYour order #${order.id.slice(-6).toUpperCase()} has been cancelled.\n\nIf you have any questions, please reply to this chat.`
        );
      } catch (e) {
        console.error("Failed to notify customer:", e);
      }
    }

    revalidatePath("/dashboard/orders");
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders</h1>
        <p className={styles.subtitle}>Review orders and confirm payments</p>
      </div>

      <div className={styles.ordersList}>
        {business.orders.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} className={styles.emptyIcon} />
            <p>No orders yet. When customers order via WhatsApp, they will appear here.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {business.orders.map((order: any) => (
                <tr key={order.id}>
                  <td className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</td>
                  <td>{order.customerPhone}</td>
                  <td>
                    <ul className={styles.itemsList}>
                      {order.items.map((item: any) => (
                        <li key={item.id}>
                          {item.quantity}x {item.product.name}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className={styles.amount}>₦{order.totalAmount.toFixed(2)}</td>
                  <td className={styles.dateCell}>
                    {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <span className={styles[`status${order.status}` as keyof typeof styles]}>{order.status}</span>
                    {order.paymentProofUrl && (
                      <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer" className={styles.proofLink}>
                        View Proof
                      </a>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {order.status === "PENDING" && (
                        <>
                          <form action={markAsPaid}>
                            <input type="hidden" name="id" value={order.id} />
                            <button type="submit" className={styles.btnApprove} title="Mark Paid">
                              <CheckCircle size={18} /> Approve
                            </button>
                          </form>
                          <form action={cancelOrder}>
                            <input type="hidden" name="id" value={order.id} />
                            <button type="submit" className={styles.btnCancel} title="Cancel Order">
                              <XCircle size={18} />
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
