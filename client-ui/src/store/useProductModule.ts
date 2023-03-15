import { ProductUpdateInput, ProductCreateInput, Product } from "./../../index";
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
const initialState: Product | ProductCreateInput | ProductUpdateInput = {
  name: "",
  itemPrice: 0,
};
export const useProductStore = defineStore("product-store", {
  state: () => {
    return {
      productList: [] as Array<Product>,
      error: null as Object | any,
      isLoading: useBodyStore().isLoading,
      product: _.cloneDeep(initialState),
      productExcelFile: "" as string,
      productPagination: {
        skip: 0,
        take: Number(localStorage.getItem("take")) || 5,
        total: 0,
      },
    };
  },

  getters: {},

  actions: {
    async fetchProducts(payload: IPagination) {
      try {
        const { data } = await service.api.productControllerFindMany({
          skip: payload?.skip ?? undefined,
          take: payload?.take ?? undefined,
        });
        this.productList = data.paginatedResult;

        this.productList.forEach((element) => {
          for (const [key, value] of Object.entries(element)) {
            if (typeof value == "object" && value) {
              element[key] = Object.values(value);
            }
          }
        });
        this.productPagination = {
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
        this.productList = [];
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
      }
    },
    async fetchDataExcelProducts() {
      try {
        const { data } = await service.api.productControllerFindDataForExcel();
        this.productExcelFile = data.file;

        this.error = null;
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async softDeleteProduct(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.productControllerUpdate(payload, {
          deletedAt: new Date(),
        });
        this.error = null;
        this.fetchProducts({
          take: this.productPagination.take,
          skip: this.productPagination.skip,
        });
      } catch (err: any) {
        console.error("Error loading  ITEMS", err);
        this.error = err.error;
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async deleteProduct(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.productControllerDelete(payload);
        this.productList = this.productList.filter(
          (product) => product.id !== data.id
        );
        this.productPagination.total--;
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
    async editProduct(payload: { id: string; data?: ProductUpdateInput }) {
      this.isLoading = true;
      try {
        const { data } = await service.api.productControllerUpdate(
          payload.id,
          payload.data ?? this.product
        );
        this.productList = this.productList.map((item) =>
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
      async editManyProduct(payload: { data: ProductUpdateInput; where: any }) {
        this.isLoading  = true;
        try {
          const { data } = await service.api.productControllerUpdateMany(
            payload.data,
            payload.where
           
          );
          this.productList = this.productList.map((item) =>
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

    async getProductById(payload: string) {
      this.isLoading = true;
      try {
        const { data } = await service.api.productControllerFindOne(payload);
        this.product = data;
        this.error = null;
      } catch (err: any) {
        this.resetProduct();
        console.error("Error Update  ITEMS", err.error);
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createProduct(payload?: { data: ProductCreateInput }) {
      this.isLoading = true;
      try {
        const { data } = await service.api.productControllerCreate(
          payload?.data ?? (this.product as ProductCreateInput)
        );
        this.productList = [...this.productList, data];
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },
    async createManyProduct(payload: any) {
      this.isLoading = true;
      try {
        const { data } = await service.api.productControllerCreateMany(payload);
        this.error = null;
      } catch (err: any) {
        this.error = err.error;
      } finally {
        this.isLoading = false;
      }
    },

    resetProduct() {
      this.product = _.cloneDeep(initialState);
    },
  },
});
