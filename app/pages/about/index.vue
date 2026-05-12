<template>
  <div class="about-page">
    <section class="about-page__hero" aria-labelledby="about-hero-heading">
      <p class="about-page__badge">Redefining connectivity</p>

      <h1 id="about-hero-heading" class="about-page__hero-title large">
        Our Mission:<br />
        <span class="about-page__gradient-text"> Pop Your Links</span>
      </h1>

      <p class="about-page__hero-sub">
        We're building the future of the creator economy by transforming static
        links into dynamic bridges of engagement.
      </p>
    </section>

    <section class="about-page__story" aria-labelledby="about-origin-heading">
      <div class="about-page__story-content">
        <div class="about-page__story-visual">
          <img
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=900&h=900&fit=crop&q=80&auto=format&sat=-100"
            width="480"
            height="480"
            alt="Creative team collaborating in a modern workspace with ambient screens"
            class="about-page__story-photo"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div class="about-page__story-copy">
          <h2 id="about-origin-heading" class="about-page__section-title">
            The origin story
          </h2>

          <div class="about-page__body">
            <p>
              Popli was born out of a simple frustration: in a world drowning in
              static URLs, creators needed more than basic shorteners—they
              needed a living connection to their audiences.
            </p>
            <p>
              Founded in 2025, we set out to move beyond shortening links toward
              building a clearer map of engagement—measurable, adaptable, and
              built for scale.
            </p>
            <p>
              Today, Popli empowers teams and creators around the world to turn
              every tap into true signal and every bio into a purposeful front
              door. We're not just trimming URLs; we're building the digital
              spine your brand can grow on.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="about-page__values" aria-labelledby="about-values-heading">
      <h2 id="about-values-heading" class="about-page__values-heading">
        Our core values
      </h2>

      <div class="about-page__values-grid">
        <div class="about-page__value-card">
          <span
            class="about-page__icon-tile about-page__icon-tile--blue"
            aria-hidden="true"
          >
            <Icon
              class="secondary"
              name="popli:analytics-outline"
              size="1.25rem"
            />
          </span>
          <h3 class="about-page__value-title">Precision analytics</h3>
          <p class="about-page__value-text">
            We treat data as a map of human behavior—surgical insight into every
            interaction so you can optimize with confidence, not guesswork.
          </p>
        </div>

        <div class="about-page__value-card">
          <span
            class="about-page__icon-tile about-page__icon-tile--pink"
            aria-hidden="true"
          >
            <Icon class="pink" name="popli:android-wifi-3-bar" size="1.25rem" />
          </span>
          <h3 class="about-page__value-title">Seamless connectivity</h3>
          <p class="about-page__value-text">
            Tools should melt into your workflow like they've always been
            there—fast handoffs from link to QR to profile, without friction.
          </p>
        </div>

        <div class="about-page__value-card">
          <span
            class="about-page__icon-tile about-page__icon-tile--purple"
            aria-hidden="true"
          >
            <Icon class="tertiary" name="popli:lightning-bolt" size="1.25rem" />
          </span>
          <h3 class="about-page__value-title">Creative freedom</h3>
          <p class="about-page__value-text">
            Deep customization for your digital identity—layouts, visuals, and
            journeys that feel unmistakably you, never boxed in by defaults.
          </p>
        </div>
      </div>
    </section>

    <section class="about-page__vision" aria-labelledby="about-vision-heading">
      <div class="about-page__vision-content">
        <Icon class="pink" name="popli:sparkles" size="4rem" />

        <h2 id="about-vision-heading" class="about-page__vision-title large">
          We believe digital identity is the most valuable asset of the 21st
          century.
        </h2>

        <p class="about-page__vision-sub">
          Our vision is to provide the infrastructure that makes that identity
          portable, measurable, and infinitely scalable. We aren't just
          shortening links; we're expanding possibilities.
        </p>
      </div>
    </section>

    <section class="about-page__cta" aria-labelledby="about-cta-heading">
      <div class="about-page__cta-inner">
        <h2 id="about-cta-heading" class="about-page__cta-title">
          Ready to transform your reach?
        </h2>

        <p class="about-page__cta-sub">
          Join thousands of creators who use Popli to power their digital
          presence. Start for free today.
        </p>

        <div class="about-page__cta-actions">
          <NuxtLink to="/sign-up" class="about-page__btn">
            Join Popli now
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { seo } = useAppConfig();

usePageSeo({
  title: seo.aboutTitle,
  description: seo.aboutDescription,
  path: '/about',
  ogImage: seo.defaultOgImagePath,
  robots: 'index, follow',
});
</script>

<style lang="scss" scoped>
.about-page {
  width: 100%;
  background: var(--background-primary);
  padding: 0 0 6rem;

  &__hero {
    max-width: 52rem;
    margin: 0 auto;
    padding: clamp(4rem, 10vw, 8rem) 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }

  &__badge {
    margin: 0;
    padding: 0.4rem 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #fff;
    background: color-mix(in oklab, var(--primary-400) 20%, transparent);
    border-radius: 0.75rem;
    border: 1px solid color-mix(in oklab, var(--primary-400) 40%, transparent);
  }

  &__hero-title {
    margin: 0;
    font-weight: 800;
    line-height: 1.1;
    color: var(--neutral-100);
    text-align: center;
  }

  &__gradient-text {
    background: linear-gradient(90deg, var(--primary-400), var(--primary-600));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  &__hero-sub {
    margin: 0;
    max-width: 38rem;
    font-size: 1.25rem;
    line-height: 1.65;
    color: var(--neutral-400);
  }

  &__story {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--background-secondary);
    padding: 0 1rem;
  }

  &__story-content {
    max-width: 72rem;
    display: flex;
    flex-direction: row;
    gap: clamp(2rem, 5vw, 4rem);
    padding: clamp(3rem, 8vw, 6rem) 0;
  }

  &__story-visual {
    width: 100%;
    border-radius: 1rem;
    overflow: hidden;
    aspect-ratio: 1;
    background: var(--about-card);
  }

  &__story-photo {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(1);
  }

  &__story-copy {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  &__section-title {
    margin: 0;
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 500;
    color: var(--neutral-100);
    text-transform: capitalize;
    text-align: left;
    width: 100%;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.7;
      color: var(--neutral-400);
    }
  }

  &__values {
    max-width: 72rem;
    margin: 0 auto;
    padding: clamp(3rem, 8vw, 6rem) 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  &__values-heading {
    margin: 0;
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 500;
    text-align: center;
    color: var(--neutral-100);
    text-transform: capitalize;
  }

  &__values-grid {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    gap: 2rem;
  }

  &__value-card {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 1rem;
    background: var(--background-secondary);
    border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
    border-radius: 1rem;
    padding: 1.75rem;
  }

  &__icon-tile {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--blue {
      background: linear-gradient(
        145deg,
        color-mix(in oklab, var(--secondary-300) 20%, transparent),
        color-mix(in oklab, var(--secondary-600) 20%, transparent)
      );
    }

    &--pink {
      background: linear-gradient(
        145deg,
        color-mix(in oklab, var(--primary-300) 20%, transparent),
        color-mix(in oklab, var(--primary-600) 20%, transparent)
      );
    }

    &--purple {
      background: linear-gradient(
        145deg,
        color-mix(in oklab, var(--tertiary-300) 20%, transparent),
        color-mix(in oklab, var(--tertiary-600) 20%, transparent)
      );
    }
  }

  &__value-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--neutral-100);
    text-transform: capitalize;
  }

  &__value-text {
    margin: 0;
    font-size: 0.875rem;
    color: var(--neutral-400);
  }

  &__vision {
    width: 100%;
    background: var(--background-secondary);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__vision-content {
    max-width: 72rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: clamp(3rem, 10vw, 7rem) 1rem;
  }

  &__vision-title {
    margin: 0;
    text-align: center;
    font-size: clamp(1.5rem, 4vw, 4rem);
    font-weight: 500;
    color: var(--neutral-100);
  }

  &__vision-sub {
    margin: 0;
    max-width: 42rem;
    font-size: 1.25rem;
    line-height: 1.7;
    text-align: center;
    color: var(--neutral-400);
  }

  &__cta {
    max-width: 72rem;
    margin: 0 auto;
    padding: 2rem 1rem 0;
  }

  &__cta-inner {
    border-radius: 1.25rem;
    padding: clamp(2.5rem, 6vw, 4rem);
    text-align: center;
    background-image: linear-gradient(
      135deg,
      var(--primary-300),
      var(--primary-600)
    );
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  &__cta-title {
    margin: 0;
    font-size: clamp(1.5rem, 4vw, 2.125rem);
    font-weight: 500;
    color: var(--primary-950);
    text-align: center;
  }

  &__cta-sub {
    margin: 0;
    max-width: 42rem;
    font-size: 1.25rem;
    font-weight: 300;
    line-height: 1.7;
    text-align: center;
    color: var(--primary-950);
  }

  &__cta-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
    justify-content: center;
    margin-top: 0.75rem;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0 1.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    border-radius: 0.625rem;
    text-decoration: none;
    text-transform: capitalize;
    transition: opacity 0.15s ease, transform 0.15s ease;
    background: var(--primary-950);
    color: var(--primary-300);
    border: 1px solid color-mix(in oklab, var(--primary-950) 20%, transparent);

    &:hover {
      opacity: 0.94;
      transform: translateY(-1px);
    }
  }
}

@media (max-width: 768px) {
  .about-page {
    &__story-content {
      flex-direction: column;
    }

    &__values-grid {
      flex-direction: column;
    }
  }
}
</style>
