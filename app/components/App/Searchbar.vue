<script lang="ts" setup>
import { debounce } from '~/utils/debounce'
import SearchIcon from '~/assets/icons/tune-d-search.svg'

const searchValue = ref('')

const emit = defineEmits<{
	(e: 'search', searchValue: string): void
}>()

const updateDebouncedQuery = debounce((value: string): void => {
	emit('search', value)
}, 500)

watch(searchValue, (newValue: string): void => {
	updateDebouncedQuery(newValue)
})
</script>

<template>
	<div class="searchbar">
		<SearchIcon class="searchbar__icon"/>

		<input
			v-model="searchValue"
			class="searchbar__input"
			placeholder="Type here to search..."
			type="text"
			@keyup.enter="emit('search', searchValue)"
		/>
	</div>
</template>

<style lang="scss" scoped>
$searchbar: ".searchbar";

#{$searchbar} {
	background-color: $black-color-lighter;
	border: 2px solid $black-color-lightest;
	border-radius: 5px;
	gap: 10px;
	padding: 6px 10px 8px;
	transition: all 0.3s ease;

	@include flex-center(row, space-between);

	&:has(#{$searchbar}__input:focus-visible),
	&:focus-within {
		background-color: color($black-color-lightest, 0.6);
		border: 2px solid color($gold-color, 0.75);
		box-shadow: 0 6px 5px color($gold-color, 0.12),
		0 12px 18px color($gold-color, 0.18),
		0 100px 80px color($gold-color, 0.03);
	}

	&:hover {
		background-color: color($black-color-lightest, 0.6);
		border: 2px solid color($gold-color, 0.35);
	}

	&__icon {
		font-size: rem(20);

		&:deep(path) {
			stroke: $white-color-lightest;
		}
	}

	&__input {
		background: transparent;
		border: none;
		color: $white-color-lightest;
		height: 30px;
		outline: none;
		width: 100%;

		@include media-query("tablet") {
			width: 220px;
		}
	}
}
</style>