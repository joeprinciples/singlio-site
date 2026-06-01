<script setup lang="ts">
// Per-page canonical + og:url. Without this, the site-wide canonical in
// nuxt.config pointed every page at the homepage, telling Google each
// sub-page was a duplicate (GSC: "Alternate page with proper canonical tag").
// Trailing slash matches how GitHub Pages serves directory-style URLs.
const SITE_URL = "https://singl.io";
const route = useRoute();

const canonicalUrl = computed(() => {
  const path = route.path.endsWith("/") ? route.path : `${route.path}/`;
  return `${SITE_URL}${path}`;
});

useHead({
  link: [{ rel: "canonical", href: canonicalUrl }],
  meta: [{ property: "og:url", content: canonicalUrl }],
});
</script>

<template>
  <div class="relative flex min-h-screen flex-col text-zinc-100">
    <MeshGradient class="-z-10" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
