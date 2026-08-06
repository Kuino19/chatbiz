import styles from "./page.module.css";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | ChatBiz",
  description: "Terms of Service for ChatBiz",
};

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            These Terms of Service govern your use of the ChatBiz platform and services. By accessing or using our services, 
            you agree to be bound by these terms. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2>2. Use of Service</h2>
          <p>
            ChatBiz provides a WhatsApp-based storefront and chatbot platform for businesses. You agree to use the service 
            only for lawful purposes and in accordance with these terms. You are responsible for ensuring your WhatsApp 
            account and interactions comply with Meta's Commerce and WhatsApp Business Policies.
          </p>
        </section>

        <section>
          <h2>3. Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
            Failure to do so constitutes a breach of the terms, which may result in immediate termination of your account on our service.
          </p>
        </section>

        <section>
          <h2>4. Termination</h2>
          <p>
            We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason 
            whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall ChatBiz, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
            indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, 
            use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section>
          <h2>6. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice 
            of any significant changes prior to the new terms taking effect.
          </p>
        </section>

        <div className={styles.backHome}>
          <Link href="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
