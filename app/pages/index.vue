<template>
  <div>
    <!-- Hero -->
    <div class="relative isolate pt-14">
      <div
        class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-10 lg:px-8 lg:py-40"
      >
        <div class="mx-auto max-w-2xl lg:mx-0 lg:col-span-6">
          <h1
            class="mt-10 text-4xl leading-tight font-bold tracking-tight text-white sm:text-7xl"
          >
            Train your focus, one session at a time
          </h1>
          <p
            class="mt-8 max-w-2xl text-lg/7 font-regular text-pretty text-white/80 sm:text-2xl/9"
          >
            Singlio helps you understand and improve your focus. Start a session,
            tap when you get distracted, and get a detailed score showing exactly
            where your attention held and where it slipped.
          </p>
        </div>
        <div class="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
          <img
            src="/hero-phone.png"
            alt="Singlio app screenshot"
            class="mx-auto w-full max-w-md drop-shadow-xl"
            decoding="async"
            fetchpriority="high"
          />
        </div>
      </div>
    </div>

    <!-- Features -->
    <section
      id="features"
      class="py-24 sm:py-32"
      v-scroll-reveal
    >
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="max-w-lg grid gap-4 mb-16">
          <h2
            class="text-pretty text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Features
          </h2>
          <p
            class="max-w-2xl text-lg font-regular text-pretty text-white/80 sm:text-2xl/9"
          >
            Simple by design. Powerful in practice.
          </p>
        </div>
        <div class="mx-auto max-w-2xl lg:max-w-none">
          <dl
            class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16"
          >
            <div
              v-for="feature in features"
              :key="feature.name"
              class="relative pl-16"
            >
              <dt class="text-base/7 font-bold text-white sm:text-lg/7">
                <div
                  class="absolute left-0 top-0 flex size-10 items-center justify-center rounded-lg bg-black"
                >
                  <component
                    :is="feature.icon"
                    class="size-6 text-teal-400"
                    aria-hidden="true"
                  />
                </div>
                {{ feature.name }}
              </dt>
              <dd class="mt-2 text-base/7 text-white/80 sm:text-lg/7">
                {{ feature.description }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- Screenshots -->
    <section
      id="screenshots"
      class="py-24 sm:py-32 overflow-hidden"
      v-scroll-reveal
    >
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <AppScreenshotSlider />
      </div>
    </section>

    <!-- FAQ -->
    <section
      id="faq"
      class="py-24 sm:py-32"
      v-scroll-reveal
    >
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-4xl">
          <h2
            class="text-pretty text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Frequently asked questions
          </h2>
          <dl class="mt-16 divide-y divide-white/10">
            <div
              v-for="(faq, index) in faqs"
              :key="faq.question"
              class="py-8 first:pt-0 last:pb-0"
            >
              <dt>
                <button
                  class="flex w-full items-start justify-between text-left text-white"
                  @click="toggleFaq(index)"
                >
                  <span class="text-lg font-bold sm:text-xl">{{
                    faq.question
                  }}</span>
                  <span class="ml-6 flex h-7 items-center">
                    <Plus
                      v-if="openFaq !== index"
                      class="size-6"
                      aria-hidden="true"
                    />
                    <Minus v-else class="size-6" aria-hidden="true" />
                  </span>
                </button>
              </dt>
              <dd v-if="openFaq === index" class="mt-4 pr-12">
                <p class="text-base/7 text-white/80 sm:text-lg/8">{{ faq.answer }}</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  Focus,
  BarChart3,
  Zap,
  Brain,
  BookOpen,
  Bell,
  Plus,
  Minus,
} from "lucide-vue-next";

useHead({
  title: "Singlio — Focus Training App",
});

const openFaq = ref(0);

function toggleFaq(index) {
  openFaq.value = openFaq.value === index ? -1 : index;
}

const features = [
  {
    name: "Focus Sessions",
    description:
      "Set a task, pick a duration, and focus. Tap the screen whenever you notice a distraction — Singlio tracks every interruption.",
    icon: Focus,
  },
  {
    name: "Smart Scoring",
    description:
      "Your score isn't just a tap count. It factors in distraction clusters, recovery time, consistency, and your longest uninterrupted streak.",
    icon: BarChart3,
  },
  {
    name: "Flow State Detection",
    description:
      "Singlio detects when you enter flow — from 10-minute entry-level focus to 23+ minute deep flow — and rewards you for it.",
    icon: Zap,
  },
  {
    name: "Brain Training",
    description:
      "Sharpen your working memory with the built-in memory game across three difficulty levels.",
    icon: Brain,
  },
  {
    name: "Learn & Improve",
    description:
      "Read curated articles on focus science, flow states, building habits, and managing distractions.",
    icon: BookOpen,
  },
  {
    name: "Tasks & Reminders",
    description:
      "Save recurring tasks and set reminders so you never miss your focus practice.",
    icon: Bell,
  },
];

const faqs = [
  {
    question: "What is Singlio?",
    answer:
      "Singlio is a focus training app that helps you understand and improve your attention. Start a session, tap the screen when you get distracted, and get a detailed focus score showing where your attention held and where it slipped.",
  },
  {
    question: "How does the scoring work?",
    answer:
      "Your focus score (0-100) is calculated using a multi-factor algorithm that considers distraction clusters, recovery time between interruptions, flow state bonuses, consistency, and your longest uninterrupted streak. It's not just a count of taps — it understands the shape of your focus.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. All your data stays on your device. Singlio has no accounts, no servers, and no tracking. You can delete everything at any time from within the app.",
  },
  {
    question: "Is Singlio free?",
    answer:
      "Singlio is free on Android. The iOS version is available as a one-time purchase.",
  },
  {
    question: "Does Singlio work offline?",
    answer:
      "Yes. Singlio works entirely offline. No internet connection is needed to run sessions, track progress, or view your history.",
  },
  {
    question: "What are flow states?",
    answer:
      "Flow states are periods of deep, uninterrupted focus. Singlio detects three tiers: Entry flow (10+ minutes uninterrupted), Sustained flow (15+ minutes), and Deep flow (23+ minutes). Each tier earns increasing bonus points on your score.",
  },
];
</script>
