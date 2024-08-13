<script>
import BaseTooltipCardClose from './BaseTooltipCardClose.vue';

export default {
	props: {
		id: {
			type: Number,
			required: false,
		},
		title: {
			type: String,
			default: '',
			required: true,
		},
		properties: {
			type: Object,
			default: {},
			required: false,
		},
		primaryColor: {
			type: String,
			required: true,
		},
	},

	components: {
		BaseTooltipCardClose,
	},

	setup({ properties }, ctx) {
		const getPropertyList = () => {
			if (!properties) return null;
			let list = [];
			delete properties.marker;
			for (const [key, value] of Object.entries(properties)) {
				list.push({
					key,
					value,
				});
			}

			return `<ul class="owc-openkaarten-streetmap__tooltip-card__list">${list
				.map(
					(item) =>
						`<li><span>${item.key}:</span> <span>${item.value}</span></li>`
				)
				.join('')}</ul>`;
		};

		const handleFocus = (el) => {
			if (el) {
				el.focus();
				document.addEventListener('keydown', ({ key }) => {
					if (key === 'Escape') {
						ctx.emit('closeCard');
					}
				});
			}
		};

		return {
			content: getPropertyList(),
			handleFocus,
		};
	},
};
</script>

<template>
	<div
		:key="id"
		:ref="handleFocus"
		class="owc-openkaarten-streetmap__tooltip-card"
		tabindex="0"
	>
		<div class="owc-openkaarten-streetmap__tooltip-card__header">
			<h4 class="owc-openkaarten-streetmap__tooltip-card__title">
				{{ title }}
			</h4>
			<BaseTooltipCardClose
				:primaryColor="primaryColor"
				@closeCard="$emit('closeCard')"
			/>
		</div>
		<div
			class="owc-openkaarten-streetmap__tooltip-card__info"
			v-if="content"
			v-html="content"
		/>
	</div>
</template>

<style lang="scss">
.owc-openkaarten-streetmap {
	&__tooltip-card {
		background-color: #fff;
		position: absolute;
		bottom: 24px;
		left: 12px;
		right: 12px;
		z-index: 400;
		border-radius: 0px 0px 4px 4px;
		padding: 16px;

		@media only screen and (min-width: 768px) {
			left: auto;
			bottom: 24px;
			right: 36px;
		}

		&:focus {
			outline: none;
		}

		&__header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 24px;
			margin-bottom: 16px;
		}

		&__title {
			margin-block: 0;
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
	}
}
</style>