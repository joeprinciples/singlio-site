<template>
  <header class="absolute inset-x-0 top-0 z-50">
    <nav
      class="flex items-center justify-between p-6 lg:px-8"
      aria-label="Global"
    >
      <div class="flex lg:flex-1">
        <a href="#" class="-m-1.5 p-1.5 flex items-center gap-3">
          <img
            class="h-9 w-auto rounded-xl"
            src="/singlio-icon.png"
            alt="Singlio"
          />
          <span class="text-2xl font-extrabold tracking-tight text-white">
            singlio.
          </span>
        </a>
      </div>
      <div class="flex lg:hidden">
        <button
          type="button"
          class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
          @click="mobileMenuOpen = true"
        >
          <span class="sr-only">Open main menu</span>
          <Menu class="size-6" aria-hidden="true" />
        </button>
      </div>
      <div class="hidden lg:flex lg:gap-x-12">
        <a
          v-for="item in navigation"
          :key="item.name"
          :href="item.href"
          class="text-sm/6 font-semibold text-white hover:text-teal-400 transition"
        >{{ item.name }}</a>
      </div>
    </nav>

    <!-- Mobile menu -->
    <Teleport to="body">
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 lg:hidden">
        <div class="fixed inset-0 bg-black/50" @click="mobileMenuOpen = false" />
        <div
          class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#0e0d17] p-6 sm:max-w-sm sm:ring-1 sm:ring-white/10"
        >
          <div class="flex items-center justify-between">
            <a href="#" class="-m-1.5 p-1.5 flex items-center gap-3">
              <img
                class="h-9 w-auto rounded-xl"
                src="/singlio-icon.png"
                alt="Singlio"
              />
              <span class="text-2xl font-extrabold tracking-tight text-white">
                singlio.
              </span>
            </a>
            <button
              type="button"
              class="-m-2.5 rounded-md p-2.5 text-gray-200"
              @click="mobileMenuOpen = false"
            >
              <span class="sr-only">Close menu</span>
              <X class="size-6" aria-hidden="true" />
            </button>
          </div>
          <div class="mt-6 flow-root">
            <div class="-my-6 divide-y divide-white/10">
              <div class="space-y-2 py-6">
                <a
                  v-for="item in navigation"
                  :key="item.name"
                  :href="item.href"
                  class="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                  @click="mobileMenuOpen = false"
                >{{ item.name }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup>
import { Menu, X } from "lucide-vue-next";

const navigation = [
  { name: "Features", href: "#features" },
  { name: "Screenshots", href: "#screenshots" },
  { name: "FAQ", href: "#faq" },
];

const mobileMenuOpen = ref(false);
</script>
