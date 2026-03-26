<template>
  <q-page class="admin-dashboard">
    <div class="dashboard-copy">
      <div class="eyebrow">Admin <span>Dashboard</span></div>
      <h1 class="page-title">Intelligence Overview</h1>
    </div>

    <section class="stats-grid">
      <article
        v-for="card in statCards"
        :key="card.label"
        class="metric-card"
        :class="`variant-${card.variant}`"
      >
        <div class="metric-head">
          <div class="metric-label">{{ card.label }}</div>
          <div class="metric-icon">
            <q-icon :name="card.icon" />
          </div>
        </div>

        <div class="metric-value-row">
          <div class="metric-value">{{ card.value }}</div>
          <div class="metric-change" :class="card.changeTone">{{ card.change }}</div>
        </div>

        <div class="metric-subcopy">{{ card.subcopy }}</div>
      </article>
    </section>

    <section class="analytics-grid">
      <q-card flat class="panel-card chart-panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">User Acquisition</div>
            <div class="panel-subtitle">Daily new users over the last 30 days</div>
          </div>
          <div class="panel-actions">
            <span class="live-badge">Live</span>
            <q-btn flat round dense icon="more_vert" color="grey-7" />
          </div>
        </div>

        <div class="bar-chart">
          <div
            v-for="point in userBars"
            :key="point.label"
            class="bar-wrap"
          >
            <div class="bar-track">
              <div class="bar-fill" :style="{ height: `${point.value}%` }"></div>
            </div>
            <div class="bar-label">{{ point.label }}</div>
          </div>
        </div>

        <div class="chart-footer">
          <div class="legend-copy">
            <span class="legend-dot primary"></span>
            <span>New registrations</span>
          </div>
          <div class="footer-highlight">+4.2% versus previous month</div>
        </div>
      </q-card>

      <q-card flat class="panel-card transaction-panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">Transaction Velocity</div>
            <div class="panel-subtitle">Settled volume (USD) aggregated daily</div>
          </div>
          <div class="transaction-tools">
            <button class="text-tool" type="button">
              <q-icon name="filter_list" />
              <span>Filters</span>
            </button>
            <button class="icon-tool" type="button">
              <q-icon name="download" />
            </button>
          </div>
        </div>

        <div class="velocity-state">
          <div class="placeholder-line wide"></div>
          <div class="placeholder-line mid"></div>
          <div class="placeholder-line wide"></div>
          <div class="placeholder-chart">
            <div class="placeholder-peak"></div>
            <div class="placeholder-bars">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="placeholder-line short"></div>
          <div class="placeholder-line wide bottom"></div>
        </div>

        <div class="chart-footer muted-footer">
          <div class="legend-copy">
            <span class="legend-dot slate"></span>
            <span>Total volume</span>
          </div>
          <div class="footer-muted">Consistent upward trend maintained</div>
        </div>
      </q-card>
    </section>

    <section class="audit-panel">
      <div class="audit-head">
        <div class="audit-title">Precision Audit Trail</div>
        <button class="audit-link" type="button">View All Activities</button>
      </div>

      <div class="audit-table">
        <div class="audit-row audit-header-row">
          <div>Event Entity</div>
          <div>Operation</div>
          <div>Status</div>
          <div>Intensity</div>
          <div>Timestamp</div>
        </div>

        <div
          v-for="item in auditRows"
          :key="item.id"
          class="audit-row audit-body-row"
        >
          <div class="entity-cell">
            <div class="entity-avatar">{{ item.initials }}</div>
            <div>
              <div class="entity-name">{{ item.name }}</div>
              <div class="entity-id">ID: {{ item.id }}</div>
            </div>
          </div>

          <div class="operation-cell">{{ item.operation }}</div>

          <div>
            <span class="status-pill" :class="`status-${item.statusTone}`">
              {{ item.status }}
            </span>
          </div>

          <div>
            <div class="intensity-track">
              <span
                class="intensity-fill"
                :class="`intensity-${item.statusTone}`"
                :style="{ width: item.intensity }"
              ></span>
            </div>
          </div>

          <div class="timestamp-cell">{{ item.time }}</div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
const statCards = [
  {
    label: 'Total Users',
    value: '12,450',
    change: '+12%',
    changeTone: 'positive',
    subcopy: 'Platform-wide accounts',
    icon: 'person',
    variant: 'indigo',
  },
  {
    label: 'Active',
    value: '10,120',
    change: '81% rate',
    changeTone: 'neutral',
    subcopy: 'Healthy engagement',
    icon: 'flash_on',
    variant: 'violet',
  },
  {
    label: 'Suspended',
    value: '2,330',
    change: '+2.4%',
    changeTone: 'negative',
    subcopy: 'Accounts under review',
    icon: 'block',
    variant: 'red',
  },
  {
    label: 'Transactions',
    value: '45,670',
    change: 'New ATH',
    changeTone: 'positive',
    subcopy: 'Lifetime processed',
    icon: 'event_note',
    variant: 'slate',
  },
  {
    label: 'Volume',
    value: '$1.2M',
    change: 'USD',
    changeTone: 'brand',
    subcopy: 'Successful settlements',
    icon: 'account_balance_wallet',
    variant: 'blue',
  },
  {
    label: 'Flagged',
    value: '89',
    change: 'Action Req.',
    changeTone: 'warning',
    subcopy: 'Marked for review',
    icon: 'warning_amber',
    variant: 'amber',
  },
]

const userBars = [
  { label: '01 May', value: 24 },
  { label: '04 May', value: 42 },
  { label: '08 May', value: 36 },
  { label: '12 May', value: 55 },
  { label: '15 May', value: 72 },
  { label: '18 May', value: 66 },
  { label: '22 May', value: 88 },
  { label: '26 May', value: 100 },
]

const auditRows = [
  {
    name: 'John Doe',
    initials: 'JD',
    id: '88231-X',
    operation: 'Large Volume Withdrawal',
    status: 'Flagged',
    statusTone: 'warning',
    intensity: '76%',
    time: '2 min ago',
  },
  {
    name: 'Alice Smith',
    initials: 'AS',
    id: '10293-A',
    operation: 'Subscription Upgrade',
    status: 'Success',
    statusTone: 'brand',
    intensity: '26%',
    time: '15 min ago',
  },
  {
    name: 'Robert Brown',
    initials: 'RB',
    id: '44210-C',
    operation: 'Password Reset',
    status: 'Completed',
    statusTone: 'slate',
    intensity: '100%',
    time: '1 hr ago',
  },
]
</script>

<style scoped>
.admin-dashboard {
  padding: 42px 38px 48px;
  background: transparent;
}

.dashboard-copy {
  margin-bottom: 26px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #27324a;
}

.eyebrow span {
  color: #2336d7;
}

.page-title {
  margin: 10px 0 0;
  font-size: clamp(2.1rem, 4vw, 3.15rem);
  line-height: 1;
  font-weight: 800;
  color: #111827;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  min-height: 152px;
  padding: 22px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(219, 227, 241, 0.9);
  box-shadow: 0 18px 40px rgba(30, 41, 59, 0.05);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 18px 0 0 18px;
  background: var(--card-accent);
}

.variant-indigo {
  --card-accent: #2942d3;
}

.variant-violet {
  --card-accent: #6b7cff;
}

.variant-red {
  --card-accent: #d11a1d;
}

.variant-slate {
  --card-accent: #586983;
}

.variant-blue {
  --card-accent: #3052ff;
}

.variant-amber {
  --card-accent: #8a3b05;
}

.metric-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.metric-label {
  max-width: 100px;
  color: #20293a;
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.metric-icon {
  color: rgba(107, 124, 255, 0.55);
  font-size: 1.5rem;
}

.metric-value-row {
  margin-top: 26px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.metric-value {
  font-size: clamp(2rem, 2.6vw, 2.4rem);
  line-height: 1;
  font-weight: 800;
  color: #111827;
}

.metric-change {
  font-size: 0.98rem;
  font-weight: 700;
}

.metric-change.positive {
  color: #16a34a;
}

.metric-change.neutral {
  color: #64748b;
}

.metric-change.negative {
  color: #dc2626;
}

.metric-change.brand {
  color: #3248ff;
}

.metric-change.warning {
  color: #92400e;
}

.metric-subcopy {
  margin-top: 10px;
  color: #8893a7;
  font-size: 0.95rem;
}

.analytics-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 22px;
}

.panel-card {
  border-radius: 20px;
  background: rgba(245, 247, 255, 0.96);
  border: 1px solid rgba(219, 227, 241, 0.9);
  box-shadow: 0 18px 40px rgba(30, 41, 59, 0.05);
  overflow: hidden;
}

.panel-head {
  padding: 28px 30px 22px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-title {
  font-size: 1.65rem;
  line-height: 1.1;
  font-weight: 800;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.panel-subtitle {
  margin-top: 6px;
  color: #475569;
  font-size: 1.03rem;
}

.panel-actions,
.transaction-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-badge {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  background: #dbe0ff;
  color: #2432bc;
  font-size: 0.86rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.bar-chart {
  height: 360px;
  padding: 16px 28px 10px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  align-items: end;
  gap: 10px;
}

.bar-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
}

.bar-track {
  flex: 1 1 auto;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, #d2d9ff 0%, #b8c0ff 100%);
}

.bar-wrap:nth-child(7) .bar-fill,
.bar-wrap:nth-child(8) .bar-fill {
  background: linear-gradient(180deg, #aeb9ff 0%, #94a3ff 100%);
}

.bar-label {
  color: #1f2937;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
}

.chart-footer {
  min-height: 60px;
  padding: 0 30px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: #e8edff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.legend-copy {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #20293a;
  font-size: 0.98rem;
  font-weight: 700;
  text-transform: uppercase;
}

.legend-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.legend-dot.primary {
  background: #2844d1;
}

.legend-dot.slate {
  background: #64748b;
}

.footer-highlight {
  color: #2138d4;
  font-size: 1.02rem;
  font-weight: 800;
}

.text-tool,
.icon-tool {
  border: none;
  background: transparent;
  color: #334155;
  cursor: pointer;
}

.text-tool {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.96rem;
  font-weight: 800;
  text-transform: uppercase;
}

.icon-tool {
  width: 40px;
  height: 40px;
}

.velocity-state {
  height: 360px;
  padding: 34px 44px 22px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
}

.placeholder-line {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(223, 228, 250, 0.9), rgba(237, 241, 255, 0.95));
  margin-bottom: 30px;
}

.placeholder-line.wide {
  width: 92%;
}

.placeholder-line.mid {
  width: 70%;
}

.placeholder-line.short {
  width: 75%;
}

.placeholder-line.bottom {
  margin-bottom: 0;
}

.placeholder-chart {
  height: 120px;
  margin: 8px auto 30px;
  width: 160px;
  position: relative;
}

.placeholder-peak {
  position: absolute;
  inset: 10px 0 auto;
  height: 64px;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-bottom: 16px solid transparent;
}

.placeholder-peak::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 8px;
  height: 52px;
  border: 10px solid #cdd5ef;
  border-top: 0;
  border-right: 0;
  transform: skewY(-42deg);
  opacity: 0.8;
}

.placeholder-bars {
  position: absolute;
  left: 30px;
  right: 30px;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.placeholder-bars span {
  width: 14px;
  border-radius: 8px 8px 0 0;
  background: #cdd5ef;
}

.placeholder-bars span:nth-child(1) {
  height: 24px;
}

.placeholder-bars span:nth-child(2) {
  height: 50px;
}

.placeholder-bars span:nth-child(3) {
  height: 42px;
}

.placeholder-bars span:nth-child(4) {
  height: 74px;
}

.muted-footer {
  background: #eef2ff;
}

.footer-muted {
  color: #475569;
  font-size: 1.02rem;
  font-weight: 700;
}

.audit-panel {
  margin-top: 24px;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(219, 227, 241, 0.9);
  box-shadow: 0 18px 40px rgba(30, 41, 59, 0.05);
}

.audit-head {
  min-height: 94px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.audit-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #111827;
}

.audit-link {
  border: none;
  background: transparent;
  color: #2336d7;
  font-weight: 800;
  cursor: pointer;
}

.audit-table {
  width: 100%;
}

.audit-row {
  display: grid;
  grid-template-columns: 1.45fr 1.55fr 0.9fr 1fr 0.8fr;
  gap: 16px;
  align-items: center;
}

.audit-header-row {
  min-height: 50px;
  padding: 0 30px;
  background: #ebefff;
  color: #20293a;
  font-size: 0.92rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.audit-body-row {
  min-height: 84px;
  padding: 0 30px;
  border-top: 1px solid #edf1fb;
}

.entity-cell {
  display: flex;
  align-items: center;
  gap: 14px;
}

.entity-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0f172a, #475569);
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
}

.entity-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
}

.entity-id {
  margin-top: 2px;
  color: #64748b;
  font-size: 0.88rem;
}

.operation-cell {
  font-size: 1.08rem;
  color: #111827;
}

.status-pill {
  min-height: 28px;
  padding: 0 12px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

.status-warning {
  background: #ffd8bf;
  color: #7c2d12;
}

.status-brand {
  background: #dbdeff;
  color: #1726a6;
}

.status-slate {
  background: #dbeafe;
  color: #1e3a8a;
}

.intensity-track {
  height: 8px;
  border-radius: 999px;
  background: #e7ebf7;
  overflow: hidden;
}

.intensity-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.intensity-warning {
  background: #7c2d12;
}

.intensity-brand {
  background: #2942d3;
}

.intensity-slate {
  background: #64748b;
}

.timestamp-cell {
  color: #1f2937;
  font-weight: 700;
  text-transform: uppercase;
}

@media (max-width: 1439px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1159px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .audit-row {
    grid-template-columns: 1.2fr 1.2fr 0.8fr 0.8fr;
  }

  .audit-row > :last-child {
    display: none;
  }
}

@media (max-width: 899px) {
  .admin-dashboard {
    padding: 28px 18px 32px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-footer,
  .panel-head,
  .audit-head {
    padding-left: 18px;
    padding-right: 18px;
  }

  .bar-chart {
    padding-left: 18px;
    padding-right: 18px;
  }

  .velocity-state {
    padding-left: 18px;
    padding-right: 18px;
  }

  .audit-header-row,
  .audit-body-row {
    padding-left: 18px;
    padding-right: 18px;
  }
}

@media (max-width: 639px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .bar-chart {
    height: 280px;
    gap: 6px;
  }

  .bar-label {
    font-size: 0.75rem;
  }

  .chart-footer,
  .audit-head {
    min-height: auto;
    padding-top: 16px;
    padding-bottom: 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .audit-header-row {
    display: none;
  }

  .audit-body-row {
    padding-top: 18px;
    padding-bottom: 18px;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .operation-cell,
  .timestamp-cell {
    font-size: 0.98rem;
  }
}
</style>
