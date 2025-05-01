<script setup>
defineProps({
	primaryColor: {
		type: String,
		required: true,
	},
});

const emit = defineEmits(['closeCard']);
</script>

<template>
	<button
		class="owc-openkaarten-streetmap__tooltip-card__close-btn"
    aria-label="Sluit"
    :style="{'--owc-openkaarten-streetmap--close-btn-color': primaryColor }"
    @click="$emit('closeCard')"
	>
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
      aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M4.41205 4.41058C4.73748 4.08514 5.26512 4.08514 5.59056 4.41058L10.0013 8.82133L14.412 4.41058C14.7375 4.08514 15.2651 4.08514 15.5906 4.41058C15.916 4.73602 15.916 5.26366 15.5906 5.58909L11.1798 9.99984L15.5906 14.4106C15.916 14.736 15.916 15.2637 15.5906 15.5891C15.2651 15.9145 14.7375 15.9145 14.412 15.5891L10.0013 11.1783L5.59056 15.5891C5.26512 15.9145 4.73748 15.9145 4.41205 15.5891C4.08661 15.2637 4.08661 14.736 4.41205 14.4106L8.82279 9.99984L4.41205 5.58909C4.08661 5.26366 4.08661 4.73602 4.41205 4.41058Z"
				:fill="primaryColor"
			/>
		</svg>
	</button>
</template>

<style lang="scss">
.owc-openkaarten-streetmap {
	&__tooltip-card__close-btn {
		cursor: pointer;
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 44px;
		min-width: 44px;
		background-color: #fff;
		border: 1px solid var(--owc-openkaarten-streetmap--primary-color);
		border-radius: 3px;
	}
}
</style>
