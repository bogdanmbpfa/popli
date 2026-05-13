<template>
  <div id="pricing" class="pricing">
    <div class="intro">
      <h1>Plans & limits</h1>
      <p class="intro-text">
        Free is generous to try Popli.one. Pro removes caps and unlocks the full
        analytics experience. Numbers match what the product enforces today.
      </p>
    </div>

    <div class="table-wrap">
      <table class="compare" aria-describedby="pricing-desc">
        <caption id="pricing-desc" class="sr-only">
          Comparison of Popli.one Free and Pro plans: limits and features.
        </caption>
        <thead>
          <tr>
            <th scope="col" class="feature-col">Feature</th>
            <th scope="col" class="plan-col">
              <span class="plan-name">Free</span>
              <span class="plan-tag">€0</span>
            </th>
            <th scope="col" class="plan-col plan-col--pro">
              <span class="plan-name">Pro</span>
              <span class="plan-tag plan-tag--pro">{{ proPriceLabel }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.feature">
            <th scope="row" class="feature-col">{{ row.feature }}</th>
            <td class="cell" v-html="row.free" />
            <td class="cell cell--pro" v-html="row.pro" />
          </tr>
        </tbody>
        <tfoot>
          <tr class="cta-row">
            <td class="feature-col" />
            <td class="cell cta">
              <UiButton
                severity="secondary"
                label="Start free"
                aria-label="Sign up for the Free plan"
                fluid
                @click="goSignUp(EPlanType.FREE)"
              />
            </td>
            <td class="cell cell--pro cta">
              <div class="content">
                <UiButton
                  severity="contrast"
                  label="Go Pro"
                  aria-label="Sign up for the Pro plan"
                  fluid
                  @click="goSignUp(EPlanType.PRO)"
                />

                <span class="foot-note">
                  Pro is billed monthly via Stripe. You can upgrade or manage
                  billing from account settings after sign-up.
                </span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EPlanType } from '~~/enums';

const {
  public: {
    freePlan: {
      qrCodeLimit,
      shortUrlLimit,
      featuredLinksLimit,
      secondaryLinksLimit,
    },
  },
} = useRuntimeConfig();

const proMonthlyEur = 6;

const proPriceLabel = computed(
  () =>
    `${Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(proMonthlyEur)} / month`,
);

/** Mark for “included” vs “not included” cells */
const yes = '<span class="tick" aria-label="Included">✓</span>';
const no = '<span class="dash" aria-label="Not included">—</span>';

const rows = computed(() => [
  {
    feature: 'Short links',
    free: `Up to <strong>${shortUrlLimit}</strong>`,
    pro: '<strong>Unlimited</strong>',
  },
  {
    feature: 'QR codes',
    free: `Up to <strong>${qrCodeLimit}</strong>`,
    pro: '<strong>Unlimited</strong>',
  },
  {
    feature: 'Featured links (platform icons)',
    free: `Up to <strong>${featuredLinksLimit}</strong>`,
    pro: '<strong>Unlimited</strong>',
  },
  {
    feature: 'Custom links (title, colors, image)',
    free: `Up to <strong>${secondaryLinksLimit}</strong>`,
    pro: '<strong>Unlimited</strong>',
  },
  {
    feature: 'Link-in-bio page & editor',
    free: `${yes} Same editor (cover, bio, colors, images) within link limits`,
    pro: `${yes} Same editor, no link caps`,
  },
  {
    feature: 'Account analytics — totals & 30-day trend',
    free: `${yes} Total clicks and daily chart`,
    pro: `${yes} Total clicks and daily chart`,
  },
  {
    feature: 'Account analytics — map & country breakdown',
    free: `${no} <span class="hint">Pro only</span>`,
    pro: `${yes} Mapbox map and ranked countries`,
  },
  {
    feature: 'Account analytics — click-type breakdown',
    free: `${no} <span class="hint">Pro only</span>`,
    pro: `${yes} Profile opens vs featured vs custom links`,
  },
  {
    feature: 'Per short link — daily click history',
    free: `${no} <span class="hint">Pro only</span>`,
    pro: `${yes} Last 30 days`,
  },
  {
    feature: 'Per short link — clicks by country',
    free: `${no} <span class="hint">Pro only</span>`,
    pro: `${yes} Aggregated by country`,
  },
  {
    feature: 'Per QR code — total scans',
    free: `${yes}`,
    pro: `${yes}`,
  },
  {
    feature: 'Per QR code — countries & daily trend',
    free: `${no} <span class="hint">Pro only</span>`,
    pro: `${yes} Geography + 30-day series`,
  },
  {
    feature: 'Public profile — ads for visitors',
    free: `${yes} <span class="hint">May show ads when optional cookies accepted</span>`,
    pro: `${no} <strong>Ad-free</strong> profile for visitors`,
  },
]);

const goSignUp = (plan: EPlanType) => navigateTo(`/sign-up?plan=${plan}`);
</script>

<style scoped lang="scss">
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.pricing {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  padding: 4rem 0;
  max-width: 80rem;
  margin: 0 auto;
}

.intro {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 600;
    color: var(--neutral-100);
  }

  .intro-text {
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.5;
    color: var(--neutral-400);
    text-align: left;
  }
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 1rem;
  border: 1px solid color-mix(in oklab, var(--neutral-400) 18%, transparent);
  background-color: color-mix(in oklab, var(--neutral-950) 55%, transparent);
}

.compare {
  width: 100%;
  min-width: 36rem;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

thead th {
  padding: 1rem 1.125rem;
  text-align: left;
  vertical-align: bottom;
  font-weight: 600;
  color: var(--neutral-100);
  border-bottom: 1px solid
    color-mix(in oklab, var(--neutral-400) 22%, transparent);
  background-color: color-mix(in oklab, var(--neutral-950) 80%, transparent);
}

.plan-col {
  width: 26%;
  text-align: center;
  vertical-align: middle;

  &--pro {
    background: linear-gradient(
      180deg,
      color-mix(in oklab, var(--primary-400) 12%, transparent),
      transparent
    );
    border-left: 1px solid
      color-mix(in oklab, var(--primary-400) 25%, transparent);
  }
}

.feature-col {
  width: 48%;
  text-align: left;
  font-weight: 500;
  color: var(--neutral-200);
}

.plan-name {
  display: block;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.plan-tag {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--neutral-400);

  &--pro {
    font-size: 1rem;
    color: var(--primary-300);
  }
}

tbody th,
tbody td {
  padding: 0.875rem 1.125rem;
  border-bottom: 1px solid
    color-mix(in oklab, var(--neutral-400) 12%, transparent);
  vertical-align: top;
}

tbody tr:last-child th,
tbody tr:last-child td {
  border-bottom: none;
}

.cell {
  text-align: center;
  color: var(--neutral-300);
  line-height: 1.45;

  &--pro {
    border-left: 1px solid
      color-mix(in oklab, var(--primary-400) 18%, transparent);
    background-color: color-mix(in oklab, var(--primary-400) 4%, transparent);

    .content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;

      .foot-note {
        font-size: 0.8125rem;
        color: var(--neutral-500);
        line-height: 1.4;
        text-align: center;
      }
    }
  }

  :deep(strong) {
    color: var(--neutral-100);
    font-weight: 600;
  }

  :deep(.tick) {
    color: var(--secondary-400);
    font-weight: 700;
    margin-right: 0.25rem;
  }

  :deep(.dash) {
    color: var(--neutral-500);
    margin-right: 0.25rem;
  }

  :deep(.hint) {
    display: inline-block;
    margin-top: 0.25rem;
    font-size: 0.8125rem;
    color: var(--neutral-500);
  }
}

.cta-row td {
  padding: 1rem 1.125rem 1.25rem;
  border-bottom: none;
  vertical-align: top;
}

.cta {
  padding-top: 0.5rem;
}

@media (max-width: 768px) {
  .pricing {
    padding-inline: 0.5rem;
  }

  .intro h1 {
    font-size: 1.625rem;
  }
}
</style>
