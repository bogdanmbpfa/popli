export default defineAppConfig({
  seo: {
    siteName: 'Popli.one',
    defaultOgImagePath: '/logo.png',
    /** Pixel size of default OG image (`/logo.png`); match deployed asset (source: `app/assets/images/logo.png`). */
    defaultOgImageWidth: 100,
    defaultOgImageHeight: 120,
    /** Official X/Twitter @handle for `twitter:site` (empty = omit meta). */
    twitterSite: '',
    /** Homepage & global fallback description (~155 chars for SERP snippets). */
    homeDescription:
      'Shorten URLs with analytics, build custom QR codes, and create a polished link-in-bio — the creator toolkit to share one link and grow your audience. Start free on Popli.one.',
    homeTitle: 'Popli.one — Link-in-bio, URL shortener & QR codes for creators',
    aboutTitle: 'About Popli | Redefining connectivity for the creator economy',
    aboutDescription:
      "Learn how Popli turns static links into dynamic bridges of engagement. Our origin story, core values — precision analytics, seamless connectivity, creative freedom — and vision for portable, measurable digital identity.",
    signInTitle: 'Sign in — Popli.one',
    signInDescription:
      'Sign in to manage your link-in-bio, short links, QR codes, and analytics on Popli.one.',
    signUpTitle: 'Create your free account — Popli.one',
    signUpDescription:
      'Join Popli.one to shorten links, generate QR codes, and publish a stunning link-in-bio. Free to start, no credit card required.',
    forgotPasswordTitle: 'Reset your password — Popli.one',
    forgotPasswordDescription:
      'Request a secure reset link for your Popli.one account. We will email you steps to choose a new password.',
    contactTitle: 'Contact — Popli.one',
    contactDescription:
      'Reach the Popli.one team regarding support, billing, technical issues, partnership, abuse reports, or privacy requests.',
    termsTitle: 'Terms of Service — Popli.one',
    termsDescription:
      'Legal terms governing your use of Popli.one (Mihai-Bucur Bogdan Gabriel PFA, Romania): acceptable use, paid plans, limitation of liability, and governing law.',
    privacyTitle: 'Privacy Policy — Popli.one',
    privacyDescription:
      'GDPR-aligned privacy disclosure for Mihai-Bucur Bogdan Gabriel PFA (Popli.one): data processed, lawful bases, subprocessors Stripe, Brevo, Cloudflare R2, AdSense, Mapbox.',
    cookieTitle: 'Cookie Policy — Popli.one',
    cookieDescription:
      'Cookies and similar technologies used on Popli.one: authentication, language preference, consent, and Google AdSense where permitted.',
  },
});
