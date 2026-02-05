<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import BaseTooltipCardClose from './BaseTooltipCardClose.vue';
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
	id: Number,
	title: {
		type: String,
		default: '',
		required: true,
	},
	meta: {
		type: String,
		default: '',
	},
	button: {
		type: Object,
		default: null,
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
          <BaseIcon :marker="properties.marker" />
          <BaseTooltipCardClose
              :primaryColor="primaryColor"
              @closeCard="$emit('closeCard')"
          />
        </div>
        <h4 v-if="title" class="owc-openkaarten-streetmap__tooltip-card__title">
          {{ title }}
        </h4>
				<div v-if="meta" class="owc-openkaarten-streetmap__tooltip-card__meta">
					{{ meta }}
				</div>
				<a
					v-if="button"
					:href="button.button_url"
					class="owc-openkaarten-streetmap__tooltip-card__button"
				>
					<svg aria-hidden="true" width="20" height="21" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M10.243 4.91a.833.833 0 0 1 1.178 0l5 5a.833.833 0 0 1 0 1.18l-5 5a.833.833 0 0 1-1.178-1.18l3.577-3.577H4.165a.833.833 0 0 1 0-1.667h9.655L10.243 6.09a.833.833 0 0 1 0-1.178Z" fill="#fff"/>
					</svg>
					{{ button.button_text }} <span class="sr-only">over {{ title }}</span>
				</a>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
.owc-openkaarten-streetmap {
	&__tooltip-card {
		background-color: #fff;
		position: absolute;
		bottom: 24px;
		left: 50%;
		z-index: 400;
		inline-size: min(100%, 360px);
		border-radius: 4px;
    transform: translate(-50%, 0);

		&__wrapper {
			border-radius: 4px;
		}

		&__content {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
			padding: 16px;
		}

		@media only screen and (min-width: 768px) {
			left: auto;
			bottom: 24px;
			left: 16px;
      transform: translate(0);
		}

		&:focus {
			outline: none;
		}

		&__header {
      align-items: center;
			display: flex;
      gap: 24px;
			justify-content: space-between;
      width: 100%;
		}

		&__title {
			margin-block: 0;
			color: #001d5f;
			font-weight: bold;
		}

		&__list {
			width: 100%;
			list-style-type: none;
			text-align: left;
			padding-left: 0;
			margin-block: 0;

			li {
				width: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				font-size: 14px;

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
			width: 100%;
			height: 180px;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				border-top-left-radius: 4px;
				border-top-right-radius: 4px;
			}
		}

		&__button {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 8px 16px;
			background-color: var(--owc-openkaarten-streetmap--primary-color);
			color: white;
			text-decoration: none;
			border-radius: 4px;

			&:hover {
				opacity: 0.9;
			}
		}
	}
}
</style>
