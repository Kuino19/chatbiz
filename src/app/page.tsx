import Link from "next/link";
import styles from "./page.module.css";
import {
  Rocket, Bot, DollarSign, CheckCircle, Star, Globe,
  Package, Users, TrendingUp, ShieldCheck, CheckCheck, Mic
} from "lucide-react";

export default function Home() {
  return (
    <div className={styles.page}>

      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="ChatBiz Logo" style={{ width: 24, height: 24 }} />
          <span>ChatBiz</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#how" className={styles.navLink}>How it works</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLogin}>Sign In</Link>
          <Link href="/register" className={styles.navSignup}>Get Started</Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          
          {/* Left: Copy */}
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <ShieldCheck size={16} /> Built for Nigerian WhatsApp vendors
            </div>
            
            <h1 className={styles.heroTitle}>
              Sell on WhatsApp.<br/>
              Wake up to <span>Sales, Not Screenshots.</span>
            </h1>
            
            <p className={styles.heroSub}>
              Stop typing "send account number" and losing track of stock. ChatBiz is an AI assistant that talks to your customers, takes their orders, and confirms Paystack payments directly inside WhatsApp while you sleep.
            </p>
            
            <div className={styles.heroActions}>
              <Link href="/register" className={styles.ctaPrimary}>
                Start For Free <Rocket size={18} />
              </Link>
            </div>
            
            <div className={styles.trustRow}>
              <div className={styles.trustAvatarGroup}>
                <div className={styles.trustAvatar}>O</div>
                <div className={styles.trustAvatar}>C</div>
                <div className={styles.trustAvatar}>F</div>
              </div>
              <div className={styles.trustText}>
                Join Amara, Chidi, and <strong>other smart vendors</strong> growing their business.
              </div>
            </div>
          </div>

          {/* Right: Signature WhatsApp Mockup */}
          <div className={styles.heroRight}>
            <div className={styles.mockupPhone}>
              
              <div className={styles.mockupHeader}>
                <div className={styles.mockupAvatar}>
                  <img src="/logo.png" alt="ChatBiz Logo" style={{ width: 20, height: 20 }} />
                </div>
                <div className={styles.mockupInfo}>
                  <div className={styles.mockupName}>My Store Bot <CheckCircle size={14} color="#34D399" /></div>
                  <div className={styles.mockupStatus}>typically replies instantly</div>
                </div>
              </div>

              <div className={styles.mockupBody}>
                <div className={styles.chatBubble} style={{ alignSelf: "center", background: "rgba(0,0,0,0.05)", fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}>Today</div>
                
                <div className={`${styles.chatBubble} ${styles.chatReceived}`}>
                  Welcome to my store! I am the smart assistant here. How can I help you today?
                  <span className={styles.chatTime}>10:42 AM</span>
                </div>

                <div className={`${styles.chatBubble} ${styles.chatSent}`}>
                  Do you still have the black sneakers in size 42?
                  <span className={styles.chatTime}>10:45 AM <CheckCheck size={12} color="#34B7F1" style={{display: "inline", marginLeft: 2}}/></span>
                </div>

                <div className={`${styles.chatBubble} ${styles.chatReceived}`}>
                  Yes, we have exactly 3 left in stock! It costs ₦25,000. Would you like to place an order?
                  <span className={styles.chatTime}>10:45 AM</span>
                </div>

                <div className={`${styles.chatBubble} ${styles.chatSent}`}>
                  Yes please, I want to buy one.
                  <span className={styles.chatTime}>10:46 AM <CheckCheck size={12} color="#34B7F1" style={{display: "inline", marginLeft: 2}}/></span>
                </div>

                <div className={`${styles.chatBubble} ${styles.chatReceived}`}>
                  Great! Here is your secure payment link. Once paid, I will process your order immediately.
                  <div className={styles.chatAction}>
                    Pay ₦25,000 via Paystack
                  </div>
                  <span className={styles.chatTime}>10:46 AM</span>
                </div>
              </div>

              <div className={styles.mockupFooter}>
                <div className={styles.mockupInput}></div>
                <div className={styles.mockupMic}><Mic size={18} /></div>
              </div>

            </div>
          </div>
          
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.how} id="how">
        <div className={styles.sectionLabel}>How It Works</div>
        <h2 className={styles.sectionTitle}>Set up once, sell forever</h2>
        <p className={styles.sectionSub}>No coding required. If you know how to use WhatsApp, you know how to use ChatBiz.</p>

        <div className={styles.steps}>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}><Globe size={28} /></div>
            <h3>1. Connect WhatsApp</h3>
            <p>Link your WhatsApp Business number securely in two clicks using Meta Official APIs.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}><Package size={28} /></div>
            <h3>2. Add Your Items</h3>
            <p>Upload your products, set your prices, and put in how many you have in stock.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}><DollarSign size={28} /></div>
            <h3>3. The Bot Sells For You</h3>
            <p>The AI talks to customers exactly how you would, answers questions, and collects payments.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features} id="features">
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>Built for Nigerian business realities</h2>
        
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "#DBEAFE", color: "#2563EB" }}><Bot size={28} /></div>
            <h3>Sell While You Sleep</h3>
            <p>Your shop never closes. The bot handles midnight inquiries and closes sales so you wake up to payment alerts.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "#DCFCE7", color: "#166534" }}><DollarSign size={28} /></div>
            <h3>No More "Fake Alerts"</h3>
            <p>Direct integration with Paystack ensures you only process orders when the money has actually hit your account.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "#FEF3C7", color: "#D97706" }}><Package size={28} /></div>
            <h3>Never Oversell Again</h3>
            <p>When someone pays, the system removes that item from your stock immediately. If it finishes, the bot stops selling it.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "#FEE2E2", color: "#DC2626" }}><Users size={28} /></div>
            <h3>It Remembers Customers</h3>
            <p>If a customer gets distracted and comes back hours later, the bot remembers exactly what was in their cart.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "#CCFBF1", color: "#0F766E" }}><TrendingUp size={28} /></div>
            <h3>Professional Receipts</h3>
            <p>Give your business a big-brand feel. The system generates PDF receipts for every customer after they pay.</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionLabel}>Pricing</div>
        <h2 className={styles.sectionTitle}>Simple, honest pricing</h2>
        <p className={styles.sectionSub}>No hidden fees. Cancel anytime.</p>

        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <div className={styles.planName}>Starter</div>
            <div className={styles.planPrice}>Free <span>/ forever</span></div>
            <p className={styles.planDesc}>Perfect for small businesses just getting started.</p>
            <ul className={styles.planFeatures}>
              <li><CheckCircle size={15} /> Up to 50 orders/month</li>
              <li><CheckCircle size={15} /> 10 product listings</li>
              <li><CheckCircle size={15} /> WhatsApp bot</li>
              <li><CheckCircle size={15} /> Basic analytics</li>
            </ul>
            <Link href="/register" className={styles.planCta}>Get Started Free</Link>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingCardPro}`}>
            <div className={styles.popularBadge}>Most Popular</div>
            <div className={styles.planName}>Pro</div>
            <div className={styles.planPrice}>₦15,000 <span>/ month</span></div>
            <p className={styles.planDesc}>For growing businesses that need unlimited power.</p>
            <ul className={styles.planFeatures}>
              <li><CheckCircle size={15} /> Unlimited orders</li>
              <li><CheckCircle size={15} /> Unlimited products</li>
              <li><CheckCircle size={15} /> AI-powered responses</li>
              <li><CheckCircle size={15} /> Advanced analytics & reports</li>
              <li><CheckCircle size={15} /> Low stock WhatsApp alerts</li>
              <li><CheckCircle size={15} /> PDF invoice generation</li>
              <li><CheckCircle size={15} /> Priority support</li>
            </ul>
            <Link href="/register" className={styles.planCtaPro}>Start Pro Trial</Link>
          </div>

          <div className={styles.pricingCard}>
            <div className={styles.planName}>Enterprise</div>
            <div className={styles.planPrice}>Custom <span>/ month</span></div>
            <p className={styles.planDesc}>For large merchants and multi-store businesses.</p>
            <ul className={styles.planFeatures}>
              <li><CheckCircle size={15} /> Everything in Pro</li>
              <li><CheckCircle size={15} /> Multiple WhatsApp numbers</li>
              <li><CheckCircle size={15} /> Dedicated account manager</li>
              <li><CheckCircle size={15} /> Custom integrations</li>
              <li><CheckCircle size={15} /> SLA guarantee</li>
            </ul>
            <a href="mailto:hello@chatbiz.africa" className={styles.planCta}>Contact Sales</a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <h2>Ready to grow your business?</h2>
        <p>Join other smart entrepreneurs selling smarter on WhatsApp today.</p>
        <Link href="/register" className={styles.ctaPrimary}>
          Get Started For Free
        </Link>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <div className={styles.logo} style={{ marginBottom: "1rem" }}>
              <img src="/logo.png" alt="ChatBiz Logo" style={{ width: 24, height: 24 }} />
              <span>ChatBiz</span>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#4B5563", lineHeight: 1.6, maxWidth: 250 }}>
              Automating WhatsApp commerce for the next generation of Nigerian retailers.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#how">How it works</a>
          </div>
          <div className={styles.footerCol}>
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
          </div>
          <div className={styles.footerCol}>
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 ChatBiz Africa. All rights reserved.</p>
          <div className={styles.footerSocials}>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
