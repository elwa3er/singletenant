<template>
  <el-form
    :model="customer"
    label-width="120px"
    :rules="rules"
    ref="ruleFormRef"
  >
    <el-form-item label="firstName" prop="firstName">
      <el-input
        v-model="customer.firstName"
        data-test="customerFormfirstName"
      />
    </el-form-item>
    <el-form-item label="lastName" prop="lastName">
      <el-input v-model="customer.lastName" data-test="customerFormlastName" />
    </el-form-item>
    <el-form-item label="email" prop="email">
      <el-input
        v-model="customer.email"
        type="email"
        data-test="customerFormemail"
      />
    </el-form-item>
    <el-form-item label="phone" prop="phone">
      <el-input v-model="customer.phone" data-test="customerFormphone" />
    </el-form-item>
    <el-form-item label="address_id" prop="address">
      <el-select
        v-model="customer.address.id"
        data-test="customerFormaddressId"
        class="m-2"
        placeholder="Select"
        size="large"
      >
        <el-option
          v-for="address in addresses"
          :data-test="address.id"
          :label="address.id"
          :key="address.id"
          :value="address.id"
        />
      </el-select>
    </el-form-item>
    <div class="d-flex justify-content-end">
      <el-button
        data-test="customerFormCancelButton"
        @click="resetForm(ruleFormRef)"
        >Cancel</el-button
      >
      <el-button
        data-test="customerFormSubmitButton"
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

import { useCustomerStore } from "@/store/useCustomerModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});
let addresses = ref([]);
const { customer, error } = storeToRefs(useCustomerStore());
const {
  getCustomerById,
  createCustomer,
  editCustomer,
  resetCustomer,
} = useCustomerStore();

const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);
const rules = reactive({
  firstName: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  lastName: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  email: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  phone: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  address: [
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
    return await editCustomer({ id });
  } else await createCustomer();
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
        router.push({ name: "list-customer" });
        resetCustomer();
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
  resetCustomer();
};
const getCurrentCustomer = async (id: string) => {
  if (props.isEdit) {
    await getCustomerById(id);
  }
};

const getListOfAddress = async () => {
  await supabase
    .from("Address")
    .select("*")
    .then(({ data }) => {
      addresses.value = data;
    });
};

onMounted(async () => {
  const id = route.params.id as string;
  await getListOfAddress();
  await getCurrentCustomer(id);
});
</script>
