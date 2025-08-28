
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ comp_code: '', amount: '', recurring: false });
  const [cardUpdate, setCardUpdate] = useState({});
  const [message, setMessage] = useState(null);

  // Fetch invoices
  const fetchInvoices = () => {
    setLoading(true);
    fetch('/api/invoices')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setInvoices(data.invoices);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Create new invoice
  const handleCreate = e => {
    e.preventDefault();
    fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comp_code: form.comp_code,
        amount: Number(form.amount),
        recurring: form.recurring
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Invoice created!');
          setForm({ comp_code: '', amount: '', recurring: false });
          fetchInvoices();
        } else {
          setMessage('Error creating invoice.');
        }
        setTimeout(() => setMessage(null), 2000);
      });
  };

  // Mark invoice as paid
  const handlePay = id => {
    fetch(`/api/invoices/${id}/pay`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessage('Invoice marked as paid!');
        else setMessage('Error marking as paid.');
        fetchInvoices();
        setTimeout(() => setMessage(null), 2000);
      });
  };

  // Enable auto-bill
  const handleAutoBill = id => {
    fetch(`/api/invoices/${id}/auto-bill`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessage('Auto-bill enabled!');
        else setMessage('Error enabling auto-bill.');
        fetchInvoices();
        setTimeout(() => setMessage(null), 2000);
      });
  };

  // Update card
  const handleCardUpdate = (id, last4) => {
    fetch(`/api/invoices/${id}/card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_last4: last4 })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessage('Card updated!');
        else setMessage('Error updating card.');
        setCardUpdate({ ...cardUpdate, [id]: '' });
        fetchInvoices();
        setTimeout(() => setMessage(null), 2000);
      });
  };

  // Toggle recurring
  const handleToggleRecurring = id => {
    fetch(`/api/invoices/${id}/toggle-recurring`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessage('Recurring status toggled!');
        else setMessage('Error toggling recurring.');
        fetchInvoices();
        setTimeout(() => setMessage(null), 2000);
      });
  };

  // Delete invoice
  const handleDelete = id => {
    if (!window.confirm('Delete this invoice?')) return;
    fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessage('Invoice deleted!');
        else setMessage('Error deleting invoice.');
        fetchInvoices();
        setTimeout(() => setMessage(null), 2000);
      });
  };

  if (loading) return <div>Loading invoices...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="App">
      <h1>Invoices Demo</h1>

      {message && <div style={{ background: '#e0ffe0', color: '#222', padding: 8, marginBottom: 12, borderRadius: 4 }}>{message}</div>}

      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          placeholder="Company Code"
          value={form.comp_code}
          onChange={e => setForm({ ...form, comp_code: e.target.value })}
          required
        />
        <input
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
          required
        />
        <label style={{ marginLeft: 8 }}>
          <input
            type="checkbox"
            checked={form.recurring}
            onChange={e => setForm({ ...form, recurring: e.target.checked })}
          />
          Recurring
        </label>
        <button type="submit" style={{ marginLeft: 8 }}>Create Invoice</button>
      </form>

      {invoices.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {invoices.map(invoice => (
            <li key={invoice.id} style={{ border: '1px solid #ccc', margin: 8, padding: 12, borderRadius: 8, background: invoice.paid ? '#f0f0f0' : '#fff' }}>
              <div><b>ID:</b> {invoice.id} | <b>Company:</b> {invoice.comp_code} | <b>Amount:</b> ${invoice.amount}</div>
              <div><b>Created:</b> {invoice.created_at ? new Date(invoice.created_at).toLocaleString() : '-'}</div>
              <div><b>Paid:</b> {invoice.paid ? '✅' : '❌'} <button disabled={invoice.paid} onClick={() => handlePay(invoice.id)}>Mark Paid</button> {invoice.paid_at && <span style={{ marginLeft: 8 }}>(Paid at: {new Date(invoice.paid_at).toLocaleString()})</span>}</div>
              <div><b>Recurring:</b> {invoice.recurring ? 'Yes' : 'No'} <button onClick={() => handleToggleRecurring(invoice.id)}>Toggle</button></div>
              <div><b>Card Last 4:</b> {invoice.card_last4}</div>
              <div>
                <input
                  placeholder="New Card Last 4"
                  value={cardUpdate[invoice.id] || ''}
                  maxLength={4}
                  style={{ width: 60 }}
                  onChange={e => setCardUpdate({ ...cardUpdate, [invoice.id]: e.target.value })}
                />
                <button onClick={() => handleCardUpdate(invoice.id, cardUpdate[invoice.id] || '0000')}>Update Card</button>
              </div>
              <div><b>Auto-bill:</b> {invoice.auto_bill ? 'Enabled' : 'Disabled'} <button disabled={invoice.auto_bill} onClick={() => handleAutoBill(invoice.id)}>Enable Auto-bill</button></div>
              <div><button style={{ marginTop: 8, color: 'red' }} onClick={() => handleDelete(invoice.id)}>Delete</button></div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No invoices found.</p>
      )}
    </div>
  );
}

export default App;