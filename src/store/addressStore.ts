import { API_ROUTES } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";

export interface Address {
  id: string;
  name: string;
  email: string;
  address: string;
  phonenumber: string;
  district: string;
  subcounty: string;
  village: string;
  isDefault: boolean;
}

interface AddressStore {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  createAddress: (address: Omit<Address, 'id'>) => Promise<Address | null>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<Address | null>;
  deleteAddress: (id: string) => Promise<boolean>;
}

export const addressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  error: null,
  isLoading: false,

  fetchAddresses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_ROUTES.ADDRESS}/fetchAllAddresses`, {
        withCredentials: true,
      });

      if (!response.data.success) {
        toast.error('Error while fetching addresses');
        set({ isLoading: false, error: 'Failed fetching addresses' });
        return;
      }

      set({ isLoading: false, addresses: response.data.addresses });
      // Remove toast on successful fetch - it's annoying for users
    } catch (error: any) {
      console.error("Fetch addresses error:", error);
      set({ isLoading: false, error: 'Failed fetching addresses' });
      toast.error('Failed fetching addresses');
    }
  },

  createAddress: async (address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_ROUTES.ADDRESS}/createAddress`,
        address,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        set({ isLoading: false, addresses: response.data.addresses });
        return response.data.address || response.data.addresses[0];
      }

      set({ isLoading: false, error: 'Failed to create address' });
      return null;
    } catch (error) {
      console.error("Create address error:", error);
      toast.error('Error creating address');
      set({ isLoading: false, error: 'Error creating address' });
      return null;
    }
  },

  updateAddress: async (id, address) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_ROUTES.ADDRESS}/updateAddress/${id}`,
        address,
        { withCredentials: true }
      );

      if (!response.data.success) {
        toast.error('Failed updating address!');
        set({ isLoading: false, error: 'Failed updating address' });
        return null;
      }

      const updatedAddresses = get().addresses.map(addr =>
        addr.id === id ? { ...addr, ...response.data.address } : addr
      );

      set({ isLoading: false, addresses: updatedAddresses });
      toast.success('Updated address successfully!');
      return response.data.address;
    } catch (error) {
      console.error("Update address error:", error);
      toast.error("Failed updating address!");
      set({ isLoading: false, error: "Updating address failed" });
      return null;
    }
  },

  deleteAddress: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.delete(
        `${API_ROUTES.ADDRESS}/deleteAddress/${id}`,
        { withCredentials: true } 
      );

      if (response.data.success) {
        const updatedAddresses = get().addresses.filter(addr => addr.id !== id);
        set((state) => ({
            addresses: state.addresses.filter(address => address.id !== id ),
            isLoading: false
        }))
        toast.success('Address deleted successfully!');
        return true;
      }

      set({ isLoading: false, error: 'Failed to delete address' });
      toast.error('Failed to delete address');
      return false;
    } catch (error) {
      console.error("Delete address error:", error);
      set({ isLoading: false, error: "Failed deleting address" });
      toast.error("Failed deleting address");
      return false;
    }
  }
}));