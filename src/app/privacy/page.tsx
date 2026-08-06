import styles from "./page.module.css";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | ChatBiz",
  description: "Privacy Policy for ChatBiz",
};

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to ChatBiz. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you use our 
            WhatsApp bot and web application.
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul>
            <li><strong>Identity Data:</strong> First name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> WhatsApp phone number and email address.</li>
            <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products or services you have purchased.</li>
            <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting, and operating system.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul>
            <li>To process and deliver your orders via WhatsApp.</li>
            <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
            <li>To administer and protect our business and this website.</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing with Third Parties</h2>
          <p>
            We use the <strong>Meta WhatsApp Cloud API</strong> to facilitate communication. As such, message contents, phone numbers, and interaction metadata 
            are processed through Meta's infrastructure. We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, 
            or accessed in an unauthorized way, altered, or disclosed.
          </p>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us.
          </p>
        </section>

        <div className={styles.backHome}>
          <Link href="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
