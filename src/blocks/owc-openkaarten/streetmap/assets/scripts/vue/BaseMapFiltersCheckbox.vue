<script>
import BaseTooltipCardClose from './BaseTooltipCardClose.vue';
export default {
	components: { BaseTooltipCardClose },
	props: {
		title: {
			type: String,
			required: true,
		},
		id: {
			type: Number,
			required: true,
		},
		color: {
			type: String,
			required: true,
		},
		selected: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
};
</script>

<template>
	<label
		:for="`owc-checkbox-${id}`"
		role="checkbox"
		:aria-checked="selected"
		class="owc-openkaarten-streetmap__filters__checkbox"
		><span class="owc-openkaarten-streetmap__filters__checkbox__label">{{
			title
		}}</span>
		<input
			:id="`owc-checkbox-${id}`"
			type="checkbox"
			:checked="selected"
			@change="$emit('onChange', id, !selected)"
		/>
		<span class="owc-openkaarten-streetmap__filters__checkbox__mark"></span>
	</label>
</template>

<style scoped lang="scss">
.owc-openkaarten-streetmap__filters__checkbox {
	display: block;
	position: relative;
	padding-left: 30px; // 20px checkbox + 2px border + 8px gap
	margin-bottom: 16px;
	cursor: pointer;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;

	&:focus-within {
		outline: 2px solid var(--owc-filters-primary);
	}

	&__label {
		font-size: 18px;
		font-style: normal;
		font-weight: 700;
		line-height: 120%;
		color: var(--owc-filters-checkbox-label-color);
	}

	input {
		position: absolute;
		opacity: 0;
		cursor: pointer;
		height: 0;
		width: 0;
	}

	&__mark {
		position: absolute;
		top: 2px;
		left: 2px;
		height: 18px;
		width: 18px;
		background-color: #fff;
		border: 1px solid var(--owc-filters-secondary);
		border-radius: 3px;

		&:after {
			content: '';
			position: absolute;
			display: none;
			left: 6px;
			top: 2px;
			width: 4px;
			height: 8px;
			border: solid white;
			border-width: 0 3px 3px 0;
			-webkit-transform: rotate(45deg);
			-ms-transform: rotate(45deg);
			transform: rotate(45deg);
		}
	}

	&:hover {
		input ~ .owc-openkaarten-streetmap__filters__checkbox__mark {
			background-color: #efefef;
		}
	}

	input:checked ~ .owc-openkaarten-streetmap__filters__checkbox__mark {
		background-color: var(--owc-filters-primary);
		border-color: var(--owc-filters-primary);
		&::after {
			display: block;
		}
	}
}
</style>