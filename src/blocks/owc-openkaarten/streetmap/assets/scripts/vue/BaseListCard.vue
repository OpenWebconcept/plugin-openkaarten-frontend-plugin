<script setup>
defineProps({
	title: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		default: '',
	},
	description: {
		type: String,
		default: '',
	},
	image: {
		type: String,
		default: '',
	},
	primaryColor: {
		type: String,
		default: '#328725',
	},
});
</script>

<template>
	<div class="base-list-card">
		<div class="base-list-card__content">
			<div>
				<h3 class="base-list-card__title">{{ title }}</h3>
				<p class="base-list-card__address" v-if="address">{{ address }}</p>
				<p class="base-list-card__description" v-if="description">{{ description }}</p>
			</div>
			<slot name="footer"></slot>
		</div>
		<div class="base-list-card__image" v-if="image">
			<img :src="image" :alt="title" />
		</div>
	</div>
</template>

<style lang="scss">
.base-list-card {
	--image-size: 256px;

	display: flex;
	gap: 1rem;
	border: 1px solid #cacaca;
	border-radius: 6px;

	&__image {
		flex: 0 0 var(--image-size);
		aspect-ratio: 1 / 1;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	&__content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		flex: 1;
		padding: 2rem;
	}

	&__title {
		margin: 0;
		color: #001d5f;
		font-size: 1.5rem;
		font-weight: bold;
	}

	&__address {
		font-size: 14px;
		color: #4b4b4b
	}

	&__description {
		color: #4b4b4b;
		font-weight: 400;
	}

	&__button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-block-start: 2rem;
		color: #1161a3;
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}
}
</style>
