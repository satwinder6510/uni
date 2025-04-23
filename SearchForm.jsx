// src/components/SearchForm.jsx
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

export default function SearchForm({ onSearch }) {
  const [mode, setMode] = useState('oneway');
  const [legs, setLegs] = useState([{ from: 'LHR', to: 'JFK' }]);
  const [stays, setStays] = useState([]);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));

  // When mode changes, reset legs/stays appropriately
  useEffect(() => {
    if (mode === 'multicity' && legs.length < 2) {
      setLegs(l => [...l, { from: l[0].to, to: '' }]);
      setStays(s => (s.length ? s : [1]));
    }
    if (mode !== 'multicity') {
      setLegs([{ from: legs[0].from, to: legs[0].to }]);
      setStays([]);
    }
  }, [mode]);

  // Update a leg (from/to)
  const handleLeg = (i, field, val) => {
    setLegs(l => {
      const copy = [...l];
      copy[i] = { ...copy[i], [field]: val.toUpperCase() };
      return copy;
    });
  };

  // Update number of nights for multi-city stays
  const handleStay = (i, val) => {
    const v = parseInt(val, 10) || 0;
    setStays(s => {
      const copy = [...s];
      copy[i] = v;
      return copy;
    });
  };

  // Add or remove legs (only for multi-city)
  const addLeg = () => {
    setLegs(l => [...l, { from: l[l.length - 1].to, to: '' }]);
    setStays(s => [...s, 1]);
  };
  const removeLeg = i => {
    setLegs(l => l.filter((_, idx) => idx !== i));
    setStays(s => s.slice(0, l.length - 1));
  };

  // On form submit, validate and fire onSearch()
  const submit = e => {
    e.preventDefault();
    if (mode === 'multicity' && stays.length !== legs.length - 1) {
      alert('Please set a stay duration for each leg.');
      return;
    }
    const payload = { mode, legs, stays, month };
    onSearch(payload);
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        margin: '1rem 0'
      }}
    >
      {/* Mode selector */}
      <select value={mode} onChange={e => setMode(e.target.value)}>
        <option value="oneway">One-way</option>
        <option value="roundtrip">Return</option>
        <option value="multicity">Multi-city</option>
      </select>

      {/* From/To inputs for each leg */}
      {legs.map((leg, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
        >
          <input
            placeholder="From"
            value={leg.from}
            onChange={e => handleLeg(i, 'from', e.target.value)}
            style={{ width: '60px' }}
          />
          <input
            placeholder="To"
            value={leg.to}
            onChange={e => handleLeg(i, 'to', e.target.value)}
            style={{ width: '60px' }}
          />
          {mode === 'multicity' && legs.length > 2 && i > 0 && (
            <button type="button" onClick={() => removeLeg(i)}>
              ✕
            </button>
          )}
        </div>
      ))}

      {/* Nights at each stop (only multi-city) */}
      {mode === 'multicity' &&
        stays.map((stay, i) => (
          <input
            key={i}
            type="number"
            min="1"
            placeholder="Stay nights"
            value={stays[i]}
            onChange={e => handleStay(i, e.target.value)}
            style={{ width: '80px' }}
          />
        ))}

      {/* Add another leg button */}
      {mode === 'multicity' && (
        <button type="button" onClick={addLeg}>
          + Add Leg
        </button>
      )}

      {/* Month picker */}
      <input
        type="month"
        value={month}
        onChange={e => setMonth(e.target.value)}
        style={{ width: '140px' }}
      />

      {/* Submit */}
      <button type="submit">Search</button>
    </form>
  );
}

