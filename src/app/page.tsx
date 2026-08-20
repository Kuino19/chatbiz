import Link from "next/link";
import styles from "./page.module.css";
import {
  MessageSquare, Rocket, Bot, DollarSign, BarChart3,
  ZapIcon, CheckCircle, ArrowRight, Star, Globe,
  ShieldCheck, Package, Clock, Users, TrendingUp
} from "lucide-react";

export default function Home() {
  return (
    <div className={styles.page}>

      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><MessageSquare size={16} /></div>
          <span>ChatBiz</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#how" className={styles.navLink}>How it works</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/register" className={styles.navCta}>Get Started Free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />

        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Now with a Smart AI Assistant 🚀
            </div>

            <h1 className={styles.heroTitle}>
              Make sales while you<br />
              <span className={styles.gradientText}>sleep.</span>
            </h1>

            <p className={styles.heroSub}>
              Stop the "send account number" stress. ChatBiz gives you a smart WhatsApp assistant that replies customers, takes orders, and collects payment instantly.
            </p>

            <div className={styles.heroActions}>
              <Link href="/register" className={styles.ctaPrimary}>
                Start for Free <Rocket size={18} />
              </Link>
              <a href="#how" className={styles.ctaGhost}>
                See how it works <ArrowRight size={16} />
              </a>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.statPill}>
                <strong>500+</strong>
                <span>Vendors</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statPill}>
                <strong>10k+</strong>
                <span>Orders Sold</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statPill}>
                <strong>24/7</strong>
                <span>Active</span>
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className={styles.heroRight}>
            <div className={styles.phoneWrap}>
              {/* Notification cards */}
              <div className={`${styles.notifCard} ${styles.notif1}`}>
                <div className={styles.notifIcon} style={{ background: "#dcfce7", color: "#15803d" }}>
                  <Package size={16} />
                </div>
                <div>
                  <p>New Order #4202</p>
                  <small>₦50,000.00 • just now</small>
                </div>
              </div>
              <div className={`${styles.notifCard} ${styles.notif2}`}>
                <div className={styles.notifIcon} style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p>Payment Verified</p>
                  <small>Auto-confirmed ✅</small>
                </div>
              </div>

              <div className={styles.phone}>
                <div className={styles.phoneNotch} />
                <div className={styles.phoneBar}>
                  <div className={styles.phoneBarAvatar}>🛒</div>
                  <div>
                    <div className={styles.phoneBarName}>My Shop Bot</div>
                    <div className={styles.phoneBarStatus}>🟢 Online</div>
                  </div>
                </div>
                <div className={styles.chatBody}>
                  <div className={`${styles.msg} ${styles.msgIn}`} style={{ animationDelay: "0.4s" }}>
                    Hi! Do you have the AirPods in stock? And what's the price?
                  </div>
                  <div className={`${styles.msg} ${styles.msgOut}`} style={{ animationDelay: "1.0s" }}>
                    Yes, we do! The AirPods are in stock for ₦45,000. Should I add them to your cart? 🎧
                  </div>
                  <div className={`${styles.msg} ${styles.msgIn}`} style={{ animationDelay: "1.6s" }}>
                    Yes please, and add a black case too. I'm ready to pay.
                  </div>
                  <div className={`${styles.msg} ${styles.msgOut}`} style={{ animationDelay: "2.4s" }}>
                    Got it! Your total is ₦50,000. Click here to pay safely online:
                    <br/><br/>
                    <a href="#" style={{ color: "#25D366", fontWeight: "bold" }}>paystack.com/pay/chatbiz</a>
                  </div>
                  <div className={`${styles.msg} ${styles.msgOut}`} style={{ animationDelay: "3.2s" }}>
                    ✅ Payment Received! Your order #4202 is confirmed. Thanks for buying!
                  </div>
                </div>
                <div className={styles.phoneHomeBar} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO BAR ── */}
      <section className={styles.logoBar}>
        <p className={styles.logoBarLabel}>TRUSTED BY NIGERIAN VENDORS EVERYWHERE</p>
        <div className={styles.logoScroll}>
          {["BrandOne", "ShopFast", "QuickCommerce", "StyleHub", "TechStore NG", "AbujaShop", "LagosDeals"].map(b => (
            <span key={b}>{b}</span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.how} id="how">
        <div className={styles.sectionLabel}>How it works</div>
        <h2 className={styles.sectionTitle}>Start selling in 3 easy steps</h2>
        <p className={styles.sectionSub}>No coding or tech skills needed. Set up your shop in 1 minute.</p>

        <div className={styles.steps}>
          {[
            { num: "01", icon: <MessageSquare size={28} />, title: "Connect WhatsApp", body: "Just click one button to link your WhatsApp Business number. No confusing API keys required." },
            { num: "02", icon: <Package size={28} />, title: "Add Your Items", body: "Upload pictures and prices of what you sell. We will arrange them perfectly for your customers to see." },
            { num: "03", icon: <DollarSign size={28} />, title: "Make Money", body: "Customers chat with your bot, place orders, and pay instantly. You just wake up to bank alerts." }
          ].map(s => (
            <div className={styles.step} key={s.num}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepIcon}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>Everything you need to <span className={styles.greenText}>grow</span></h2>
        <p className={styles.sectionSub}>Built to solve the real problems of selling in Nigeria.</p>

        <div className={styles.featureGrid}>
          <div className={`${styles.featureCard} ${styles.featureCardLarge}`}>
            <div className={styles.featureCardIcon} style={{ background: "rgba(37,211,102,0.12)", color: "#25D366" }}><Bot size={32} /></div>
            <h3>Smart WhatsApp Assistant</h3>
            <p>Your bot replies to customers just like a real human. It answers their questions, helps them choose items, and can even send them pictures of your products when they ask.</p>
            <ul className={styles.featureList}>
              <li><CheckCircle size={14} /> Teach it how to talk to your customers</li>
              <li><CheckCircle size={14} /> Never gets tired or angry</li>
              <li><CheckCircle size={14} /> Takes orders 24/7</li>
            </ul>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}><DollarSign size={28} /></div>
            <h3>No More "Send Account Number"</h3>
            <p>The bot gives customers a secure Paystack link right in the chat. As soon as they pay, the order is confirmed automatically. No more fake alerts.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}><BarChart3 size={28} /></div>
            <h3>Track Your Sales</h3>
            <p>See your daily money, your best-selling items, and your most loyal customers easily from your phone.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}><ZapIcon size={28} /></div>
            <h3>Never Oversell Again</h3>
            <p>When someone pays, the system removes that item from your stock immediately. If it finishes, the bot will stop selling it.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}><Users size={28} /></div>
            <h3>It Remembers Customers</h3>
            <p>If a customer gets distracted and comes back hours later, the bot remembers exactly what was in their cart.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureCardIcon} style={{ background: "rgba(20,184,166,0.12)", color: "#14b8a6" }}><TrendingUp size={28} /></div>
            <h3>Professional Receipts</h3>
            <p>Give your business a big-brand feel. The system generates fine PDF receipts for every customer after they pay.</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.testimonials}>
        <div className={styles.sectionLabel}>Testimonials</div>
        <h2 className={styles.sectionTitle}>Loved by business owners</h2>

        <div className={styles.testimonialGrid}>
          {[
            { name: "Amara O.", role: "Fashion Boutique, Lagos", text: "ChatBiz completely transformed my business. I went from missing orders to processing 50+ per day automatically.", stars: 5 },
            { name: "Chidi N.", role: "Electronics Store, Abuja", text: "My customers love the WhatsApp experience. Sales doubled in the first month. Setup took less than 15 minutes.", stars: 5 },
            { name: "Fatima B.", role: "Food Business, Kano", text: "Finally a tool built for Nigerian businesses. The Naira payments and local bank support is exactly what I needed.", stars: 5 }
          ].map(t => (
            <div className={styles.testimonialCard} key={t.name}>
              <div className={styles.stars}>
                {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p className={styles.testimonialText}>"{t.text}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.avatar}>{t.name[0]}</div>
                <div>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
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

      {/* ── FINAL CTA ── */}
      <section className={styles.finalCta}>
        <div className={styles.ctaBlob1} />
        <div className={styles.ctaBlob2} />
        <div className={styles.ctaInner}>
          <div className={styles.ctaBadge}><Globe size={14} /> Built for Nigeria</div>
          <h2>Ready to grow your business?</h2>
          <p>Join 500+ entrepreneurs selling smarter on WhatsApp today.</p>
          <div className={styles.ctaActions}>
            <Link href="/register" className={styles.ctaPrimary}>
              Get Started Free <Rocket size={18} />
            </Link>
            <Link href="/login" className={styles.ctaGhostDark}>
              Sign In
            </Link>
          </div>
          <div className={styles.ctaNote}>
            <Clock size={13} /> Set up in under 10 minutes · No credit card required
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.logo} style={{ marginBottom: "1rem" }}>
              <div className={styles.logoIcon}><MessageSquare size={14} /></div>
              <span>ChatBiz</span>
            </div>
            <p>Automating WhatsApp commerce for the next generation of Nigerian retailers.</p>
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
