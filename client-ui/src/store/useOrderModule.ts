import { OrderUpdateInput, OrderCreateInput, Order } from "./../../index";
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
const initialState: Order | OrderCreateInput | OrderUpdateInput = {
  quantity: 0,
  discount: 0,
  totalPrice: 0,
  customer: { id: "" },
  product: { id: "" },
};
export const useOrderStore = defineStore("order-store", {
  state: () => {
    return {
      orderList: [] as Array<Order>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      order: _.cloneDeep(initialState),
      orderExcelFile: "" as string,
      orderPagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchOrders(payload: IPagination) {
      try {
        const { data } = await service.api.orderControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
        });
        this.orderList = data.paginatedResult;

        this.orderList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.orderPagination = {
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
        this.orderList = [];
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
      }
    },
    async fetchDataExcelOrders() {
      try {
        const { data } = await service.api.orderControllerFindDataForExcel();
        this.orderExcelFile = data.file;

        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async softDeleteOrder(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.orderControllerUpdate(payload, {
          deletedAt: new Date(),
        });
        this.error = null;
        this.fetchOrders({
          take: this.orderPagination.take,
          skip: this.orderPagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteOrder(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.orderControllerDelete(payload);
        this.orderList = this.orderList.filter((order) => order.id !== data.id);
        this.orderPagination.total--;
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
    async editOrder(payload: { id: string; data?: OrderUpdateInput }) {
      this.isLoading = true;
      try {
        const { data } = await service.api.orderControllerUpdate(
          payload.id,
          payload.data ?? this.order
        );
        this.orderList = this.orderList.map((item) =>
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
      async editManyOrder(payload: { data: OrderUpdateInput; where: any }) {
        this.isLoading  = true;
        try {
          const { data } = await service.api.orderControllerUpdateMany(
            payload.data,
            payload.where
           
          );
          this.orderList = this.orderList.map((item) =>
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

    async getOrderById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.orderControllerFindOne(payload);
        this.order = data;
        this.error = null;
      } catch (err: any) {
        this.resetOrder();
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createOrder(payload?: { data: OrderCreateInput }) {
      this.isLoading = true;
      try {
        const { data } = await service.api.orderControllerCreate(
          payload?.data ?? (this.order as OrderCreateInput)
        );
        this.orderList = [...this.orderList, data];
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createManyOrder(payload: any) {
      this.isLoading = true;
      try {
        const { data } = await service.api.orderControllerCreateMany(payload);
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },

    resetOrder() {
      this.order = _.cloneDeep(initialState);
    },
  },
});
