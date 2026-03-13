import React, { useState } from 'react';
import Layout from '../components/layout';
import Action3DButton from '../components/ui/Action3DButton';
import StatusToggle from '../components/ui/StatusToggle';
import NeubrutalistForm from '../components/ui/NeubrutalistForm';
import ContributionSlider from '../components/ui/ContributionSlider';
import SmartChecklist from '../components/ui/SmartChecklist';
import styles from './gallery.module.css';

/**
 * Gallery page to preview all 3D UI components.
 */
const Gallery = () => {
  const [toggleChecked, setToggleChecked] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [checklistItems, setChecklistItems] = useState([
    { id: '1', label: 'Pizza', checked: false },
    { id: '2', label: 'Drinks', checked: true },
    { id: '3', label: 'Dessert', checked: false },
  ]);

  const handleFormSubmit = (value: string) => {
    alert(`Form submitted: ${value}`);
  };

  const handleChecklistToggle = (id: string, checked: boolean) => {
    setChecklistItems(items =>
      items.map(item => item.id === id ? { ...item, checked } : item)
    );
  };

  return (
    <Layout>
      <div className={styles.gallery}>
        <h1>3D UI Component Gallery</h1>

        <section className={styles.section}>
          <h2>Action3DButton</h2>
          <Action3DButton label="Click Me!" onClick={() => alert('Button clicked!')} />
        </section>

        <section className={styles.section}>
          <h2>StatusToggle</h2>
          <StatusToggle
            checked={toggleChecked}
            onChange={setToggleChecked}
            label="Paid Status"
          />
        </section>

        <section className={styles.section}>
          <h2>NeubrutalistForm</h2>
          <NeubrutalistForm
            onSubmit={handleFormSubmit}
            placeholder="Enter participant name"
            buttonLabel="Add"
          />
        </section>

        <section className={styles.section}>
          <h2>ContributionSlider</h2>
          <ContributionSlider
            value={sliderValue}
            onChange={setSliderValue}
            label="Contribution Percentage"
          />
        </section>

        <section className={styles.section}>
          <h2>SmartChecklist</h2>
          <SmartChecklist
            items={checklistItems}
            onToggle={handleChecklistToggle}
          />
        </section>
      </div>
    </Layout>
  );
};

export default Gallery;