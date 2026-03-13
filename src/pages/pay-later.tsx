import React, { useState } from "react"
import Layout from "../components/layout"
import { useVaquita } from "../contexts/VaquitaContext"
import NegotiationPanel from "../components/ui/NegotiationPanel"
import ReceiptModal from "../components/ui/ReceiptModal"
import Action3DButton from "../components/ui/Action3DButton"

const PayLaterPage = () => {
  const { state } = useVaquita()
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [organizerName, setOrganizerName] = useState('Organizer')

  return (
    <Layout>
      <h1>Pay Later</h1>
      <p>Negotiation module for debts with interest rate inputs.</p>

      <section>
        <h2>Debt Negotiations</h2>
        <Action3DButton label="Start Negotiation" onClick={() => setShowNegotiation(true)} />

        <div style={{ marginTop: '1rem' }}>
          <h3>Current Debts</h3>
          {state.debtMarket.debts.map(debt => (
            <div key={debt.id} style={{ margin: '0.5rem 0', padding: '0.5rem', border: '2px solid #000' }}>
              Original: ${debt.originalAmount.toFixed(2)} | Negotiated: ${debt.negotiatedAmount.toFixed(2)} | Interest: ${(debt.negotiatedAmount - debt.originalAmount).toFixed(2)}
              <br />Due: {debt.dueDate.toDateString()} | Note: {debt.interestNote}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Generate Receipt</h2>
        <input
          type="text"
          value={organizerName}
          onChange={(e) => setOrganizerName(e.target.value)}
          placeholder="Organizer name"
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <Action3DButton label="Generate Receipt" onClick={() => setShowReceipt(true)} />
      </section>

      {showNegotiation && <NegotiationPanel onClose={() => setShowNegotiation(false)} />}
      {showReceipt && <ReceiptModal onClose={() => setShowReceipt(false)} organizerName={organizerName} externalExpenses={state.valueWeight} />}
    </Layout>
  )
}

export default PayLaterPage