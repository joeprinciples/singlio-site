<template>
  <footer class="sm:mt-32 flex-none">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="pb-16 pt-10">
        <div
          class="flex flex-col items-center justify-between gap-2 md:flex-row"
        >
          <p class="text-sm text-white/60">
            &copy; {{ new Date().getFullYear() }} First Principles Studio Ltd.
            All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <NuxtLink
              to="/privacy"
              class="text-sm text-white/60 hover:text-white transition"
            >
              Privacy Policy
            </NuxtLink>
            <a
              href="https://principles.studio"
              class="text-sm text-white/60 hover:text-white transition"
              target="_blank"
            >
              principles.studio
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
