import { useMemo } from 'react';
import currency from 'currency.js';
import { VaquitaState, Participant, Product, DebtEntry } from '../types';

/**
 * Custom hook for Vaquita financial engine calculations.
 */
export const useVaquitaEngine = (state: VaquitaState) => {
  /**
   * Calculates the value weight deductions.
   * @param externalExpenses - Total external expenses (e.g., taxi)
   * @param payerId - ID of the participant who paid the external expenses
   * @returns Updated participants with adjusted balances
   */
  const calculateValueWeight = useMemo(() => (externalExpenses: number, payerId: string): Participant[] => {
    const totalProducts = currency(state.totalAmount);
    const external = currency(externalExpenses);
    const globalDebt = totalProducts.add(external);
    const numParticipants = state.participants.length;
    const baseShare = globalDebt.divide(numParticipants);

    return state.participants.map(p => {
      let adjustedShare = baseShare;
      if (p.id === payerId) {
        adjustedShare = baseShare.subtract(external);
        if (adjustedShare.value <= 0) {
          // Mark as creditor
          return { ...p, currentBalance: adjustedShare.value, status: 'paid' as const };
        }
      }
      return { ...p, currentBalance: adjustedShare.value };
    });
  }, [state.totalAmount, state.participants]);

  /**
   * Calculates equal distribution splits.
   * @returns Participants with equal shares
   */
  const calculateEqualSplits = useMemo(() => (): Participant[] => {
    const share = currency(state.totalAmount).divide(state.participants.length);
    return state.participants.map(p => ({
      ...p,
      currentBalance: share.value,
    }));
  }, [state.totalAmount, state.participants]);

  /**
   * Calculates weighted splits based on value weight.
   * @param valueWeight - The deduction amount
   * @param payerId - Who paid the value weight
   * @returns Participants with weighted shares
   */
  const calculateWeightedSplits = useMemo(() => (valueWeight: number, payerId: string): Participant[] => {
    return calculateValueWeight(valueWeight, payerId);
  }, [calculateValueWeight]);

  /**
   * Handles debt negotiation logic.
   * @param debt - The debt entry
   * @returns Processed debt with interest calculation
   */
  const processDebtNegotiation = (debt: DebtEntry): DebtEntry & { interest: number } => {
    const original = currency(debt.originalAmount);
    const negotiated = currency(debt.negotiatedAmount);
    const interest = negotiated.subtract(original).value;
    return { ...debt, interest };
  };

  /**
   * Randomizes a "total loser" for a specific product.
   * @param productId - The product to randomize for
   * @returns The loser participant ID
   */
  const randomizeTotalLoser = (productId: string): string => {
    const availableParticipants = state.participants.filter(p => p.status === 'pending');
    if (availableParticipants.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * availableParticipants.length);
    return availableParticipants[randomIndex].id;
  };

  /**
   * Generates a formatted receipt string.
   * @param organizerName - Name of the organizer
   * @param externalExpenses - External expenses amount
   * @returns Formatted receipt string
   */
  const generateVaquitaReceipt = (organizerName: string, externalExpenses: number = 0): string => {
    const totalProducts = currency(state.totalAmount);
    const external = currency(externalExpenses);
    const total = totalProducts.add(external);

    let receipt = `--- 🐮 VAQUITA-YA RECEIPT ---\n`;

    state.products.forEach(product => {
      const productTotal = currency(product.price).multiply(product.quantity);
      receipt += `Product: ${product.name} | Total: $${productTotal.format()}\n`;
    });

    if (externalExpenses > 0) {
      receipt += `Adjustments (Taxi/Extras): $${external.format()}\n`;
    }

    receipt += `---------------------------\n`;

    state.participants.forEach(p => {
      const balance = currency(p.currentBalance);
      const debtNote = state.debtMarket.debts.find(d => d.id === p.id) ? ' (Paid via Debt Negotiation)' : '';
      receipt += `${p.name}: $${balance.format()}${debtNote}\n`;
    });

    receipt += `---------------------------\n`;
    receipt += `Total Collected: $${total.format()}\n`;
    receipt += `Organized by: ${organizerName}\n`;
    receipt += `---------------------------`;

    return receipt;
  };

  return {
    calculateValueWeight,
    calculateEqualSplits,
    calculateWeightedSplits,
    processDebtNegotiation,
    randomizeTotalLoser,
    generateVaquitaReceipt,
  };
};