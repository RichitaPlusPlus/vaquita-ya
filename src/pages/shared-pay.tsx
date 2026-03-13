import React, { useState } from "react"
import Layout from "../components/layout"
import { useVaquita } from "../contexts/VaquitaContext"
import { useVaquitaEngine } from "../hooks/useVaquitaEngine"
import Action3DButton from "../components/ui/Action3DButton"
import StatusToggle from "../components/ui/StatusToggle"
import NeubrutalistForm from "../components/ui/NeubrutalistForm"
import ContributionSlider from "../components/ui/ContributionSlider"
import SmartChecklist from "../components/ui/SmartChecklist"
import Dropzone from "../components/ui/Dropzone"

const SharedPayPage = () => {
  const { state, dispatch, calculateSplits, transactionHandler, resetVaquita } = useVaquita()
  const engine = useVaquitaEngine(state)
  const [productImage, setProductImage] = useState('')

  const handleAddParticipant = (name: string) => {
    const newParticipant = {
      id: Date.now().toString(),
      name,
      initialContribution: 0,
      currentBalance: 0,
      status: 'pending' as const,
    }
    dispatch({ type: 'ADD_PARTICIPANT', payload: newParticipant })
  }

  const handleAddProduct = (name: string) => {
    const newProduct = {
      id: Date.now().toString(),
      name,
      price: 10, // default
      quantity: 1,
      description: '',
      imagePreview: productImage,
    }
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct })
    setProductImage('')
  }

  const checklistItems = state.products.map(p => ({
    id: p.id,
    label: `${p.name} - $${p.price * p.quantity}`,
    checked: false, // or some logic
  }))

  return (
    <Layout>
      <h1>Shared Pay</h1>
      <p>Expense splitting module.</p>

      <section>
        <h2>Add Participant</h2>
        <NeubrutalistForm onSubmit={handleAddParticipant} placeholder="Participant name" buttonLabel="Add Participant" />
      </section>

      <section>
        <h2>Add Product</h2>
        <Dropzone onImageSelect={setProductImage} currentImage={productImage} />
        <NeubrutalistForm onSubmit={handleAddProduct} placeholder="Product name" buttonLabel="Add Product" />
        <p style={{ fontSize: '0.8rem', color: '#666' }}>Images are compressed and stored locally. They won't persist if browser cache is cleared.</p>
      </section>

      <section>
        <h2>Participants</h2>
        {state.participants.map(p => (
          <div key={p.id}>
            <StatusToggle
              checked={p.status === 'paid'}
              onChange={(checked) => transactionHandler(p.id)}
              label={`${p.name} - Balance: $${p.currentBalance.toFixed(2)}`}
            />
            <ContributionSlider
              value={50} // placeholder
              onChange={(value) => console.log(value)}
              label="Weight"
            />
          </div>
        ))}
      </section>

      <section>
        <h2>Products</h2>
        <SmartChecklist items={checklistItems} onToggle={(id, checked) => console.log(id, checked)} />
      </section>

      <Action3DButton label="Calculate Splits" onClick={calculateSplits} />
      <Action3DButton label="Reset Vaquita" onClick={resetVaquita} />
    </Layout>
  )
}

export default SharedPayPage