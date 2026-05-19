<script setup>
import { computed } from 'vue';
import TooltipContent from './TooltipContent.vue';

const props = defineProps({
	tooltipArray: {
		type: Array,
		default: () => [],
		required: true,
	},
	datasetTitle: {
		type: String,
		default: '',
	},
	primaryColor: {
		type: String,
		default: '#328725',
	},
	marker: {
		type: Object,
		default: () => ({}),
	},
});

const title = computed(
	() => props.tooltipArray.find(item => item.layout === 'title')?.title || props.datasetTitle
);

const images = computed(
	() => props.tooltipArray.filter(item => item.layout === 'image' && item.image_url)
);
</script>

<template>
	<div class="base-list-card">
		<div class="base-list-card__inner">
			<div class="base-list-card__content">
				<TooltipContent
					:tooltipArray="tooltipArray"
					classPrefix="base-list-card"
					:title="title"
					titleTag="h3"
					:marker="marker"
					:skipLayouts="['image']"
				/>
			</div>
		</div>
		<div class="base-list-card__image" v-if="images.length">
			<img
				v-for="(img, idx) in images"
				:key="idx"
				:src="img.image_url"
				:alt="img.image_alt || ''"
			/>
		</div>
	</div>
</template>

<style lang="scss">
.base-list-card {
	--image-size: 256px;

	background-color: #fff;
	border: 1px solid #cacaca;
	border-radius: 6px;
	display: flex;
	flex-direction: column-reverse;
	gap: 1rem;
	margin-block-end: 1rem;

	@media only screen and (min-width: 991px) {
		flex-direction: row;
	}

	.filters-open & {
		margin-inline-end: 1rem;
	}

	&__image {
		display: flex;
		flex: 0 0 var(--image-size);
		flex-direction: column;
		gap: .5rem;

		img {
      block-size: 100%;
			inline-size: 100%;
			object-fit: cover;
		}
	}

	&__inner {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: space-between;
		padding: 1.5rem;
		padding-inline-end: .5rem;
	}

	&__content {
		display: flex;
		flex-direction: column;
		gap: .5rem;
		margin-block-end: .5rem;
	}

	&__title {
		color: #001d5f;
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
	}

	&__meta {
		align-items: center;
		display: flex;
		gap: .5rem;
	}

	&__address {
		color: #4b4b4b;
		font-size: 14px;
	}

	&__text {
		color: #4b4b4b;
		font-weight: 400;
	}

	&__button {
		align-items: center;
		background-color: var(--owc-openkaarten-streetmap--primary-color);
		border-radius: 4px;
		color: white;
		display: inline-flex;
		gap: 8px;
		inline-size: fit-content;
		padding: 8px 16px;
		text-decoration: none;

		&:hover {
			opacity: 0.9;
		}
	}
}
</style>
