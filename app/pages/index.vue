<template>
  <div class="home">
    <LandingHero />

    <LandingFeatures />

    <LandingPricing />

    <div v-if="canShowAds" class="ad-section">
      <ins
        class="adsbygoogle"
        style="display: block; width: 100%; height: 100%"
        :data-ad-client="googleAdsense.test === 'on' ? 'ca-google-test' : googleAdsense.id"
        :data-ad-slot="googleAdsense.adSlot"
        :data-adtest="googleAdsense.test === 'on' ? 'on' : undefined"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint, EPlanType } from '~~/enums';

const { seo } = useAppConfig();
const {
  public: { googleAdsense },
} = useRuntimeConfig();

const { data: meForAds } = await useAsyncData(
  'popli-home-ads-me',
  () => useApiJson(EApiEndpoint.ACCOUNT_ME),
  {
    transform: (data) => data.data ?? null,
  },
);

const showAd = computed(
  () => !meForAds.value || meForAds.value.plan !== EPlanType.PRO,
);

const cookieControl = useCookieControl();
const canShowAds = computed(
  () =>
    showAd.value &&
    (cookieControl.cookiesEnabledIds.value ?? []).includes('google-adsense'),
);

useHead(() => {
  return {
    // script: canShowAds.value
    // TODO: Remove this after Google AdSense is enabled
    script: true
      ? [
          {
            key: 'popli-adsense-loader',
            tagPosition: 'bodyClose',
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsense.id}`,
            async: true,
            crossorigin: 'anonymous',
            ...(googleAdsense.test === 'on' ? { 'data-adtest': 'on' } : {}),
          },
          {
            key: 'popli-adsense-push',
            tagPosition: 'bodyClose',
            innerHTML: '(adsbygoogle = window.adsbygoogle || []).push({});',
          },
        ]
      : [],
  };
});

usePageSeo({
  title: seo.homeTitle,
  description: seo.homeDescription,
  path: '/',
  keywords: seo.homeKeywords,
  ogImage: seo.defaultOgImagePath,
  robots: 'index, follow',
});
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  .ad-section {
    width: 100%;
    max-width: 60rem;
    padding: 2rem 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
