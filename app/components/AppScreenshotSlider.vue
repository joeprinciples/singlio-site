<template>
  <div class="overflow-visible">
    <div ref="sliderRef" class="keen-slider" style="overflow: visible;">
      <div
        v-for="img in images"
        :key="img"
        class="keen-slider__slide"
        style="min-width: 320px; max-width: 380px;"
      >
        <img
          :src="img"
          :alt="`Singlio app screenshot`"
          class="w-full rounded-3xl shadow-2xl"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import KeenSlider from "keen-slider";
import "keen-slider/keen-slider.min.css";

const images = [
  "/screenshots/1.jpeg",
  "/screenshots/2.jpeg",
  "/screenshots/3.jpeg",
  "/screenshots/4.jpeg",
  "/screenshots/5.jpeg",
  "/screenshots/5b.jpeg",
  "/screenshots/6.jpeg",
  "/screenshots/8.jpeg",
  "/screenshots/9.jpeg",
  "/screenshots/10.jpeg",
];

const sliderRef = ref(null);
let slider = null;

onMounted(() => {
  if (sliderRef.value) {
    slider = new KeenSlider(sliderRef.value, {
      loop: false,
      mode: "free-snap",
      slides: {
        perView: "auto",
        spacing: 48,
      },
      drag: true,
    });
  }
});

onBeforeUnmount(() => {
  if (slider) slider.destroy();
});
</script>
