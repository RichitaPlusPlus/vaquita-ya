import React, { useState } from "react"
import Layout from "../components/layout"
import { useVaquita } from "../contexts/VaquitaContext"
import { useVaquitaEngine } from "../hooks/useVaquitaEngine"
import Action3DButton from "../components/ui/Action3DButton"
import NeubrutalistForm from "../components/ui/NeubrutalistForm"

const ValueWeightPage = () => {
  const { state, dispatch } = useVaquita()
  const engine = useVaquitaEngine(state)
  const [externalExpenses, setExternalExpenses] = useState('')
  const [payerId, setPayerId] = useState('')

  const handleSetValueWeight = () => {
    const amount = parseFloat(externalExpenses)
    if (isNaN(amount) || !payerId) return

    dispatch({ type: 'SET_VALUE_WEIGHT', payload: amount })

    // Calculate new splits
    const updatedParticipants = engine.calculateValueWeight(amount, payerId)
    updatedParticipants.forEach(p => {
      dispatch({ type: 'UPDATE_PARTICIPANT', payload: { id: p.id, updates: { currentBalance: p.currentBalance } } })
    })

    // Reset
    setExternalExpenses('')
    setPayerId('')
  }

  return (
    <Layout>
      <h1>Value Weight</h1>
      <p>Justify and subtract previous expenses from the total.</p>

      <section>
        <h2>Set External Expenses</h2>
        <p>Total Product Cost (T): ${state.totalAmount.toFixed(2)}</p>
        <NeubrutalistForm
          onSubmit={(value) => setExternalExpenses(value)}
          placeholder="External expenses (e.g., taxi)"
          buttonLabel="Set Amount"
        />

        <div style={{ margin: '1rem 0' }}>
          <label>Select who paid:</label>
          <select
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          >
            <option value="">Choose participant</option>
            {state.participants.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <Action3DButton label="Apply Value Weight" onClick={handleSetValueWeight} />

        {externalExpenses && payerId && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#ff0', border: '2px solid #000' }}>
            <p>Global Debt (D) = T + E = ${state.totalAmount.toFixed(2)} + ${externalExpenses} = ${(state.totalAmount + parseFloat(externalExpenses)).toFixed(2)}</p>
            <p>Individual Share (S) = D / {state.participants.length} = ${(state.totalAmount + parseFloat(externalExpenses)) / state.participants.length}</p>
            <p>The payer's new share will be adjusted accordingly.</p>
          </div>
        )}
      </section>

      <section>
        <h2>Current Balances</h2>
        {state.participants.map(p => (
          <div key={p.id} style={{ margin: '0.5rem 0', padding: '0.5rem', border: '2px solid #000' }}>
            {p.name}: ${p.currentBalance.toFixed(2)} {p.currentBalance <= 0 ? '(Creditor)' : ''}
          </div>
        ))}
      </section>
    </Layout>
  )
}

export default ValueWeightPage