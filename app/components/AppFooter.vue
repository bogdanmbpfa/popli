<template>
  <footer class="app-footer">
    <div class="container">
      <div class="main">
        <div class="info">
          <div class="logo">
            <nuxt-img src="/logo.png" alt="Popli.one logo" loading="lazy" />

            <span class="name">Popli.one</span>
          </div>

          <span class="description">
            Elevating digital presence for modern creators through intelligent
            connectivity.
          </span>
        </div>

        <div class="links">
          <span class="title"> Product </span>

          <div class="link-list">
            <nuxt-link to="/#features">
              <span class="label">Features</span>
            </nuxt-link>

            <nuxt-link to="/#pricing">
              <span class="label">Pricing</span>
            </nuxt-link>
          </div>
        </div>

        <div class="links">
          <span class="title"> Company </span>

          <div class="link-list">
            <nuxt-link to="/about">
              <span class="label">About</span>
            </nuxt-link>

            <nuxt-link to="/contact">
              <span class="label">Contact</span>
            </nuxt-link>

            <nuxt-link to="/terms-of-service">
              <span class="label">Terms of Service</span>
            </nuxt-link>

            <nuxt-link to="/privacy-policy">
              <span class="label">Privacy Policy</span>
            </nuxt-link>

            <nuxt-link to="/cookie-policy">
              <span class="label">Cookie Policy</span>
            </nuxt-link>
          </div>
        </div>
      </div>

      <div class="bottom">
        <span class="copyright">© 2025 Popli.one. All rights reserved.</span>

        <span class="message"> Made with ❤️ for creators everywhere. </span>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: var(--background-primary);
  border-top: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);

  .container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 80rem;

    .main {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 2rem;
      padding-bottom: 1rem;

      .info,
      .links {
        width: 100%;
      }

      .info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .logo {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;

          img {
            width: 2rem;
            height: 2rem;
          }

          .name {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--neutral-100);
          }
        }

        .description {
          font-size: 0.875rem;
          color: var(--neutral-400);
        }
      }

      .links {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--neutral-100);
        }

        .link-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          a {
            color: var(--neutral-400);
            text-decoration: none;
            font-size: 0.875rem;
            width: fit-content;
          }
        }
      }
    }

    .bottom {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid
        color-mix(in oklab, var(--neutral-400) 10%, transparent);

      .copyright,
      .message {
        font-size: 0.875rem;
        color: var(--neutral-400);
      }
    }
  }
}

@media (max-width: 768px) {
  .app-footer {
    .container {
      .main {
        flex-wrap: wrap;
        justify-content: flex-start;
        
        .links {
          width: calc(50% - 1rem);
        }
      }

      .bottom {
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }
}
</style>
