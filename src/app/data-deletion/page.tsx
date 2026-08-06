import styles from "./page.module.css";
import Link from "next/link";

export const metadata = {
  title: "Data Deletion Instructions | ChatBiz",
  description: "How to delete your data from ChatBiz",
};

export default function DataDeletion() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>Data Deletion Instructions</h1>
        <p className={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section>
          <h2>Data Deletion Policy</h2>
          <p>
            According to the Facebook Platform Rules and general data protection regulations (such as GDPR), 
            we have to provide a clear way for you to request the deletion of your data.
          </p>
          <p>
            If you want to delete your activities or data for the ChatBiz application, you can do so by following the instructions below.
          </p>
        </section>

        <section>
          <h2>How to request data deletion</h2>
          <ol>
            <li>
              <strong>Email Request:</strong> Send an email to <code>support@chatbiz.goanitech.com</code> with the subject 
              "Data Deletion Request". Please include the email address or WhatsApp number associated with your account so we can locate your data.
            </li>
            <li>
              <strong>Processing:</strong> We will process your request within 7 business days and permanently delete your 
              account, business profile, API credentials, and message history from our servers.
            </li>
            <li>
              <strong>Confirmation:</strong> We will send you a confirmation email once your data has been successfully deleted.
            </li>
          </ol>
        </section>

        <section>
          <h2>Removing the App from Meta</h2>
          <p>
            If you want to remove the ChatBiz integration from your Facebook/Meta account completely:
          </p>
          <ol>
            <li>Go to your Facebook Account's <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noreferrer">Settings & Privacy &gt; Apps and Websites</a>.</li>
            <li>Search for the "ChatBiz" app.</li>
            <li>Click "Remove".</li>
          </ol>
        </section>

        <div className={styles.backHome}>
          <Link href="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
