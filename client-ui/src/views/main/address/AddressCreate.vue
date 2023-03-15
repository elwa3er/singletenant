<template>
  <div class="col-12 col-md-8 mx-auto mt-4 border border-secondary p-5 card">
    <h3 class="text-center text-primary my-4">Create Address</h3>
    <AddressForm :isEdit="false" />
  </div>
</template>

<script lang="ts" setup>
import AddressForm from "@/components/forms/AddressForm.vue";
import { setCurrentPageBreadcrumbs } from "@/core/helpers/config";
import { onMounted } from "vue";
onMounted(() => {
  setCurrentPageBreadcrumbs("create address", ["addresses"]);
});
</script>
