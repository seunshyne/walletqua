<template>
  <q-page class="admin-dashboard">
    <div class="dashboard-copy">
      <div class="eyebrow">Admin <span>Dashboard</span></div>
      <h1 class="page-title">Intelligence Overview</h1>
      <p class="page-subtitle">Live metrics from admin analytics summary, user growth, and transaction volume endpoints.</p>
    </div>

    <div v-if="error && !isLoading" class="error-banner">{{ error }}</div>

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
            <div class="panel-subtitle">Daily user registrations over the last 30 days</div>
          </div>
          <div class="panel-actions">
            <span class="live-badge">Live</span>
          </div>
        </div>

        <div v-if="isLoading" class="chart-loading">
          <q-skeleton v-for="n in 8" :key="n" class="chart-skeleton" />
        </div>

        <div v-else class="bar-chart">
          <div
            v-for="point in userSeries"
            :key="point.label"
            class="bar-wrap"
          >
            <div class="bar-track">
              <div class="bar-fill" :style="{ height: `${point.normalizedValue}%` }"></div>
            </div>
            <div class="bar-label">{{ formatShortDate(point.label) }}</div>
          </div>
        </div>

        <div class="chart-footer">
          <div class="legend-copy">
            <span class="legend-dot primary"></span>
            <span>New registrations</span>
          </div>
          <div class="footer-highlight">{{ totalUsersLast30Days }} users in 30 days</div>
        </div>
      </q-card>

      <q-card flat class="panel-card chart-panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">Transaction Volume</div>
            <div class="panel-subtitle">Daily settled volume over the last 30 days</div>
          </div>
          <div class="panel-actions">
            <span class="live-badge muted">Volume</span>
          </div>
        </div>

        <div v-if="isLoading" class="chart-loading">
          <q-skeleton v-for="n in 8" :key="`tx-${n}`" class="chart-skeleton" />
        </div>

        <div v-else class="bar-chart">
          <div
            v-for="point in transactionSeries"
            :key="point.label"
            class="bar-wrap"
          >
            <div class="bar-track">
              <div class="bar-fill volume-fill" :style="{ height: `${point.normalizedValue}%` }"></div>
            </div>
            <div class="bar-label">{{ formatShortDate(point.label) }}</div>
          </div>
        </div>

        <div class="chart-footer muted-footer">
          <div class="legend-copy">
            <span class="legend-dot slate"></span>
            <span>Total volume</span>
          </div>
          <div class="footer-highlight">{{ formatCurrency(totalVolumeLast30Days) }}</div>
        </div>
      </q-card>
    </section>

    <section class="insight-grid">
      <article class="insight-card">
        <div class="insight-label">User Health</div>
        <div class="insight-value">{{ activeRate }}%</div>
        <p class="insight-copy">Active-user ratio based on the current analytics summary.</p>
      </article>

      <article class="insight-card">
        <div class="insight-label">Suspension Watch</div>
        <div class="insight-value">{{ summary?.suspended_users ?? 0 }}</div>
        <p class="insight-copy">Accounts currently marked as suspended.</p>
      </article>

      <article class="insight-card">
        <div class="insight-label">Flagged Risk</div>
        <div class="insight-value">{{ summary?.flagged_transactions ?? 0 }}</div>
        <p class="insight-copy">Transactions flagged for admin review.</p>
      </article>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAdminAnalyticsStore } from 'src/stores/adminAnalyticsStore'

const analyticsStore = useAdminAnalyticsStore()
const { summary, userSeries, transactionSeries, isLoading, error } = storeToRefs(analyticsStore)

onMounted(async () => {
  try {
    await analyticsStore.fetchAnalytics()
  } catch (error) {
    console.error('Failed to fetch admin analytics:', error)
  }
})

const statCards = computed(() => [
  {
    label: 'Total Users',
    value: formatNumber(summary.value?.total_users ?? 0),
    change: 'Accounts',
    changeTone: 'neutral',
    subcopy: 'Registered user accounts',
    icon: 'person',
    variant: 'indigo',
  },
  {
    label: 'Active Users',
    value: formatNumber(summary.value?.active_users ?? 0),
    change: `${activeRate.value}%`,
    changeTone: 'positive',
    subcopy: 'Currently active accounts',
    icon: 'flash_on',
    variant: 'violet',
  },
  {
    label: 'Suspended',
    value: formatNumber(summary.value?.suspended_users ?? 0),
    change: 'Review',
    changeTone: 'negative',
    subcopy: 'Accounts under restriction',
    icon: 'block',
    variant: 'red',
  },
  {
    label: 'Transactions',
    value: formatNumber(summary.value?.total_transactions ?? 0),
    change: 'Lifetime',
    changeTone: 'neutral',
    subcopy: 'Processed transaction count',
    icon: 'event_note',
    variant: 'slate',
  },
  {
    label: 'Volume',
    value: formatCurrency(summary.value?.total_volume ?? 0),
    change: 'Success',
    changeTone: 'brand',
    subcopy: 'Successful transaction volume',
    icon: 'account_balance_wallet',
    variant: 'blue',
  },
  {
    label: 'Flagged',
    value: formatNumber(summary.value?.flagged_transactions ?? 0),
    change: 'Alert',
    changeTone: 'warning',
    subcopy: 'Flagged transaction count',
    icon: 'warning_amber',
    variant: 'amber',
  },
])

const totalUsersLast30Days = computed(() =>
  userSeries.value.reduce((sum, item) => sum + item.value, 0)
)

const totalVolumeLast30Days = computed(() =>
  transactionSeries.value.reduce((sum, item) => sum + item.value, 0)
)

const activeRate = computed(() => {
  const total = Number(summary.value?.total_users || 0)
  const active = Number(summary.value?.active_users || 0)
  if (!total) return 0
  return Math.round((active / total) * 100)
})

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const formatNumber = (value) =>
  new Intl.NumberFormat('en-US').format(Number(value || 0))

const formatShortDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(date)
}
</script>

<style scoped>
.admin-dashboard {
  padding: 42px 38px 48px;
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
  color: #64748b;
}

.eyebrow span {
  color: #334155;
}

.page-title {
  margin: 10px 0 0;
  font-size: clamp(2.1rem, 4vw, 3.15rem);
  line-height: 1;
  font-weight: 800;
  color: #111827;
}

.page-subtitle {
  margin: 12px 0 0;
  max-width: 760px;
  color: #475569;
  line-height: 1.7;
}

.error-banner {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #feeceb;
  color: #b42318;
  font-weight: 700;
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

.variant-indigo { --card-accent: #2942d3; }
.variant-violet { --card-accent: #6b7cff; }
.variant-red { --card-accent: #d11a1d; }
.variant-slate { --card-accent: #586983; }
.variant-blue { --card-accent: #3052ff; }
.variant-amber { --card-accent: #8a3b05; }

.metric-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.metric-label {
  max-width: 112px;
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

.metric-change.positive { color: #16a34a; }
.metric-change.neutral { color: #64748b; }
.metric-change.negative { color: #dc2626; }
.metric-change.brand { color: #3248ff; }
.metric-change.warning { color: #92400e; }

.metric-subcopy {
  margin-top: 10px;
  color: #8893a7;
  font-size: 0.95rem;
}

.analytics-grid,
.insight-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.panel-card,
.insight-card {
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
  font-size: 1.4rem;
  line-height: 1.1;
  font-weight: 800;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.panel-subtitle {
  margin-top: 6px;
  color: #475569;
  font-size: 1rem;
}

.panel-actions {
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

.live-badge.muted {
  background: #e2e8f0;
  color: #334155;
}

.chart-loading,
.bar-chart {
  height: 360px;
  padding: 16px 28px 10px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
}

.chart-loading {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 10px;
  align-items: end;
}

.chart-skeleton {
  border-radius: 12px 12px 0 0;
  height: 100%;
}

.bar-chart {
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

.volume-fill {
  background: linear-gradient(180deg, #b9c8ff 0%, #7f95ff 100%);
}

.bar-label {
  color: #1f2937;
  font-weight: 700;
  font-size: 0.9rem;
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

.muted-footer {
  background: #eef2ff;
}

.legend-copy {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #20293a;
  font-size: 0.96rem;
  font-weight: 700;
  text-transform: uppercase;
}

.legend-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.legend-dot.primary { background: #2844d1; }
.legend-dot.slate { background: #64748b; }

.footer-highlight {
  color: #2138d4;
  font-size: 1rem;
  font-weight: 800;
}

.insight-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.insight-card {
  min-height: 220px;
  padding: 28px;
  display: grid;
  align-content: start;
  gap: 14px;
}

.insight-label {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.insight-value {
  color: #111827;
  font-size: 2.6rem;
  font-weight: 800;
}

.insight-copy {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

@media (max-width: 1439px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1159px) {
  .analytics-grid,
  .insight-grid {
    grid-template-columns: 1fr;
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
  .panel-head {
    padding-left: 18px;
    padding-right: 18px;
  }

  .bar-chart,
  .chart-loading {
    padding-left: 18px;
    padding-right: 18px;
  }
}

@media (max-width: 639px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .bar-chart,
  .chart-loading {
    height: 280px;
    gap: 6px;
  }

  .bar-label {
    font-size: 0.75rem;
  }

  .chart-footer {
    min-height: auto;
    padding-top: 16px;
    padding-bottom: 16px;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
