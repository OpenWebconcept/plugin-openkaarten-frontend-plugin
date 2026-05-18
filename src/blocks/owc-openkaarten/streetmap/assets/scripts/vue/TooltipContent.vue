<script setup>
import BaseIcon from './BaseIcon.vue';

defineProps({
	tooltipArray: {
		type: Array,
		required: true,
		default: () => [],
	},
	classPrefix: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		default: '',
	},
	titleTag: {
		type: String,
		default: 'h3',
	},
	marker: {
		type: Object,
		default: null,
	},
	skipLayouts: {
		type: Array,
		default: () => [],
	},
});
</script>

<template>
	<template v-for="(item, index) in tooltipArray" :key="index">
		<template v-if="!skipLayouts.includes(item.layout)">
			<component
				:is="titleTag"
				v-if="item.layout === 'title' && item.title"
				:class="`${classPrefix}__title`"
			>
				{{ item.title }}
			</component>
			<div
				v-else-if="item.layout === 'meta' && item.meta"
				:class="`${classPrefix}__meta`"
			>
				<template v-if="marker">
					<BaseIcon :marker="marker" />
					<p :class="`${classPrefix}__address`">{{ item.meta }}</p>
				</template>
				<template v-else>
					{{ item.meta }}
				</template>
			</div>
			<p
				v-else-if="item.layout === 'text' && item.text"
				:class="`${classPrefix}__text`"
			>
				{{ item.text }}
			</p>
			<div
				v-else-if="item.layout === 'image' && item.image_url"
				:class="`${classPrefix}__image`"
			>
				<img :src="item.image_url" :alt="item.image_alt || ''" />
			</div>
			<a
				v-else-if="item.layout === 'button' && item.button_url"
				:href="item.button_url"
				:class="`${classPrefix}__button`"
			>
				<svg aria-hidden="true" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M10.243 4.41a.833.833 0 0 1 1.178 0l5 5a.833.833 0 0 1 0 1.18l-5 5a.833.833 0 0 1-1.178-1.18l3.577-3.577H4.165a.833.833 0 0 1 0-1.667h9.655L10.243 5.59a.833.833 0 0 1 0-1.178Z" fill="#fff"/>
				</svg>
				{{ item.button_text }}
				<span class="sr-only">over {{ title }}</span>
			</a>
		</template>
	</template>
</template>
