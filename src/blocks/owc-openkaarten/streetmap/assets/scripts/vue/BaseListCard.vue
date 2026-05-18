<script setup>
import { computed } from 'vue';
import BaseIcon from "./BaseIcon.vue";

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
				<template v-for="(item, index) in tooltipArray" :key="index">
					<h3
						v-if="item.layout === 'title' && item.title"
						class="base-list-card__title"
					>
						{{ item.title }}
					</h3>
					<div
						v-else-if="item.layout === 'meta' && item.meta"
						class="base-list-card__meta"
					>
						<BaseIcon :marker="marker" />
						<p class="base-list-card__address">{{ item.meta }}</p>
					</div>
					<p
						v-else-if="item.layout === 'text' && item.text"
						class="base-list-card__description"
						v-html="item.text"
					/>
					<a
						v-else-if="item.layout === 'button' && item.button_url"
						:href="item.button_url"
						class="base-list-card__button"
					>
						<svg aria-hidden="true" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M10.243 4.41a.833.833 0 0 1 1.178 0l5 5a.833.833 0 0 1 0 1.18l-5 5a.833.833 0 0 1-1.178-1.18l3.577-3.577H4.165a.833.833 0 0 1 0-1.667h9.655L10.243 5.59a.833.833 0 0 1 0-1.178Z" fill="#fff"/>
						</svg>
						{{ item.button_text }}
						<span class="sr-only">over {{ title }}</span>
					</a>
				</template>
			</div>
		</div>
		<div class="base-list-card__image" v-if="images.length">
			<img
				v-for="(img, idx) in images"
				:key="idx"
				:src="img.image_url"
				:alt="img.image_alt || title"
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

	@media only screen and (min-width: 768px) {
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
			aspect-ratio: 1 / 1;
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

	&__description {
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
