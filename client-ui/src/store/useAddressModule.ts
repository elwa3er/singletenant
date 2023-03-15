import { AddressUpdateInput, AddressCreateInput, Address } from "./../../index";
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
const initialState: Address | AddressCreateInput | AddressUpdateInput = {
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  zip: 0,
};
export const useAddressStore = defineStore("address-store", {
  state: () => {
    return {
      addressList: [] as Array<Address>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      address: _.cloneDeep(initialState),
      addressExcelFile: "" as string,
      addressPagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchAddresses(payload: IPagination) {
      try {
        const { data } = await service.api.addressControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
        });
        this.addressList = data.paginatedResult;

        this.addressList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.addressPagination = {
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
        this.addressList = [];
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
      }
    },
    async fetchDataExcelAddresses() {
      try {
        const { data } = await service.api.addressControllerFindDataForExcel();
        this.addressExcelFile = data.file;

        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async softDeleteAddress(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.addressControllerUpdate(payload, {
          deletedAt: new Date(),
        });
        this.error = null;
        this.fetchAddresses({
          take: this.addressPagination.take,
          skip: this.addressPagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteAddress(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.addressControllerDelete(payload);
        this.addressList = this.addressList.filter(
          (address) => address.id !== data.id
        );
        this.addressPagination.total--;
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
    async editAddress(payload: { id: string; data?: AddressUpdateInput }) {
      this.isLoading = true;
      try {
        const { data } = await service.api.addressControllerUpdate(
          payload.id,
          payload.data ?? this.address
        );
        this.addressList = this.addressList.map((item) =>
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
      async editManyAddress(payload: { data: AddressUpdateInput; where: any }) {
        this.isLoading  = true;
        try {
          const { data } = await service.api.addressControllerUpdateMany(
            payload.data,
            payload.where
           
          );
          this.addressList = this.addressList.map((item) =>
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

    async getAddressById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.addressControllerFindOne(payload);
        this.address = data;
        this.error = null;
      } catch (err: any) {
        this.resetAddress();
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createAddress(payload?: { data: AddressCreateInput }) {
      this.isLoading = true;
      try {
        const { data } = await service.api.addressControllerCreate(
          payload?.data ?? (this.address as AddressCreateInput)
        );
        this.addressList = [...this.addressList, data];
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createManyAddress(payload: any) {
      this.isLoading = true;
      try {
        const { data } = await service.api.addressControllerCreateMany(payload);
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },

    resetAddress() {
      this.address = _.cloneDeep(initialState);
    },
  },
});
