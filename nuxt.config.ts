import { useProductSchema } from "./app/composables/useSchema";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/sitemap"],
  site: {
    url: "https://singl.io",
  },
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },
  ssr: true,
  nitro: {
    preset: "static",
  },
  app: {
    head: {
      title: "Singlio — Focus Training App",
      htmlAttrs: {
        lang: "en",
        class: "dark",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Singlio helps you understand and improve your focus. Track distractions, detect flow states, and build better habits — one session at a time.",
        },
        {
          property: "og:title",
          content: "Singlio — Focus Training App",
        },
        {
          property: "og:description",
          content:
            "Track distractions, detect flow states, and build better focus habits — one session at a time.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://singl.io" },
        { property: "og:locale", content: "en_GB" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Singlio — Focus Training App",
        },
        {
          name: "twitter:description",
          content:
            "Track distractions, detect flow states, and build better focus habits — one session at a time.",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/singlio-icon.png",
        },
        {
          rel: "canonical",
          href: "https://singl.io",
        },
      ],
      script: [
        {
          src: "https://cloud.umami.is/script.js",
          defer: true,
          "data-website-id": "452e0dde-bd80-4581-b762-57986ce374f7",
        },
        useProductSchema({
          name: "Singlio",
          description:
            "Focus training app that helps you understand and improve your focus through distraction tracking, flow state detection, and session scoring.",
          applicationCategory: "HealthApplication",
          operatingSystem: "Android, iOS",
          availability: "https://schema.org/InStock",
          faqs: [
            { question: "What is Singlio?", answer: "Singlio is a focus training app that helps you understand and improve your attention. Start a session, tap the screen when you get distracted, and get a detailed focus score." },
            { question: "How does the scoring work?", answer: "Your focus score (0-100) is calculated using a multi-factor algorithm that considers distraction clusters, recovery time between interruptions, flow state bonuses, consistency, and your longest uninterrupted streak." },
            { question: "Is my data private?", answer: "Yes. All your data stays on your device. Singlio has no accounts, no servers, and no tracking. You can delete everything at any time from within the app." },
            { question: "Is Singlio free?", answer: "Singlio is free on Android. The iOS version is available as a one-time purchase." },
            { question: "Does Singlio work offline?", answer: "Yes. Singlio works entirely offline. No internet connection is needed to run sessions, track progress, or view your history." },
            { question: "What are flow states?", answer: "Flow states are periods of deep, uninterrupted focus. Singlio detects three tiers: Entry flow (10+ minutes), Sustained flow (15+ minutes), and Deep flow (23+ minutes), and rewards you with bonus points." },
          ],
        }),
      ],
    },
  },
});
