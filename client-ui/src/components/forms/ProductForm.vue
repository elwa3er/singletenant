<template>
  <el-form
    :model="product"
    label-width="120px"
    :rules="rules"
    ref="ruleFormRef"
  >
    <el-form-item label="name" prop="name">
      <el-input v-model="product.name" data-test="productFormname" />
    </el-form-item>
    <el-form-item label="itemPrice" prop="itemPrice">
      <el-input-number
        :min="0"
        :max="100000"
        v-model="product.itemPrice"
        data-test="productFormitemPrice"
      />
    </el-form-item>
    <el-form-item label="description" prop="description">
      <el-input
        v-model="product.description"
        type="textarea"
        data-test="productFormdescription"
      />
    </el-form-item>
    <div class="d-flex justify-content-end">
      <el-button
        data-test="productFormCancelButton"
        @click="resetForm(ruleFormRef)"
        >Cancel</el-button
      >
      <el-button
        data-test="productFormSubmitButton"
        type="primary"
        @click="onSubmit(ruleFormRef)"
        >Create</el-button
      >
    </div>
  </el-form>
</template>
<script lang="ts" setup>
import { onMounted } from "vue";
import { reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { supabase } from "@/core/services/SupabaseClientService";

import { useProductStore } from "@/store/useProductModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});

const { product, error } = storeToRefs(useProductStore());
const {
  getProductById,
  createProduct,
  editProduct,
  resetProduct,
} = useProductStore();

const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);
const rules = reactive({
  name: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  itemPrice: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  description: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
});

const handleSubmitForm = async () => {
  isLoading.value = true;
  if (props.isEdit) {
    const id = route?.params?.id as string;
    return await editProduct({ id });
  } else await createProduct();
};

const onSubmit = (formEl: InstanceType<typeof ElForm> | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      await handleSubmitForm();
      if (!!error.value) {
        Components.ElMessage.error(error.value?.message);
        console.log(error, "error");
      } else {
        router.push({ name: "list-product" });
        resetProduct();
      }
    } else {
      console.log("error submit!");
      return false;
    }
  });
};
const resetForm = (formEl: InstanceType<typeof ElForm> | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  resetProduct();
};
const getCurrentProduct = async (id: string) => {
  if (props.isEdit) {
    await getProductById(id);
  }
};

onMounted(async () => {
  const id = route.params.id as string;

  await getCurrentProduct(id);
});
</script>
