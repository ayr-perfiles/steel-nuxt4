<script lang="ts" setup>
import { Form } from "ant-design-vue";
import { type ICustomer } from "~/models/customer";

const model = defineModel<ICustomer | undefined>();

const emit = defineEmits<{
  selected: [];
}>();

const { data: customers } = useCrudCustomers();

const options = computed(() => {
  return customers.value
    .map((item) => {
      return {
        label: item.businessEntity,
        value: item.id,
      };
    })
    .sort(
      (a: any, b: any) =>
        (a.label as string).charCodeAt(0) - (b.label as string).charCodeAt(0)
    );
});

const formItemContext = Form.useInjectFormItemContext();

const handleChange = (customerId: any) => {
  if (!customerId) {
    model.value = undefined;
    return;
  }

  const findCustomer = customers.value.find(
    (customer) => customer.id === customerId
  );

  model.value = findCustomer;
  formItemContext.onFieldChange();

  emit("selected");
};

const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};
</script>

<template>
  <a-select
    :value="model?.id"
    show-search
    placeholder="Seleccionar un cliente"
    :options="options"
    :filter-option="filterOption"
    allow-clear
    @change="handleChange"
  />
</template>
