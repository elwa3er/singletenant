<template>
  <el-form :model="order" label-width="120px" :rules="rules" ref="ruleFormRef">
    <el-form-item label="quantity" prop="quantity">
      <el-input-number
        :min="0"
        :max="100000"
        v-model="order.quantity"
        data-test="orderFormquantity"
      />
    </el-form-item>
    <el-form-item label="discount" prop="discount">
      <el-input-number
        :min="0"
        :max="100000"
        v-model="order.discount"
        data-test="orderFormdiscount"
      />
    </el-form-item>
    <el-form-item label="totalPrice" prop="totalPrice">
      <el-input-number
        :min="0"
        :max="100000"
        v-model="order.totalPrice"
        data-test="orderFormtotalPrice"
      />
    </el-form-item>
    <el-form-item label="customer_id" prop="customer">
      <el-select
        v-model="order.customer.id"
        data-test="orderFormcustomerId"
        class="m-2"
        placeholder="Select"
        size="large"
      >
        <el-option
          v-for="customer in customers"
          :data-test="customer.id"
          :label="customer.id"
          :key="customer.id"
          :value="customer.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="product_id" prop="product">
      <el-select
        v-model="order.product.id"
        data-test="orderFormproductId"
        class="m-2"
        placeholder="Select"
        size="large"
      >
        <el-option
          v-for="product in products"
          :data-test="product.id"
          :label="product.id"
          :key="product.id"
          :value="product.id"
        />
      </el-select>
    </el-form-item>
    <div class="d-flex justify-content-end">
      <el-button
        data-test="orderFormCancelButton"
        @click="resetForm(ruleFormRef)"
        >Cancel</el-button
      >
      <el-button
        data-test="orderFormSubmitButton"
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

import { useOrderStore } from "@/store/useOrderModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});
let customers = ref([]);
let products = ref([]);
const { order, error } = storeToRefs(useOrderStore());
const { getOrderById, createOrder, editOrder, resetOrder } = useOrderStore();

const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);
const rules = reactive({
  quantity: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  discount: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  totalPrice: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  customer: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  product: [
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
    return await editOrder({ id });
  } else await createOrder();
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
        router.push({ name: "list-order" });
        resetOrder();
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
  resetOrder();
};
const getCurrentOrder = async (id: string) => {
  if (props.isEdit) {
    await getOrderById(id);
  }
};

const getListOfCustomer = async () => {
  await supabase
    .from("Customer")
    .select("*")
    .then(({ data }) => {
      customers.value = data;
    });
};
const getListOfProduct = async () => {
  await supabase
    .from("Product")
    .select("*")
    .then(({ data }) => {
      products.value = data;
    });
};

onMounted(async () => {
  const id = route.params.id as string;
  await getListOfCustomer();
  await getListOfProduct();
  await getCurrentOrder(id);
});
</script>
