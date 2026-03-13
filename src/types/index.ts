/**
 * Represents a participant in the expense sharing.
 */
export interface Participant {
  /** Unique identifier for the participant. */
  id: string;
  /** Name of the participant. */
  name: string;
  /** Initial contribution amount. */
  initialContribution: number;
  /** Current balance owed or credited. */
  currentBalance: number;
  /** Status indicating if the participant has paid or is pending. */
  status: 'paid' | 'pending';
}

/**
 * Represents a product or item in the shared expense.
 */
export interface Product {
  /** Unique identifier for the product. */
  id: string;
  /** Name of the product. */
  name: string;
  /** Price of the product. */
  price: number;
  /** Quantity of the product. */
  quantity: number;
  /** Description of the product. */
  description: string;
  /** Base64 or blob representation of the product image preview. */
  imagePreview?: string;
}

/**
 * Represents the overall state of the Vaquita application.
 */
export interface VaquitaState {
  /** Mode of sharing: equal distribution, weighted, or debt negotiation. */
  sharingMode: 'equal' | 'weighted' | 'debt-negotiation';
  /** Total amount of all products. */
  totalAmount: number;
  /** Array of participants. */
  participants: Participant[];
  /** Array of products. */
  products: Product[];
  /** Logic to subtract pre-paid amounts (e.g., taxi, advance payments). */
  valueWeight: number;
  /** Logic for "Pay Later" including interest rates and negotiation status. */
  debtMarket: DebtMarket;
}

/**
 * Represents the debt market for negotiations.
 */
export interface DebtMarket {
  /** Array of debt entries. */
  debts: DebtEntry[];
}

/**
 * Represents a single debt entry in negotiations.
 */
export interface DebtEntry {
  /** Unique identifier for the debt. */
  id: string;
  /** Original amount owed. */
  originalAmount: number;
  /** Negotiated amount after agreement. */
  negotiatedAmount: number;
  /** Due date for payment. */
  dueDate: Date;
  /** Note about interest or negotiation fee. */
  interestNote: string;
  /** Status of the debt. */
  status: 'pending' | 'agreed' | 'paid';
}