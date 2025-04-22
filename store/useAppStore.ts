import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location, Route, Ticket, User, RideHistory } from '@/types';
import { sampleRoutes, sampleTickets, rideHistory, suggestedLocations } from '@/mocks/transitData';

interface AppState {
  // User
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Location
  currentLocation: Location | null;
  setCurrentLocation: (location: Location) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Location[];
  setSearchResults: (results: Location[]) => void;
  recentSearches: Location[];
  addRecentSearch: (location: Location) => void;
  
  // Routes
  selectedRoute: Route | null;
  setSelectedRoute: (route: Route | null) => void;
  availableRoutes: Route[];
  setAvailableRoutes: (routes: Route[]) => void;
  
  // Tickets
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  removeTicket: (ticketId: string) => void;
  
  // Ride History
  rideHistory: RideHistory[];
  addRideHistory: (ride: RideHistory) => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      login: async (email, password) => {
        // Mock login
        if (email && password) {
          set({
            user: {
              id: '1',
              name: 'Abebe Kebede',
              email,
              profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
              favoriteLocations: suggestedLocations,
              paymentMethods: [
                {
                  id: 'pm1',
                  type: 'card',
                  lastFour: '4242',
                  expiryDate: '12/25',
                  isDefault: true
                },
                {
                  id: 'pm2',
                  type: 'telebirr',
                  isDefault: false
                }
              ]
            },
            isLoggedIn: true
          });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isLoggedIn: false }),
      
      // Location
      currentLocation: null,
      setCurrentLocation: (location) => set({ currentLocation: location }),
      
      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),
      recentSearches: [],
      addRecentSearch: (location) => {
        const current = get().recentSearches;
        const filtered = current.filter(item => item.name !== location.name);
        set({ recentSearches: [location, ...filtered].slice(0, 5) });
      },
      
      // Routes
      selectedRoute: null,
      setSelectedRoute: (route) => set({ selectedRoute: route }),
      availableRoutes: sampleRoutes,
      setAvailableRoutes: (routes) => set({ availableRoutes: routes }),
      
      // Tickets
      tickets: sampleTickets,
      addTicket: (ticket) => set(state => ({ tickets: [ticket, ...state.tickets] })),
      removeTicket: (ticketId) => set(state => ({
        tickets: state.tickets.filter(ticket => ticket.id !== ticketId)
      })),
      
      // Ride History
      rideHistory: rideHistory,
      addRideHistory: (ride) => set(state => ({
        rideHistory: [ride, ...state.rideHistory]
      })),
      
      // Theme
      isDarkMode: true,
      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode }))
    }),
    {
      name: 'transit-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        recentSearches: state.recentSearches,
        tickets: state.tickets,
        rideHistory: state.rideHistory,
        isDarkMode: state.isDarkMode
      })
    }
  )
);

export default useAppStore;