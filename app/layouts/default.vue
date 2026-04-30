<script lang="ts" setup>
function handleSearch (value) {
	console.log(value)
}
</script>

<template>
	<header class="header">
		<AppNav/>

		<AppSearchbar @search="handleSearch($event)"/>

		<div>
			Profile
		</div>
	</header>

	<main class="main">
		<slot/>
	</main>
</template>

<style lang="scss" scoped>
.header {
	padding: 20px 26px;

	@include flex-center(row, space-between);
}
</style>