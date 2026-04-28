<script setup>
import { gsap } from 'gsap'
import { useHome } from '../composables/useHome.js'

const { notifications } = useHome()

const noticeEnter = (el, done) => {
  gsap.fromTo(el,
    { x: 40, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: done },
  )
}

const noticeLeave = (el, done) => {
  gsap.to(el, { x: 40, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: done })
}
</script>

<template>
  <div class="notifications">
    <TransitionGroup :css="false" @enter="noticeEnter" @leave="noticeLeave">
      <article
        v-for="notice in notifications"
        :key="notice.id"
        class="notice"
        :class="notice.type"
      >
        {{ notice.text }}
      </article>
    </TransitionGroup>
  </div>
</template>
