<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import BaseTooltipCardClose from './BaseTooltipCardClose.vue';
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
	id: Number,
	tooltipArray: {
		type: Array,
		default: () => [],
		required: true,
	},
	properties: {
		type: Object,
		default: () => ({}),
	},
	primaryColor: {
		type: String,
		required: true,
	},
});

const title = computed(
	() => props.tooltipArray.find(item => item.layout === 'title')?.title || props.properties?.title || ''
);

const emit = defineEmits(['closeCard']);

const handleFocus = (el) => {
	if (el) {
		el.focus();
		const handleKeydown = ({ key }) => {
			if (key === 'Escape') {
				emit('closeCard');
			}
		};
		document.addEventListener('keydown', handleKeydown);
		onUnmounted(() => {
			document.removeEventListener('keydown', handleKeydown);
		});
	}
};

onMounted(() => {
	handleFocus(document.querySelector('.owc-openkaarten-streetmap__tooltip-card'));
});
</script>

<template>
	<div
		:key="id"
		:ref="handleFocus"
		class="owc-openkaarten-streetmap__tooltip-card"
		tabindex="0"
	>
		<div class="owc-openkaarten-streetmap__tooltip-card__wrapper">
			<div class="owc-openkaarten-streetmap__tooltip-card__content">
        <div class="owc-openkaarten-streetmap__tooltip-card__header">
          <BaseIcon v-if="properties.marker.icon" :marker="properties.marker" />
          <BaseTooltipCardClose
              :primaryColor="primaryColor"
              @closeCard="$emit('closeCard')"
          />
        </div>
				<template v-for="(item, index) in tooltipArray" :key="index">
					<h4
						v-if="item.layout === 'title' && item.title"
						class="owc-openkaarten-streetmap__tooltip-card__title"
					>
						{{ item.title }}
					</h4>
					<div
						v-else-if="item.layout === 'meta' && item.meta"
						class="owc-openkaarten-streetmap__tooltip-card__meta"
					>
						{{ item.meta }}
					</div>
					<div
						v-else-if="item.layout === 'text' && item.text"
						class="owc-openkaarten-streetmap__tooltip-card__text"
						v-html="item.text"
					/>
					<div
						v-else-if="item.layout === 'image' && item.image_url"
						class="owc-openkaarten-streetmap__tooltip-card__image"
					>
						<img :src="item.image_url" :alt="item.image_alt || ''" />
					</div>
					<a
						v-else-if="item.layout === 'button' && item.button_url"
						:href="item.button_url"
						class="owc-openkaarten-streetmap__tooltip-card__button"
					>
						<svg aria-hidden="true" width="20" height="21" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M10.243 4.91a.833.833 0 0 1 1.178 0l5 5a.833.833 0 0 1 0 1.18l-5 5a.833.833 0 0 1-1.178-1.18l3.577-3.577H4.165a.833.833 0 0 1 0-1.667h9.655L10.243 6.09a.833.833 0 0 1 0-1.178Z" fill="#fff"/>
						</svg>
						{{ item.button_text }} <span class="sr-only">over {{ title }}</span>
					</a>
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
.owc-openkaarten-streetmap {
	&__tooltip-card {
		background-color: #fff;
    border-radius: 4px;
		inline-size: min(100%, 360px);
		inset-block-end: 24px;
    inset-inline-start: 50%;
    position: absolute;
    transform: translate(-50%, 0);
    z-index: 9999;

		@media only screen and (min-width: 768px) {
      inset-block-end: 24px;
			inset-inline-start: 16px;
      transform: translate(0);
		}

		&:focus {
			outline: none;
		}

		&__wrapper {
			border-radius: 4px;
		}

		&__content {
      align-items: flex-start;
			display: flex;
			flex-direction: column;
			gap: 8px;
			padding: 16px;
		}

		&__header {
      align-items: center;
			display: flex;
      gap: 24px;
      inline-size: 100%;
			justify-content: space-between;
		}

		&__title {
			color: #001d5f;
			font-weight: bold;
      margin-block: 0;
		}

		&__list {
      inline-size: 100%;
			list-style-type: none;
			margin-block: 0;
      padding-inline-start: 0;
      text-align: start;

			li {
				display: flex;
				flex-direction: column;
				font-size: 14px;
        inline-size: 100%;
        justify-content: space-between;

		@media only screen and (min-width: 500px) {
			flex-direction: row;
			gap: 24px;
		}

					:first-child {
						font-weight: bold;
					}
			}
		}

		&__meta {
			color: #666;
			font-size: 14px;
		}

		&__image {
			block-size: 180px;
      inline-size: 100%;

			img {
        block-size: 100%;
				border-start-end-radius: 4px;
				border-start-start-radius: 4px;
        inline-size: 100%;
        object-fit: cover;
			}
		}

		&__button {
      align-items: center;
      background-color: var(--owc-openkaarten-streetmap--primary-color);
      border-radius: 4px;
      color: white;
			display: inline-flex;
			gap: 8px;
			padding: 8px 16px;
			text-decoration: none;

			&:hover {
				opacity: 0.9;
			}
		}
	}
}
</style>
