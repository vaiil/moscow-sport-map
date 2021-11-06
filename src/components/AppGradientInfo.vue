<template>
  <div class="app-gradient-info">
    <div class="app-gradient-info__line" />
    <div class="app-gradient-info__values">
      <div class="app-gradient-info__value">
        <div class="app-gradient-info__value-number">
          от {{ parseFloat(startValue.toPrecision(5)) }}
        </div>
        <div class="app-gradient-info__value-label">
          (минимум)
        </div>
      </div>
      <div class="app-gradient-info__value app-gradient-info__value_type_right">
        <div class="app-gradient-info__value-number">
          до {{ parseFloat(endValue.toPrecision(5)) }}
        </div>
        <div class="app-gradient-info__value-label">
          (максимум)
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppGradientInfo',
  props: {
    startValue: {
      type: Number,
      required: true,
    },
    endValue: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style lang="scss">
.app-gradient-info {
  &__line {
    height: 6px;
    background: linear-gradient(to right,
      hsl(240, 100%, 50%),
      hsl(220, 100%, 50%),
      hsl(200, 100%, 50%),
      hsl(180, 100%, 50%),
      hsl(160, 100%, 50%),
      hsl(140, 100%, 50%),
      hsl(120, 100%, 50%),
      hsl(100, 100%, 50%),
      hsl(80, 100%, 50%),
      hsl(60, 100%, 50%),
      hsl(40, 100%, 50%),
      hsl(20, 100%, 50%),
      hsl(0, 100%, 50%)
    );
  }

  &__values {
    display: flex;
    justify-content: space-between;
  }

  &__value {
    &_type {
      &_right {
        text-align: right;
      }
    }
  }

  &__value-number{
    font-size: 14px;
  }

  &__value-label {
    font-size: 12px;
  }
}
</style>
