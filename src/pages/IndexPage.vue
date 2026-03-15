<template>
  <q-page class="landing">
    <div class="hero" id="top">
      <div class="hero-content">
        <div class="trust-chip">Trusted by 30,000+ users</div>
        <h1>Send, receive and manage your money - simply.</h1>
        <p class="hero-sub">
          PrimeWallet gives you a secure digital wallet to track balances, pay bills, and move money
          instantly.
        </p>
        <div class="hero-actions">
          <q-btn
            unelevated
            color="primary"
            label="Get started - it's free"
            class="cta-main"
            to="register"
          />
          <q-btn
            flat
            color="white"
            label="Log in"
            class="cta-ghost"
            to="login"
          />
        </div>
      </div>

      <div class="hero-card">
        <div class="card-top">
          <div class="card-chip"></div>
          <div class="card-logo">P</div>
        </div>
        <div class="card-balance">
          <div class="card-label">Total balance</div>
          <div class="card-amount">NGN 42,500.00</div>
        </div>
        <div class="card-actions">
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <section class="stats">
      <div>
        <div class="stat-value">200k+</div>
        <div class="stat-label">Active users</div>
      </div>
      <div>
        <div class="stat-value">NGN 50B+</div>
        <div class="stat-label">Transactions processed</div>
      </div>
      <div>
        <div class="stat-value">4.8/5</div>
        <div class="stat-label">App rating</div>
      </div>
    </section>

    <section class="features" id="features">
      <div class="section-heading">
        <h2>Everything you need in a wallet</h2>
        <p>Secure, flexible, and built for daily money moments.</p>
      </div>
      <div class="feature-grid">
        <div class="feature-card">
          <q-icon name="bolt" class="feature-icon" />
          <h3>Instant transfers</h3>
          <p>Send money to any bank or PrimeWallet user in seconds.</p>
        </div>
        <div class="feature-card">
          <q-icon name="receipt_long" class="feature-icon" />
          <h3>Bill payments</h3>
          <p>Pay for airtime, data, utilities, and subscriptions in one place.</p>
        </div>
        <div class="feature-card">
          <q-icon name="analytics" class="feature-icon" />
          <h3>Transaction history</h3>
          <p>Get a clear timeline of every debit and credit across your wallet.</p>
        </div>
        <div class="feature-card">
          <q-icon name="shield" class="feature-icon" />
          <h3>Bank-grade security</h3>
          <p>Your funds and data are protected with modern encryption.</p>
        </div>
        <div class="feature-card">
          <q-icon name="credit_card" class="feature-icon" />
          <h3>Multi-currency support</h3>
          <p>Hold balances in multiple currencies and convert seamlessly.</p>
        </div>
        <div class="feature-card">
          <q-icon name="notifications" class="feature-icon" />
          <h3>Real-time notifications</h3>
          <p>Stay on top of every transaction with instant alerts.</p>
        </div>
      </div>
    </section>

    <section class="steps" id="steps">
      <div class="section-heading">
        <h2>Get started in minutes</h2>
        <p>Simple onboarding for new and returning customers.</p>
      </div>
      <div class="step-list">
        <div class="step-item">
          <div class="step-number">1</div>
          <div>
            <h4>Create account</h4>
            <p>Sign up with your email and phone number to open your wallet.</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div>
            <h4>Fund your wallet</h4>
            <p>Add money using bank transfer, cards, or USSD in seconds.</p>
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div>
            <h4>Send or receive</h4>
            <p>Move money instantly and track each transaction in real time.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="testimonials" id="testimonials">
      <div class="section-heading">
        <h2>Loved by thousands</h2>
        <p>Teams and individuals trust PrimeWallet daily.</p>
      </div>
      <div class="testimonial-card">
        <div class="stars">
          <q-icon name="star" />
          <q-icon name="star" />
          <q-icon name="star" />
          <q-icon name="star" />
          <q-icon name="star" />
        </div>
        <p>
          "PrimeWallet has completely changed how I manage my expenses. The app is fast and
          transparent."
        </p>
        <div class="testimonial-user">
          <div class="avatar">AO</div>
          <div>
            <div class="name">Adesee Okonko</div>
            <div class="role">Founder, Orbit</div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div>
        <h2>Your money, your control. Start today.</h2>
        <p>Join over 200,000 users building their financial future with VaultPay.</p>
      </div>
      <q-btn
        unelevated
        color="primary"
        label="Create a free account"
        to="register"
      />
    </section>

    <section class="faq" id="faq">
      <div class="section-heading">
        <h2>Frequently asked questions</h2>
        <p>Answers to common questions about VaultPay.</p>
      </div>
      <div class="faq-grid">
        <div>
          <h4>Is PrimeWallet secure?</h4>
          <p>Yes. We use bank-grade encryption and multi-layer security controls.</p>
        </div>
        <div>
          <h4>Can I transfer to any bank?</h4>
          <p>Yes. You can send money to any major Nigerian bank instantly.</p>
        </div>
        <div>
          <h4>How do I fund my wallet?</h4>
          <p>Use bank transfer, cards, or USSD to add funds at any time.</p>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-brand">
        <div class="brand-mark small">P</div>
        <div>
          <div class="brand-name">PrimeWallet</div>
          <div class="footer-note">Secure digital wallet for modern money.</div>
        </div>
      </div>
      <div class="footer-links">
        <span>Product</span>
        <span>Company</span>
        <span>Account</span>
      </div>
      <div class="footer-meta">(c) 2026 PrimeWallet Technologies Ltd.</div>
    </footer>
  </q-page>
</template>

<style scoped>
.landing {
  background: radial-gradient(circle at top, #0f2a3d 0%, #081425 55%, #060f1b 100%);
  color: #e9f2ff;
  font-family: "Plus Jakarta Sans", "Manrope", "Segoe UI", sans-serif;
  padding: 96px 20px 60px;
}

.hero {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.7fr;
  gap: 40px;
  align-items: center;
}

.trust-chip {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(45, 212, 191, 0.15);
  color: #9ff0e4;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.hero-content h1 {
  font-size: 2.8rem;
  line-height: 1.15;
  margin: 16px 0 12px;
}

.hero-sub {
  font-size: 1rem;
  color: #c5d4ef;
  max-width: 460px;
}

.hero-actions {
  margin-top: 20px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.cta-main {
  padding: 10px 18px;
  border-radius: 14px;
  font-weight: 600;
}

.cta-ghost {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
}

.hero-card {
  background: linear-gradient(180deg, #0f2235, #0a1627);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 25px 40px rgba(2, 6, 23, 0.35);
  min-height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-chip {
  width: 38px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fcd34d, #f97316);
}

.card-logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(56, 189, 248, 0.2);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.card-balance {
  margin-top: 30px;
}

.card-label {
  color: #94a3b8;
  font-size: 0.85rem;
}

.card-amount {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 6px;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-actions span {
  width: 36px;
  height: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.25);
}

.stats {
  max-width: 1120px;
  margin: 40px auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  text-align: center;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
}

.stat-label {
  color: #9fb3d1;
  margin-top: 4px;
}

section {
  max-width: 1120px;
  margin: 60px auto 0;
}

.section-heading h2 {
  margin-bottom: 6px;
  font-size: 2rem;
}

.section-heading p {
  color: #a9bedc;
}

.feature-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.feature-card {
  background: rgba(10, 22, 39, 0.9);
  border-radius: 18px;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.feature-icon {
  font-size: 1.3rem;
}

.feature-card h3 {
  margin: 12px 0 6px;
}

.steps {
  margin-top: 70px;
}

.step-list {
  margin-top: 24px;
  display: grid;
  gap: 16px;
}

.step-item {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 16px;
  background: rgba(10, 22, 39, 0.9);
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.step-number {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(56, 189, 248, 0.2);
  color: #7dd3fc;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.testimonials {
  margin-top: 70px;
}

.testimonial-card {
  margin-top: 24px;
  background: rgba(15, 23, 42, 0.85);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.stars {
  color: #facc15;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.testimonial-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(45, 212, 191, 0.2);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.cta {
  margin-top: 70px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(45, 212, 191, 0.1));
  border-radius: 24px;
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.faq-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.faq-grid div {
  background: rgba(10, 22, 39, 0.9);
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.footer {
  margin-top: 80px;
  display: grid;
  gap: 12px;
  text-align: center;
  color: #94a3b8;
}

.footer-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.brand-mark.small {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 22px;
  font-weight: 600;
}

.footer-meta {
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-card {
    max-width: 340px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }

  .cta {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .landing {
    padding-top: 88px;
  }

  .hero-content h1 {
    font-size: 2.1rem;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    width: 100%;
  }

  .cta-main,
  .cta-ghost {
    width: 100%;
  }
}
</style>
