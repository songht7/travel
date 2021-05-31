<template>
	<view class="meteor-body">
		<view class="main-con">
			<block v-for="k in 7" :key="k">
				<div class="shooting_star"></div>
			</block>
		</view>
	</view>
</template>

<script>
</script>

<style>
	@-webkit-keyframes tail {
		0% {
			opacity: 0;
		}

		30% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}

	@keyframes tail {
		0% {
			opacity: 0;
		}

		30% {
			opacity: 1;
		}

		100% {
			opacity: 0;
		}
	}

	@-webkit-keyframes shooting {
		0% {
			-webkit-transform: translateY(0);
			transform: translateY(0);
		}

		100% {
			-webkit-transform: translateY(100px);
			transform: translateY(100px);
		}
	}

	@keyframes shooting {
		0% {
			-webkit-transform: translateY(0);
			transform: translateY(0);
		}

		100% {
			-webkit-transform: translateY(100px);
			transform: translateY(100px);
		}
	}
</style>
