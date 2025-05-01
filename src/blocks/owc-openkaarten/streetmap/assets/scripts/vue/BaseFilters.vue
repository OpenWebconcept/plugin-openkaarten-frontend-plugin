<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import BaseFiltersCheckbox from './BaseFiltersCheckbox.vue';
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

const filterContainer = ref(null);
const closeButton = ref(null);
let previousActiveElement = null;

const getFocusableElements = (element) => {
	return element.querySelectorAll(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);
};

const handleTab = (e) => {
	if (!props.open || !filterContainer.value) return;

	const focusableElements = getFocusableElements(filterContainer.value);
	const firstFocusable = focusableElements[0];
	const lastFocusable = focusableElements[focusableElements.length - 1];

	if (e.shiftKey) {
		if (document.activeElement === firstFocusable) {
			e.preventDefault();
			lastFocusable.focus();
		}
	} else {
		if (document.activeElement === lastFocusable) {
			e.preventDefault();
			firstFocusable.focus();
		}
	}
};

const handleKeyup = (e) => {
	if (!props.open) return;
	
	if (e.key === 'Escape') {
		closeFiltersWithX();
	}
};

const handleClickOutside = (e) => {
	if (!props.open) return;
	
	if (filterContainer.value && !filterContainer.value.contains(e.target)) {
		closeFiltersWithX();
	}
};

const closeFiltersWithX = () => {
	const filterButton = document.querySelector('.leaflet-control-filters');
	if (filterButton) {
		filterButton.focus();
	}
	emit('closeFilters');
};

const closeFiltersWithConfirm = (event) => {
	event?.preventDefault();
	event?.stopPropagation();
	
	const filterButton = document.querySelector('.leaflet-control-filters');
	if (filterButton) {
		filterButton.focus();
	}
	emit('closeFilters');
};

watch(() => props.open, async (newValue) => {
	if (newValue) {
		previousActiveElement = document.activeElement;
		await nextTick();
		closeButton.value?.focus();
	}
});

onMounted(() => {
	document.addEventListener('keydown', handleTab);
	document.addEventListener('keyup', handleKeyup);
	document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
	document.removeEventListener('keydown', handleTab);
	document.removeEventListener('keyup', handleKeyup);
	document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<template>
	<div
		ref="filterContainer"
		class="owc-openkaarten-streetmap__filters"
    :style="{ '--owc-filters-primary': primaryColor }"
    role="dialog"
		aria-modal="true"
		aria-labelledby="filters-title"
		aria-describedby="filters-description"
	>
		<div class="owc-openkaarten-streetmap__filters__header">
			<h5 id="filters-title">{{ title }}</h5>
			<BaseTooltipCardClose
				ref="closeButton"
				:primaryColor="primaryColor"
				@closeCard="closeFiltersWithX"
			/>
		</div>
		<div id="filters-description" class="owc-openkaarten-streetmap__filters__body">
			<ul class="owc-openkaarten-streetmap__filters__body__list">
				<li
					v-for="layer in datasets"
					:key="layer.id"
					class="owc-openkaarten-streetmap__filters__body__list-item"
				>
					<BaseFiltersCheckbox
						:title="layer.title"
						:id="layer.id"
						:color="primaryColor"
						:selected="selectedDatasets.includes(layer.id)"
						@onChange="datasetChange"
					/>
					<div
              :style="{'background-color': getDatalayerColor(layer)}"
						class="owc-openkaarten-streetmap__filters__body__list-item__dl-indicator"
					/>
				</li>
			</ul>
		</div>
		<div class="owc-openkaarten-streetmap__filters__footer">
			<button
				class="owc-openkaarten-streetmap__filters__footer__btn"
				@click.stop.prevent="closeFiltersWithConfirm"
				@keydown.enter.stop.prevent="closeFiltersWithConfirm"
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
	max-height: 661px;
	background: #fff;
	position: absolute;
	top: var(--owc-filters-card-margin);
	bottom: var(--owc-filters-card-margin);
	right: var(--owc-filters-card-margin);
	z-index: 9999;
	border: none;
	padding: 0;
	margin: 0;

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

			&:focus-visible {
				outline: 2px solid var(--owc-openkaarten-streetmap--primary-color);
				outline-offset: 2px;
			}

			&:where(:hover, :focus-visible) {
				opacity: 0.8;
			}
		}
	}
}
</style>
