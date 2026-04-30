<script lang="ts" setup>

</script>

<template>
	<nav class="nav">
		<NuxtLink :class="['nav__link', { '--active': $route.path === '/' }]" to="/">Home</NuxtLink>
		<NuxtLink :class="['nav__link', { '--active': $route.path === '/top100' }]" to="/">Top 100</NuxtLink>
		<NuxtLink :class="['nav__link', { '--active': $route.path === '/scored-tracks' }]" to="/">Scored Tracks
		</NuxtLink>
	</nav>
</template>

<style lang="scss" scoped>
.nav {
	align-items: center;
	display: flex;
	gap: 32px;
	justify-content: space-between;

	&__link {
		font-size: rem(20);
		padding: 5px 10px;
		text-align: center;
		transition: all 0.3s ease;

		&:hover {
			color: $gold-color;
		}

		&.--active {
			color: $gold-color;
			font-weight: 600;
		}
	}
}
</style>