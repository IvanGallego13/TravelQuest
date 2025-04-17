import { create } from "zustand";

// Tipo de los datos de ubicación
type Ubicacion = {
  city: string;
  latitude: number;
  longitude: number;
  imagen: string;
  cityId: number;
};

type UbicacionStore = {
  ubicacion: Ubicacion | null;
  setUbicacion: (valor: Ubicacion) => void;
};

// Store Zustand
export const useUbicacion = create<UbicacionStore>((set) => ({
  ubicacion: null,
  setUbicacion: (valor) => set({ ubicacion: valor }),
}));
