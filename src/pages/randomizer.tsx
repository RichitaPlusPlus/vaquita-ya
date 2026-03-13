import React, { useState } from "react"
import Layout from "../components/layout"
import { useVaquita } from "../contexts/VaquitaContext"
import { useVaquitaEngine } from "../hooks/useVaquitaEngine"
import Action3DButton from "../components/ui/Action3DButton"

const RandomizerPage = () => {
  const { state, dispatch } = useVaquita()
  const engine = useVaquitaEngine(state)
  const [loser, setLoser] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState('')

  const handleRandomize = () => {
    if (!selectedProduct) return

    const loserId = engine.randomizeTotalLoser(selectedProduct)
    setLoser(loserId)

    // Set everyone else's contribution to $0 for this product
    state.participants.forEach(p => {
      if (p.id !== loserId) {
        // In a real implementation, track per-product contributions
        // For now, just log
        console.log(`${p.name} contribution set to $0 for product ${selectedProduct}`)
      }
    })
  }

  const loserName = loser ? state.participants.find(p => p.id === loser)?.name : null

  return (
    <Layout>
      <h1>Randomizer</h1>
      <p>Coin-flip logic for quick decisions.</p>

      <section>
        <h2>Total Loser Mode</h2>
        <p>Select a product to randomize who pays 100%:</p>

        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', margin: '1rem 0' }}
        >
          <option value="">Choose product</option>
          {state.products.map(p => (
            <option key={p.id} value={p.id}>{p.name} - ${p.price * p.quantity}</option>
          ))}
        </select>

        <Action3DButton label="Flip Coin" onClick={handleRandomize} disabled={!selectedProduct} />

        {loserName && (
          <div style={{ marginTop: '2rem', padding: '2rem', background: '#ff0', border: '4px solid #000', textAlign: 'center' }}>
            <h2>🎉 {loserName} is the TOTAL LOSER! 🎉</h2>
            <p>They pay 100% for the selected product.</p>
            <p>Everyone else: $0 contribution for this item.</p>
          </div>
        )}
      </section>

      <section>
        <h2>Task Assignee Mode</h2>
        <p>Coming soon: Assign tasks like "Make the Mobile Payment" or "Go to the Store".</p>
      </section>
    </Layout>
  )
}

export default RandomizerPage