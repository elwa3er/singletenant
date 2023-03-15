import {
  CustomerUpdateInput,
  CustomerCreateInput,
  Customer,
} from "./../../index";
import { defineStore } from "pinia";
import service from "@/service";
import { storeToRefs } from "pinia";
import { useBodyStore } from "@/store/useBodyModule";
import _ from "lodash";

interface IPagination {
  take?: number;
  skip?: number;
}
const { isLoading } = storeToRefs(useBodyStore());
const initialState: Customer | CustomerCreateInput | CustomerUpdateInput = {
  firstName: "",
  lastName: "",
  phone: "",
  address: { id: "" },
};
export const useCustomerStore = defineStore("customer-store", {
  state: () => {
    return {
      customerList: [] as Array<Customer>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      customer: _.cloneDeep(initialState),
      customerExcelFile: "" as string,
      customerPagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchCustomers(payload: IPagination) {
      try {
        const { data } = await service.api.customerControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
        });
        this.customerList = data.paginatedResult;

        this.customerList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.customerPagination = {
          total: data.totalCount,
          skip: payload?.skip ?? 0,
          take: payload?.take ?? data.totalCount,
        };
        localStorage.setItem(
          "take",
          payload?.take?.toString() ?? data.totalCount.toString()
        );
        this.error = null;
      } catch (err: any) {
        this.customerList = [];
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
      }
    },
    async fetchDataExcelCustomers() {
      try {
        const { data } = await service.api.customerControllerFindDataForExcel();
        this.customerExcelFile = data.file;

        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async softDeleteCustomer(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.customerControllerUpdate(payload, {
          deletedAt: new Date(),
        });
        this.error = null;
        this.fetchCustomers({
          take: this.customerPagination.take,
          skip: this.customerPagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteCustomer(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.customerControllerDelete(payload);
        this.customerList = this.customerList.filter(
          (customer) => customer.id !== data.id
        );
        this.customerPagination.total--;
        this.isLoading = false;
        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async editCustomer(payload: { id: string; data?: CustomerUpdateInput }) {
      this.isLoading = true;
      try {
        const { data } = await service.api.customerControllerUpdate(
          payload.id,
          payload.data ?? this.customer
        );
        this.customerList = this.customerList.map((item) =>
          item.id === payload.id ? { ...item, ...data } : item
        );
        this.error = null;
      } catch (err: any) {
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    } /*
      async editManyCustomer(payload: { data: CustomerUpdateInput; where: any }) {
        this.isLoading  = true;
        try {
          const { data } = await service.api.customerControllerUpdateMany(
            payload.data,
            payload.where
           
          );
          this.customerList = this.customerList.map((item) =>
            item.id === payload.id ? { ...item, ...payload.data } : item
          );
          this.error = null;
        } catch (err:any) {
          console.error("Error Update  ITEMS", err.error);
          this.error = err.error;
        } finally {
          this.isLoading = false;
        }
      },*/,

    async getCustomerById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.customerControllerFindOne(payload);
        this.customer = data;
        this.error = null;
      } catch (err: any) {
        this.resetCustomer();
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createCustomer(payload?: { data: CustomerCreateInput }) {
      this.isLoading = true;
      try {
        const { data } = await service.api.customerControllerCreate(
          payload?.data ?? (this.customer as CustomerCreateInput)
        );
        this.customerList = [...this.customerList, data];
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createManyCustomer(payload: any) {
      this.isLoading = true;
      try {
        const { data } = await service.api.customerControllerCreateMany(
          payload
        );
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },

    resetCustomer() {
      this.customer = _.cloneDeep(initialState);
    },
  },
});
