<template>
  <div
    class="col-12 col-md-8 mx-auto mt-4 border border-secondary p-5 bg-white"
  >
    <h3 class="text-center text-primary my-4">Edit Customer</h3>
    <CustomerForm isEdit />
  </div>
</template>
<script lang="ts" setup>
import CustomerForm from "@/components/forms/CustomerForm.vue";
import { setCurrentPageBreadcrumbs } from "@/core/helpers/config";
import { onMounted } from "vue";
onMounted(() => {
  setCurrentPageBreadcrumbs("Edit customer", ["customers"]);
});
</script>
