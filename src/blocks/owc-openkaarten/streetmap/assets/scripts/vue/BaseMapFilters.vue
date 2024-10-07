<script setup>
import { onMounted } from 'vue';
import BaseMapFiltersCheckbox from './BaseMapFiltersCheckbox.vue';
import BaseTooltipCardClose from './BaseTooltipCardClose.vue';

const props = defineProps({
	open: Boolean,
	datasets: {
		type: Array,
		default: () => [],
	},
	selectedDatasets: {
		type: Array,
		default: () => []
	},
	primaryColor: String,
	title: {
		type: String,
		default: 'Filters',
	},
	confirm: {
		type: String,
		default: 'Bevestigen',
	},
});

const emit = defineEmits(['closeFilters', 'datasetChange']);

const getDatalayerColor = (layer) => {
	const firstMarker = layer.features[0]?.properties?.marker?.color;
	return firstMarker || props.primaryColor;
};

const datasetChange = (id, checked) => {
	emit('datasetChange', id, checked);
};

const handleKeyup = (e) => {
	if (props.open && e.key === 'Escape') {
		emit('closeFilters');
	}
};

onMounted(() => {
	document.addEventListener('keyup', handleKeyup);
});
</script>

<template>
	<div
		class="owc-openkaarten-streetmap__filters"
		:style="{ '--filters-primary-color': primaryColor }"
	>
		<div class="owc-openkaarten-streetmap__filters__header">
			<h5>{{ title }}</h5>
			<BaseTooltipCardClose
				:primaryColor="primaryColor"
				@closeCard="$emit('closeFilters')"
			/>
		</div>
		<div class="owc-openkaarten-streetmap__filters__body">
			<ul class="owc-openkaarten-streetmap__filters__body__list">
				<li
					v-for="layer in datasets"
					:key="layer.id"
					class="owc-openkaarten-streetmap__filters__body__list-item"
				>
					<BaseMapFiltersCheckbox
						:title="layer.title"
						:id="layer.id"
						:color="primaryColor"
						:selected="selectedDatasets.includes(layer.id)"
						@onChange="datasetChange"
					/>
					<div
						:style="{
							'background-color': getDatalayerColor(layer),
						}"
						class="owc-openkaarten-streetmap__filters__body__list-item__dl-indicator"
					/>
				</li>
			</ul>
		</div>
		<div class="owc-openkaarten-streetmap__filters__footer">
			<button
				class="owc-openkaarten-streetmap__filters__footer__btn"
				@click="$emit('closeFilters')"
			>
				{{ confirm }}
			</button>
		</div>
	</div>
</template>

<style scoped lang="scss">
.owc-openkaarten-streetmap__filters {
	--owc-filters-card-padding: 12px;
	--owc-filters-card-margin: 10px;
	--owc-filters-primary: var(--owc-openkaarten-streetmap--primary-color);
	--owc-filters-secondary: var(--Grey-4, #7a7a7a);
	--owc-filters-title-color: var(--Primary-300, #001d5f);
	--owc-filters-checkbox-label-color: var(--Grey-4, #4b4b4b);

	@media only screen and (min-width: 768px) {
		--owc-filters-card-padding: 24px;
		--owc-filters-card-margin: 0;
	}


	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 448px;
	max-width: calc(100% - calc(var(--owc-filters-card-margin) * 2));
	height: auto;
	background: #fff;
	position: absolute;
	top: var(--owc-filters-card-margin);
	bottom: var(--owc-filters-card-margin);
	right: var(--owc-filters-card-margin);
	z-index: 9999;

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--owc-filters-card-padding);
		border-bottom: 1px solid #d2d2d2;
		h5 {
			padding: 0;
			margin: 0;
			color: var(--owc-filters-title-color);
			font-size: 20px;
			font-style: normal;
			font-weight: 700;
			line-height: 120%; /* 24px */
		}
	}

	&__body {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		height: -webkit-fill-available;
		padding: var(--owc-filters-card-padding);

		&__list {
			margin-block: 0;
			list-style-type: none;
			padding-left: 0;
		}

		&__list-item {
			display: flex;
			align-content: center;
			justify-content: space-between;
			&__dl-indicator {
				width: 28px;
				height: 28px;
				border-radius: 50%;
				opacity: 0.5;
			}
		}
	}

	&__footer {
		padding: var(--owc-filters-card-padding);
		border-top: 1px solid #d2d2d2;

		&__btn {
			display: flex;
			padding: 8px 16px;
			justify-content: center;
			align-items: center;
			align-self: stretch;
			border-radius: 3px;
			background: var(--owc-openkaarten-streetmap--primary-color);
			border: none;
			width: 100%;
			color: var(--Neutrals-White, #fff);
			text-align: center;
			font-size: 18px;
			font-style: normal;
			font-weight: 400;
			line-height: 150%; /* 27px */
			&:hover {
				cursor: pointer;
			}
		}
	}
}
</style>