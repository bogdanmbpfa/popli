<template>
  <LegalDocument
    title="Cookie Policy"
    effective-date="10 May 2026"
    brand="Popli.one"
  >
    <section>
      <h2>1. Introduction</h2>
      <p>
        This Cookie Policy explains how <strong>Mihai-Bucur Bogdan Gabriel PFA</strong>, operating
        <strong>Popli.one</strong> (the <strong>“Operator”</strong>), uses
        cookies, local storage, session storage, pixel tags and similar
        technologies (together, <strong>“cookies”</strong>) when you visit or use
        our website and web application at
        <strong>https://popli.one</strong>. It should be read together with our
        <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>.
      </p>
      <p>
        Under Directive 2002/58/EC (ePrivacy) as implemented in Romania (Law No.
        506/2004 on processing personal data and privacy in the electronic
        communications sector) and supplemented by GDPR where personal data are
        involved, we must disclose categories, durations, controllers/processors,
        and obtain consent before storing or accessing non-essential cookies on
        your device—except strictly necessary exemptions.
      </p>
      <p>
        We are progressively wiring a granular consent-management tool; until
        that banner is uniformly deployed across all locales, please adjust
        preferences through browser controls and any interim controls we expose
        in-product.
      </p>
    </section>

    <section>
      <h2>2. What is a cookie?</h2>
      <p>
        A cookie is a small text file placed on your device which allows the
        Service to recognise your browser, maintain sessions, remember
        preferences, remember consent states, or—where permitted—support
        measurement and advertising.
      </p>
    </section>

    <section>
      <h2>3. Cookie categories we use</h2>

      <h3>3.1 Strictly necessary (lawful basis: provision of service / Art. 5(3)
        ePrivacy exemption)</h3>
      <p>
        These cookies are indispensable for secure authentication, load
        balancing, abuse prevention, or storing your language preference where
        essential. They do not require consent under European ePrivacy
        implementation, though you remain informed under transparency duties.
      </p>
      <table>
        <thead>
          <tr>
            <th>Name (illustrative)</th>
            <th>Purpose</th>
            <th>Typical duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>xt</code> (HttpOnly session)</td>
            <td>
              Authenticated session binding after sign-in; carries opaque
              session reference under server validation
            </td>
            <td>Short-lived (hours), renewed on activity</td>
          </tr>
          <tr>
            <td><code>xrt</code> (HttpOnly refresh)</td>
            <td>
              Secure refresh-token rotation for authentication continuity per
              security policy
            </td>
            <td>Up to 24 hours (per runtime configuration)</td>
          </tr>
          <tr>
            <td><code>i18n_redirected</code></td>
            <td>Remembers language choice to avoid redirect loops</td>
            <td>12 months (typical)</td>
          </tr>
        </tbody>
      </table>
      <p>
        Exact cookie names, flags (Secure, SameSite) and lifetimes may evolve;
        material security-hardening changes will be noted in release notes or
        policy updates.
      </p>

      <h3>3.2 Functional (optional – consent if not strictly necessary)</h3>
      <p>
        Features such as UI theme memorisation, dismissed tutorial flags, or
        non-essential layout preferences may rely on local storage; we only
        activate these where compatible with your expressed choices once the
        consent layer is active.
      </p>

      <h3>3.3 Analytics &amp; performance (consent except first-party
        diagnostics strictly necessary for security)</h3>
      <p>
        Popli’s own operational metrics may use first-party logs not stored on
        the client; we do <strong>not</strong> currently deploy third-party
        analytics pixels such as Google Analytics. Should that change, this
        Policy and the banner will be updated before activation in the EEA/UK.
      </p>

      <h3>3.4 Marketing / advertising — Google AdSense (consent)</h3>
      <p>
        We may display advertisements provided by <strong>Google AdSense</strong>
        (Google Ireland Limited / Google LLC). AdSense sets or reads identifiers
        to select and measure advertising, prevent fraud, cap frequency, and
        personalise ads after you grant consent where required.
      </p>
      <p>
        Google’s privacy notice is available at
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          >policies.google.com/privacy</a
        >. You may adjust ad personalisation via Google’s Ads Settings and
        industry opt-out portals (Your Online Choices).
      </p>
    </section>

    <section>
      <h2>4. How to refuse or withdraw consent</h2>
      <ul>
        <li>
          Browser settings: block third-party cookies, delete existing cookies,
          or enable “Do Not Track” (not uniformly honoured—use consent tools
          where available).
        </li>
        <li>
          Our forthcoming cookie banner will offer granular toggle per purpose
          category; withholding consent may limit monetised surfaces but core
          account features unrelated to ads should remain accessible.
        </li>
        <li>
          Google’s <em>Partners’ opt-out tools</em> for personalised advertising.
        </li>
      </ul>
      <p>
        Withdrawing consent does not affect the lawfulness of processing before
        withdrawal.
      </p>
    </section>

    <section>
      <h2>5. Data retention on the device</h2>
      <p>
        Session cookies expire when you close the browser (subject to SameSite
        and configuration). Persistent cookies persist until expiry or manual
        erasure—see table above for orders of magnitude.
      </p>
    </section>

    <section>
      <h2>6. Updates</h2>
      <p>
        We will amend this Cookie Policy when we add new technologies, partners
        or legal requirements. Material changes carry an updated effective date
        at the top and, where feasible, proactive notice via the Service.
      </p>
    </section>

    <section>
      <h2>7. Contact</h2>
      <p>
        Questions about cookies or similar technologies may be addressed to
        <a href="mailto:bogdan.mihaibucur.pfa@gmail.com"
          >bogdan.mihaibucur.pfa@gmail.com</a
        >.
      </p>
    </section>
  </LegalDocument>
</template>

<script setup lang="ts">
const { seo } = useAppConfig();

usePageSeo({
  title: seo.cookieTitle,
  description: seo.cookieDescription,
  path: '/cookie-policy',
  keywords:
    'Popli.one cookies, ePrivacy, consent, AdSense cookies, authentication cookies, GDPR',
  ogImage: seo.defaultOgImagePath,
  robots: 'index, follow',
});
</script>
