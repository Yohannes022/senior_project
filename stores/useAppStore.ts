import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

type AppState = {
  recentSearches: string[];
  favoriteRoutes: {
    id: string;
    from: string;
    to: string;
  }[];
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  addFavoriteRoute: (route: { from: string; to: string }) => void;
  removeFavoriteRoute: (id: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      recentSearches: [],
      favoriteRoutes: [],
      
      addRecentSearch: (search: string) => set((state) => {
        // Remove duplicate if exists
        const filteredSearches = state.recentSearches.filter(
          (item) => item !== search
        );
        
        // Add to the beginning and limit to 10 items
        return {
          recentSearches: [search, ...filteredSearches].slice(0, 10),
        };
      }),
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      addFavoriteRoute: (route) => set((state) => {
        const newRoute = {
          id: Date.now().toString(),
          from: route.from,
          to: route.to,
        };
        
        return {
          favoriteRoutes: [...state.favoriteRoutes, newRoute],
        };
      }),
      
      removeFavoriteRoute: (id) => set((state) => ({
        favoriteRoutes: state.favoriteRoutes.filter((route) => route.id !== id),
      })),
    }),
    {
      name: "sheger-transit-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
