<template>
  <LegalDocument
    title="Privacy Policy"
    effective-date="10 May 2026"
    brand="Popli.one"
  >
    <section>
      <h2>1. Who is responsible?</h2>
      <p>
        The controller of personal data collected through Popli.one (the
        <strong>“Service”</strong>) is:
      </p>
      <p>
        <strong>Mihai-Bucur Bogdan Gabriel PFA</strong><br />
        Trading as <strong>Popli.one</strong><br />
        Address: Romania, Ilfov County, Roșu Village, Building no. 3, 4th
        Floor, Apartment 70<br />
        VAT ID: RO52942221<br />
        Email:
        <a href="mailto:bogdan.mihaibucur.pfa@gmail.com"
          >bogdan.mihaibucur.pfa@gmail.com</a
        ><br />
        We have <strong>not</strong> appointed a Data Protection Officer;
        supervisory guidance may nevertheless require designation as activities
        scale—this Policy will be updated accordingly.
      </p>
      <p>
        You may contact us at the email above concerning privacy enquiries,
        access or erasure requests, objections, portability, restriction, or to
        withdraw consent where consent is relied upon.
      </p>
    </section>

    <section>
      <h2>2. Scope and applicability</h2>
      <p>
        This Policy explains how we process personal data relating to visitors,
        account holders and other natural persons interacting with the Service,
        pursuant to Regulation (EU) 2016/679 (the <strong>“GDPR”</strong>),
        Romanian Law No. 190/2018 implementing GDPR, alongside ePrivacy
        requirements as complemented by Directive 2002/58/EC where transposed,
        Commission Implementing Decision (EU) 2021/914 on standard contractual
        clauses (<strong>“SCCs”</strong>), and complementary national statutes.
      </p>
      <p>
        This Policy does not address processing by third-party websites linked
        from user-generated profiles; their privacy notices apply.
      </p>
    </section>

    <section>
      <h2>3. Categories of data, purposes and legal bases</h2>
      <p>
        We process personal data only where a legal basis under Article 6(1)
        GDPR exists. The table below summarises typical processing. Where
        several bases could apply, we indicate the primary one.
      </p>
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Typical data</th>
            <th>Purpose</th>
            <th>Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account registration &amp; authentication</td>
            <td>
              Email address, salted password verifier, pseudonymous handle,
              session tokens tied to identifiers, timestamps, audit logs,
              optional profile media and links
            </td>
            <td>
              Provision of the contractual Service, credential recovery,
              security monitoring
            </td>
            <td>
              Article 6(1)(b) GDPR (performance of contract); Article 6(1)(f)
              (fraud/abuse defence, integrity of the Service)
            </td>
          </tr>
          <tr>
            <td>Payments &amp; invoicing</td>
            <td>
              Name or company, billing particulars, transactional metadata,
              tax identifiers legally required on invoices when issued
            </td>
            <td>
              Process payments, fulfil tax/bookkeeping obligations, respond to
              chargebacks within statutory limits
            </td>
            <td>
              Article 6(1)(b) GDPR; Article 6(1)(c) GDPR (tax compliance); Article
              9 generally not invoked except where incidental health data arises
              in abuse reports (then Articles 9(2)(f) or public interest/defence
              as applicable)
            </td>
          </tr>
          <tr>
            <td>Transactional &amp; product email</td>
            <td>
              Email address, template identifiers, delivery status, preference
              flags
            </td>
            <td>
              Service messaging (security alerts, receipts,
              passwordless/verification flows)
            </td>
            <td>
              Article 6(1)(b) where necessary for the contract; Article 6(1)(f)
              for essential service notices; where marketing is sent on a
              consent model, Article 6(1)(a)
            </td>
          </tr>
          <tr>
            <td>Analytics for short links &amp; profiles</td>
            <td>
              Pseudonymised click logs (timestamps, referring page,
              approximate geography derived from IP with truncation,
              user-agent classifications, hashed IP where implemented)
            </td>
            <td>
              Showing dashboards, abuse detection, capacity planning—never sold
              as standalone “profiles” unrelated to legitimate Service operation
            </td>
            <td>
              Article 6(1)(f) (balanced against data-minimisation and retention
              limits); contractual necessity Article 6(1)(b) for features
              expressly purchased
            </td>
          </tr>
          <tr>
            <td>Maps &amp; geo visualisation</td>
            <td>
              Aggregated or coarse location inputs (e.g. viewport or city-level
              clusters)
            </td>
            <td>Rendering heatmaps or cluster visualisations in dashboard</td>
            <td>Article 6(1)(b) or (f) depending on feature packaging</td>
          </tr>
          <tr>
            <td>Cookie / AdSense personalisation (where enabled)</td>
            <td>
              Identifiers set by Google, consent strings, limited technical logs
            </td>
            <td>
              Funding the Service through advertising as permitted after consent
            </td>
            <td>
              Article 6(1)(a) GDPR for non-essential cookies; ePrivacy
              consent requirements
            </td>
          </tr>
          <tr>
            <td>Support &amp; legal compliance</td>
            <td>
              Correspondence, attachments, identifiers needed to investigate
            </td>
            <td>Answering requests, defending legal claims, regulatory audit</td>
            <td>Article 6(1)(c) and (f) as applicable</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>4. Children</h2>
      <p>
        The Service is not directed at children; we do not knowingly seek
        personal data from minors. If you believe a child has disclosed data
        improperly, notify us—we will delete or anonymise promptly where lawful
        grounds exist.
      </p>
    </section>

    <section>
      <h2>5. Automated decision-making</h2>
      <p>
        We do not make decisions producing legal effects concerning you solely
        by automated means within Article 22 GDPR. Some security heuristics may
        flag accounts for human review.
      </p>
    </section>

    <section>
      <h2>6. Recipients and subprocessors</h2>
      <p>
        We engage vetted service providers acting on documented instructions
        (Article 28 GDPR) or as independent controllers where their terms so
        provide. Current categories include:
      </p>
      <ul>
        <li>
          <strong>Stripe Technology Europe Ltd / Stripe affiliates</strong>
          – payment acquiring, fraud signals, customer portal for billing
          artefacts.
        </li>
        <li>
          <strong>Brevo (Sendinblue SAS)</strong> – SMTP/API email delivery and
          marketing automation infrastructure if enabled.
        </li>
        <li>
          <strong>Cloudflare, Inc.</strong> (and/or affiliates) –
          CDN/WAF/security; <strong>Cloudflare R2</strong> object storage for
          certain user-uploaded media and static assets subject to encryption in
          transit and access policies.
        </li>
        <li>
          <strong>Google Ireland Ltd / Google LLC</strong> –
          <strong>Google AdSense</strong> advertising; possible use of Google
          infrastructure where applicable under their processor or joint
          controller statements.
        </li>
        <li>
          <strong>Mapbox, Inc.</strong> – map tile delivery and geospatial
          rendering for analytics visualisations.
        </li>
        <li>
          Hosting and database providers necessary to run the platform (may
          include EU and non-EU regions—see Section 7).
        </li>
      </ul>
      <p>
        A more granular subprocessor list may be provided on request or by
        publication in the account area; material changes will be announced with
        reasonable advance notice where practicable.
      </p>
    </section>

    <section>
      <h2>7. International transfers</h2>
      <p>
        Personal data are primarily processed within the European Economic Area
        (<strong>“EEA”</strong>). Where a processor stores or accesses data from
        outside the EEA, we rely on mechanisms recognised by Chapter V GDPR,
        such as Commission adequacy decisions, SCCs (including the 2021
        modules), supplementary technical and organisational measures (including
        encryption in transit, access restrictions, and data-minimisation), and
        UK international data transfer agreements where relevant.
      </p>
      <p>
        You may request a summary of transfer mechanisms by emailing the
        address in Section 1.
      </p>
    </section>

    <section>
      <h2>8. Retention</h2>
      <p>
        We retain data no longer than necessary for the purposes above and
        legal obligations. Illustrative defaults (subject to overriding law or
        litigation holds):
      </p>
      <ul>
        <li>
          Account data: duration of account plus statutory limitation /
          bookkeeping periods (Romanian law commonly requires accounting
          substantiation up to ten years where invoices exist).
        </li>
        <li>
          Security logs: rolling window adapted to threat environment, usually
          not exceeding twenty-four months unless needed for investigations.
        </li>
        <li>
          Clickstream analytics: aggregated long term; raw event rows minimised,
          truncated, or hashed with shorter retention consistent with Dashboard
          utility.
        </li>
      </ul>
    </section>

    <section>
      <h2>9. Security</h2>
      <p>
        We implement technical and organisational measures appropriate to the
        risk: TLS encryption, httpOnly session cookies for authentication,
        least-privilege access, pseudonymisation where feasible, incident
        response procedures, and vendor due diligence. Absolute security cannot
        be guaranteed; report suspected incidents promptly.
      </p>
    </section>

    <section>
      <h2>10. Your rights</h2>
      <p>
        Subject to conditions and exceptions in Articles 12–23 GDPR, you may
        request:
      </p>
      <ul>
        <li>Access (Article 15)</li>
        <li>Rectification (Article 16)</li>
        <li>Erasure (“right to be forgotten”, Article 17)</li>
        <li>Restriction (Article 18)</li>
        <li>Data portability (Article 20)</li>
        <li>Object to processing based on legitimate interests (Article 21)</li>
        <li>Withdraw consent without affecting earlier lawful processing where
          consent formed the sole basis</li>
      </ul>
      <p>
        To exercise rights, email
        <a href="mailto:bogdan.mihaibucur.pfa@gmail.com"
          >bogdan.mihaibucur.pfa@gmail.com</a
        >. We verify identity reasonably; undue repetitive requests may incur a
        fee where GDPR permits (Article 12(5)).
      </p>
      <p>
        You may lodge a complaint with the Romanian Data Protection Authority
        (<strong>
          Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter
          Personal —
          <a
            href="https://www.dataprotection.ro/"
            target="_blank"
            rel="noopener noreferrer"
            >ANSPDCP</a
          > </strong
        >) or, if you reside in another EU Member State, with your local
        supervisory authority.
      </p>
    </section>

    <section>
      <h2>11. Cookies and similar technologies</h2>
      <p>
        Detailed classifications, durations, purposes, and management options
        are set out in our
        <NuxtLink to="/cookie-policy">Cookie Policy</NuxtLink>, which supplements
        this Policy.
      </p>
    </section>

    <section>
      <h2>12. Updates</h2>
      <p>
        Material changes trigger notice through the Service and/or registered
        email; archive versions are available upon request to evidence
        compliance posture at a given period.
      </p>
    </section>
  </LegalDocument>
</template>

<script setup lang="ts">
const { seo } = useAppConfig();

usePageSeo({
  title: seo.privacyTitle,
  description: seo.privacyDescription,
  path: '/privacy-policy',
  keywords:
    'Popli.one privacy policy, GDPR, data controller, Romanian DPA ANSPDCP, creator analytics, personal data',
  ogImage: seo.defaultOgImagePath,
  robots: 'index, follow',
});
</script>
