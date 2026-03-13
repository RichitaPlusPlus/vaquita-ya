import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { VaquitaState, Participant, Product, DebtEntry } from '../types';

/**
 * Actions for the Vaquita reducer.
 */
type VaquitaAction =
  | { type: 'SET_SHARING_MODE'; payload: VaquitaState['sharingMode'] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'UPDATE_PARTICIPANT'; payload: { id: string; updates: Partial<Participant> } }
  | { type: 'REMOVE_PARTICIPANT'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'SET_VALUE_WEIGHT'; payload: number }
  | { type: 'ADD_DEBT'; payload: DebtEntry }
  | { type: 'UPDATE_DEBT'; payload: { id: string; updates: Partial<DebtEntry> } }
  | { type: 'HYDRATE_STATE'; payload: VaquitaState }
  | { type: 'RESET_STATE' };

/**
 * Initial state for the Vaquita context.
 */
const initialState: VaquitaState = {
  sharingMode: 'equal',
  totalAmount: 0,
  participants: [],
  products: [],
  valueWeight: 0,
  debtMarket: { debts: [] },
};

/**
 * Reducer function for managing Vaquita state.
 */
function vaquitaReducer(state: VaquitaState, action: VaquitaAction): VaquitaState {
  switch (action.type) {
    case 'SET_SHARING_MODE':
      return { ...state, sharingMode: action.payload };
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] };
    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(p => p.id !== action.payload),
      };
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
        totalAmount: state.totalAmount + action.payload.price * action.payload.quantity,
      };
    case 'UPDATE_PRODUCT':
      const oldProduct = state.products.find(p => p.id === action.payload.id);
      if (!oldProduct) return state;
      const newProduct = { ...oldProduct, ...action.payload.updates };
      const oldValue = oldProduct.price * oldProduct.quantity;
      const newValue = newProduct.price * newProduct.quantity;
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? newProduct : p),
        totalAmount: state.totalAmount - oldValue + newValue,
      };
    case 'REMOVE_PRODUCT':
      const productToRemove = state.products.find(p => p.id === action.payload);
      if (!productToRemove) return state;
      const removeValue = productToRemove.price * productToRemove.quantity;
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        totalAmount: state.totalAmount - removeValue,
      };
    case 'SET_VALUE_WEIGHT':
      return { ...state, valueWeight: action.payload };
    case 'ADD_DEBT':
      return {
        ...state,
        debtMarket: { ...state.debtMarket, debts: [...state.debtMarket.debts, action.payload] },
      };
    case 'UPDATE_DEBT':
      return {
        ...state,
        debtMarket: {
          ...state.debtMarket,
          debts: state.debtMarket.debts.map(d =>
            d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
          ),
        },
      };
    case 'HYDRATE_STATE':
      return action.payload;
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

/**
 * Context for Vaquita state and actions.
 */
const VaquitaContext = createContext<{
  state: VaquitaState;
  dispatch: React.Dispatch<VaquitaAction>;
  calculateSplits: () => void;
  persistenceProvider: () => void;
  transactionHandler: (participantId: string) => void;
} | null>(null);

/**
 * Provider component for Vaquita context.
 */
export const VaquitaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(vaquitaReducer, initialState);

  /**
   * Calculates the splits based on the sharing mode.
   */
  const calculateSplits = () => {
    const { sharingMode, totalAmount, participants, valueWeight } = state;
    let updatedParticipants = [...participants];

    if (sharingMode === 'equal') {
      const share = totalAmount / participants.length;
      updatedParticipants = participants.map(p => ({ ...p, currentBalance: share - p.initialContribution }));
    } else if (sharingMode === 'weighted') {
      // Subtract valueWeight from total, then divide equally
      const adjustedTotal = totalAmount - valueWeight;
      const share = adjustedTotal / participants.length;
      updatedParticipants = participants.map(p => ({ ...p, currentBalance: share - p.initialContribution }));
    } else if (sharingMode === 'debt-negotiation') {
      // Handle debts, but for now, simple equal
      const share = totalAmount / participants.length;
      updatedParticipants = participants.map(p => ({ ...p, currentBalance: share - p.initialContribution }));
    }

    // Dispatch updates
    updatedParticipants.forEach(p => {
      dispatch({ type: 'UPDATE_PARTICIPANT', payload: { id: p.id, updates: { currentBalance: p.currentBalance } } });
    });
  };

  /**
   * Handles persistence to LocalStorage.
   */
  const persistenceProvider = () => {
    // Auto-save to LocalStorage
    try {
      localStorage.setItem('VAQUITA_CORE_DATA', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save to LocalStorage:', error);
    }
  };

  /**
   * Handles transaction for a participant, marking as paid.
   */
  const transactionHandler = (participantId: string) => {
    dispatch({ type: 'UPDATE_PARTICIPANT', payload: { id: participantId, updates: { status: 'paid' } } });
    // Check if all paid, trigger alert
    const allPaid = state.participants.every(p => p.status === 'paid');
    if (allPaid) {
      alert('All participants have paid! Celebration time!');
    }
  };

  // Hydrate on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('VAQUITA_CORE_DATA');
      if (saved) {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'HYDRATE_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error('Failed to hydrate from LocalStorage:', error);
    }
  }, []);

  // Auto-save on state change
  useEffect(() => {
    persistenceProvider();
  }, [state]);

  return (
    <VaquitaContext.Provider value={{ state, dispatch, calculateSplits, persistenceProvider, transactionHandler }}>
      {children}
    </VaquitaContext.Provider>
  );
};

/**
 * Hook to use the Vaquita context.
 */
export const useVaquita = () => {
  const context = useContext(VaquitaContext);
  if (!context) {
    throw new Error('useVaquita must be used within a VaquitaProvider');
  }
  return context;
};