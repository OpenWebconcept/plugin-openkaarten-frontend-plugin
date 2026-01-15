<script setup>
import BaseIcon from "./BaseIcon.vue";

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
  marker: {
    type: Object,
    default: () => ({}),
  }
});
</script>

<template>
	<div class="base-list-card">
		<div class="base-list-card__inner">
			<div class="base-list-card__content">
				<h3 class="base-list-card__title">{{ title }}</h3>
        <div class="base-list-card__meta">
          <BaseIcon :marker="marker" />
          <p class="base-list-card__address" v-if="address">{{ address }}</p>
        </div>
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

  background-color: #fff;
	display: flex;
	gap: 1rem;
	border: 1px solid #cacaca;
	border-radius: 6px;
  margin-block-end: 1rem;
  .filters-open & {
    margin-inline-end: 1rem;
  }

	&__image {
		flex: 0 0 var(--image-size);
		aspect-ratio: 1 / 1;

		img {
			width: 100%;
			height: 100%;
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
		margin: 0;
		color: #001d5f;
		font-size: 1.5rem;
		font-weight: bold;
	}
  &__meta {
    align-items: center;
    display: flex;
    gap: .5rem;
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
    align-items: center;
    background-color: var(--owc-openkaarten-streetmap--primary-color);
    border-radius: 4px;
    color: white;
    display: inline-flex;
    gap: 8px;
    padding: 8px 16px;
    text-decoration: none;
    width: fit-content;
    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
