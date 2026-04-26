<template>
  <div id="features" class="features">
    <div class="container">
      <div class="heading">
        <h1>Core Ecosystem</h1>

        <span class="subheading">
          Powerful tools designed to work together, giving you the edge in a
          crowded digital landscape.
        </span>
      </div>

      <div class="feature-list">
        <div class="feature url-shortener">
          <BackgroundBlur position="top-right" type="primary" />

          <div class="icon-tag">
            <div class="icon">
              <Icon name="popli:link" size="2rem" />
            </div>

            <UiTag severity="secondary">Fast & Reliable</UiTag>
          </div>

          <span class="title"> URL Shortener </span>

          <span class="description">
            Professional, branded links that build trust. Includes deep
            analytics, geo-targeting, and custom back-halves.
          </span>
        </div>

        <div class="feature qr-code">
          <div class="icon-tag">
            <div class="icon">
              <Icon name="popli:qr-code-2" size="2rem" />
            </div>
          </div>

          <span class="title"> QR Code Generator </span>

          <span class="description">
            Dynamic, custom-branded QR codes that never expire. Change
            destinations instantly.
          </span>

          <div class="preview">
            <Icon name="popli:qr-code-scanner" size="3rem" />
          </div>
        </div>

        <div class="feature link-in-bio">
          <div class="icon-tag">
            <div class="icon">
              <Icon name="popli:person-outline" size="2rem" />
            </div>
          </div>

          <span class="title"> Link-in-Bio Profiles </span>

          <span class="description">
            Your entire digital identity on one page. Stunning templates, social
            embeds, and one-tap connectivity.
          </span>
        </div>

        <div class="feature digital-store">
          <div class="icon-tag">
            <div class="icon">
              <Icon name="popli:shopping-bag-outline" size="2rem" />
            </div>

            <UiTag severity="secondary">Upcoming Feature</UiTag>
          </div>

          <span class="title"> Digital Store </span>

          <span class="description">
            Sell digital products, PDFs, presets, and consulting directly from
            your profile. No complicated setup, just one link.
          </span>

          <div class="sub-features">
            <UiTag severity="primary"> Instant Payouts </UiTag>

            <UiTag severity="primary"> Customizable Pricing </UiTag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.features {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  background-color: var(--background-secondary);

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rem;
    max-width: 80rem;

    .heading {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
      align-items: flex-start;

      .subheading {
        color: var(--neutral-400);
      }
    }

    .feature-list {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      .feature {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 2rem;
        border-radius: 1rem;
        position: relative;
        background: var(--background-secondary);
        overflow: hidden;
        width: 100%;

        .icon-tag {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;

          .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            border-radius: 1rem;
          }
        }

        .title {
          font-size: clamp(1.25rem, 5vw, 2rem);
          font-weight: 600;
          color: var(--tertiary-100);
        }

        .description {
          color: var(--neutral-400);
          font-size: 1rem;
          line-height: 1.5;
        }

        .preview {
          width: 100%;
          padding: 2rem;
          background-color: var(--background-secondary);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.url-shortener {
          max-width: calc(70% - 0.5rem);
          border: 1px solid
            color-mix(in oklab, var(--primary-400) 20%, transparent);

          .description {
            max-width: 60%;
          }

          .icon-tag {
            .icon {
              border: 1px solid
                color-mix(in oklab, var(--primary-400) 20%, transparent);
              background: color-mix(
                in oklab,
                var(--primary-400) 10%,
                transparent
              );

              .iconify {
                filter: brightness(0) saturate(100%) invert(64%) sepia(81%)
                  saturate(462%) hue-rotate(301deg) brightness(101%)
                  contrast(101%);
              }
            }
          }
        }

        &.qr-code {
          max-width: calc(30% - 0.5rem);
          border: 1px solid
            color-mix(in oklab, var(--secondary-400) 20%, transparent);

          .icon-tag {
            .icon {
              border: 1px solid
                color-mix(in oklab, var(--secondary-400) 20%, transparent);
              background: color-mix(
                in oklab,
                var(--secondary-400) 10%,
                transparent
              );

              .iconify {
                filter: brightness(0) saturate(100%) invert(68%) sepia(69%)
                  saturate(2838%) hue-rotate(187deg) brightness(103%)
                  contrast(106%);
              }
            }
          }

          .preview {
            background-color: color-mix(
              in oklab,
              var(--neutral-950) 100%,
              transparent
            );
          }
        }

        &.link-in-bio {
          max-width: calc(30% - 0.5rem);
          border: 1px solid
            color-mix(in oklab, var(--tertiary-400) 20%, transparent);

          .icon-tag {
            .icon {
              border: 1px solid
                color-mix(in oklab, var(--tertiary-400) 20%, transparent);
              background: color-mix(
                in oklab,
                var(--tertiary-400) 10%,
                transparent
              );

              .iconify {
                filter: brightness(0) saturate(100%) invert(78%) sepia(30%)
                  saturate(6250%) hue-rotate(206deg) brightness(102%)
                  contrast(104%);
              }
            }
          }
        }

        &.digital-store {
          max-width: calc(70% - 0.5rem);
          border: 1px solid
            color-mix(in oklab, var(--primary-400) 20%, transparent);
          background-color: var(--background-primary);

          .icon-tag {
            .icon {
              border: 1px solid
                color-mix(in oklab, var(--primary-400) 20%, transparent);
              background: color-mix(
                in oklab,
                var(--primary-400) 10%,
                transparent
              );

              .iconify {
                filter: brightness(0) saturate(100%) invert(64%) sepia(81%)
                  saturate(462%) hue-rotate(301deg) brightness(101%)
                  contrast(101%);
              }
            }
          }

          .sub-features {
            display: flex;
            gap: 0.5rem;

            .sub-feature {
              background-color: color-mix(
                in oklab,
                var(--neutral-950) 100%,
                transparent
              );
              color: var(--neutral-300);
              padding: 0.5rem 1rem;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .features {
    padding: 4rem 2rem;

    .container {
      gap: 4rem;

      .feature-list {
        flex-direction: column;

        .feature {
          max-width: 100% !important;
        }
      }
    }
  }
}
</style>
