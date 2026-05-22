<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import BaseTooltipCardClose from './BaseTooltipCardClose.vue';
import BaseIcon from './BaseIcon.vue';
import TooltipContent from './TooltipContent.vue';

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
				<TooltipContent
					:tooltipArray="tooltipArray"
					classPrefix="owc-openkaarten-streetmap__tooltip-card"
					:title="title"
					titleTag="h4"
				/>
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
      padding-inline-end: 2.75rem;
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
				object-fit: none;
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
