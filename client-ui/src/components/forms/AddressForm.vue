<template>
  <el-form
    :model="address"
    label-width="120px"
    :rules="rules"
    ref="ruleFormRef"
  >
    <el-form-item label="address_1" prop="address_1">
      <el-input v-model="address.address_1" data-test="addressFormaddress_1" />
    </el-form-item>
    <el-form-item label="address_2" prop="address_2">
      <el-input v-model="address.address_2" data-test="addressFormaddress_2" />
    </el-form-item>
    <el-form-item label="city" prop="city">
      <el-input v-model="address.city" data-test="addressFormcity" />
    </el-form-item>
    <el-form-item label="state" prop="state">
      <el-input v-model="address.state" data-test="addressFormstate" />
    </el-form-item>
    <el-form-item label="zip" prop="zip">
      <el-input-number
        :min="0"
        :max="100000"
        v-model="address.zip"
        data-test="addressFormzip"
      />
    </el-form-item>
    <div class="d-flex justify-content-end">
      <el-button
        data-test="addressFormCancelButton"
        @click="resetForm(ruleFormRef)"
        >Cancel</el-button
      >
      <el-button
        data-test="addressFormSubmitButton"
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

import { useAddressStore } from "@/store/useAddressModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});

const { address, error } = storeToRefs(useAddressStore());
const {
  getAddressById,
  createAddress,
  editAddress,
  resetAddress,
} = useAddressStore();

const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);
const rules = reactive({
  address_1: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  address_2: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  city: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  state: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  zip: [
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
    return await editAddress({ id });
  } else await createAddress();
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
        router.push({ name: "list-address" });
        resetAddress();
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
  resetAddress();
};
const getCurrentAddress = async (id: string) => {
  if (props.isEdit) {
    await getAddressById(id);
  }
};

onMounted(async () => {
  const id = route.params.id as string;

  await getCurrentAddress(id);
});
</script>
