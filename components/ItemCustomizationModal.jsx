'use client';

import { useState, useEffect } from 'react';

/**
 * Bottom sheet / Modal for customizing a menu item.
 */
export default function ItemCustomizationModal({ item, isOpen, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Reset selections when item changes or modal opens
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSpecialInstructions('');
      
      const initial = {};
      item.options?.forEach((group) => {
        if (group.type === 'radio') {
          // Select first option by default for radio
          initial[group.name] = group.options[0];
        } else {
          initial[group.name] = [];
        }
      });
      setSelectedOptions(initial);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleRadioChange = (groupName, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupName]: option,
    }));
  };

  const handleCheckboxChange = (groupName, option) => {
    setSelectedOptions((prev) => {
      const current = prev[groupName] || [];
      const exists = current.some((o) => o.name === option.name);
      const updated = exists
        ? current.filter((o) => o.name !== option.name)
        : [...current, option];
      return {
        ...prev,
        [groupName]: updated,
      };
    });
  };

  const calculateItemPrice = () => {
    let price = item.price;
    Object.values(selectedOptions).forEach((val) => {
      if (Array.isArray(val)) {
        val.forEach((o) => { price += o.price || 0; });
      } else if (val?.price) {
        price += val.price;
      }
    });
    return price;
  };

  const totalItemPrice = calculateItemPrice() * quantity;

  const handleAddToCart = () => {
    onAdd({
      ...item,
      quantity,
      selectedOptions,
      specialInstructions,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="cart-backdrop"
        onClick={onClose}
        style={{ zIndex: 1010 }}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '540px',
          background: '#121212',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: 'none',
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
          fontFamily: 'var(--font-body)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
              Customize Item
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {/* Item Info */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }}
              />
            )}
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{item.name}</h4>
              <p style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>{item.description}</p>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-habesha-green)', marginTop: '0.5rem', marginBlockEnd: 0 }}>AED {item.price}</p>
            </div>
          </div>

          {/* Option Groups */}
          {item.options?.map((group) => (
            <div key={group.name} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>{group.name}</h5>
                {group.required ? (
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-habesha-gold)', textTransform: 'uppercase', background: 'rgba(252, 217, 0, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Required</span>
                ) : (
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Optional</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {group.options.map((opt) => {
                  const isSelected = group.type === 'radio'
                    ? selectedOptions[group.name]?.name === opt.name
                    : (selectedOptions[group.name] || []).some((o) => o.name === opt.name);

                  return (
                    <label
                      key={opt.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: isSelected ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                        border: `1px solid ${isSelected ? 'var(--color-habesha-green)' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type={group.type}
                          name={group.name}
                          checked={isSelected}
                          onChange={() =>
                            group.type === 'radio'
                              ? handleRadioChange(group.name, opt)
                              : handleCheckboxChange(group.name, opt)
                          }
                          style={{
                            accentColor: 'var(--color-habesha-green)',
                            cursor: 'pointer',
                          }}
                        />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{opt.name}</span>
                      </div>
                      {opt.price > 0 && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--color-habesha-green)', fontWeight: 700 }}>
                          + AED {opt.price}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.5rem' }}>Special Instructions</h5>
            <textarea
              placeholder="E.g. allergy warnings, spicy level adjustments, no onions..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              style={{
                width: '100%',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '0.75rem',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                resize: 'none',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)',
            borderBottomLeftRadius: '28px',
            borderBottomRightRadius: '28px',
          }}
        >
          {/* Quantity Controls */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              style={{ background: 'none', border: 'none', color: '#fff', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              −
            </button>
            <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 700, fontSize: '0.9375rem' }}>{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              style={{ background: 'none', border: 'none', color: '#fff', width: '36px', height: '36px', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              +
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddToCart}
            className="shiny-btn"
            style={{ padding: '0.75rem 2rem', fontSize: '0.9375rem' }}
          >
            Add to Cart · AED {totalItemPrice}
          </button>
        </div>
      </div>
    </>
  );
}
