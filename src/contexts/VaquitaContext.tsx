import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { VaquitaState, Participant, Product, DebtEntry } from '../types';
import { useVaquitaEngine } from '../hooks/useVaquitaEngine';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
  | { type: 'UPDATE_PARTICIPANTS_BALANCES'; payload: Participant[] }
  | { type: 'HYDRATE_STATE'; payload: VaquitaState }
  | { type: 'RESET_STATE' }
  | { type: 'SHOW_COMPLETION'; payload: boolean };

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
  showCompletion: false,
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
    case 'UPDATE_PARTICIPANTS_BALANCES':
      return { ...state, participants: action.payload };
    case 'HYDRATE_STATE':
      return action.payload;
    case 'RESET_STATE':
      return initialState;
    case 'SHOW_COMPLETION':
      return { ...state, showCompletion: action.payload };
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
  resetVaquita: () => void;
} | null>(null);

/**
 * Provider component for Vaquita context.
 */
export const VaquitaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(vaquitaReducer, initialState);
  const [storedState, setStoredState, removeStoredState] = useLocalStorage<VaquitaState>('VAQUITA_CORE_DATA', initialState);
  const engine = useVaquitaEngine(state);

  // Hydrate on mount
  useEffect(() => {
    if (storedState && storedState.participants.length > 0) {
      dispatch({ type: 'HYDRATE_STATE', payload: storedState });
    }
  }, [storedState]);

  // Auto-save on state change
  useEffect(() => {
    setStoredState(state);
  }, [state, setStoredState]);

  /**
   * Resets all data and starts a new Vaquita.
   */
  const resetVaquita = () => {
    removeStoredState();
    dispatch({ type: 'RESET_STATE' });
  };

  /**
   * Calculates the splits based on the current sharing mode.
   */
  const calculateSplits = () => {
    let splits: Participant[];
    if (state.sharingMode === 'equal') {
      splits = engine.calculateEqualSplits();
    } else if (state.sharingMode === 'weighted') {
      const payerId = state.participants.find(p => p.initialContribution > 0)?.id || state.participants[0]?.id || '';
      splits = engine.calculateWeightedSplits(state.valueWeight, payerId);
    } else {
      // debt-negotiation: keep current balances or handle differently
      splits = state.participants;
    }
    dispatch({ type: 'UPDATE_PARTICIPANTS_BALANCES', payload: splits });
  };

  /**
   * Forces persistence of the current state.
   */
  const persistenceProvider = () => {
    setStoredState(state);
  };

  /**
   * Handles transaction for a participant, marking as paid.
   */
  const transactionHandler = (participantId: string) => {
    dispatch({ type: 'UPDATE_PARTICIPANT', payload: { id: participantId, updates: { status: 'paid' } } });
    // Check if all paid, trigger completion
    const updatedParticipants = state.participants.map(p =>
      p.id === participantId ? { ...p, status: 'paid' as const } : p
    );
    const allPaid = updatedParticipants.every(p => p.status === 'paid');
    if (allPaid && state.participants.length > 0) {
      dispatch({ type: 'SHOW_COMPLETION', payload: true });
    }
  };

  return (
    <VaquitaContext.Provider value={{ state, dispatch, calculateSplits, persistenceProvider, transactionHandler, resetVaquita }}>
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