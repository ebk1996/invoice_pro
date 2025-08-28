const express = require('express');
const router = express.Router();


// In-memory demo data
let invoices = [
  {
    id: 1,
    comp_code: 'ACME',
    amount: 100,
    paid: false,
    recurring: false,
    card_last4: '4242',
    auto_bill: false,
    created_at: new Date().toISOString(),
    paid_at: null
  }
];

// GET all invoices
router.get('/', (req, res) => {
  res.json({ invoices });
});

// POST create a new invoice
router.post('/', (req, res) => {
  const { comp_code, amount, recurring } = req.body;
  const newInvoice = {
    id: invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
    comp_code: comp_code || 'NEWCO',
    amount: amount || 0,
    paid: false,
    recurring: !!recurring,
    card_last4: '4242',
    auto_bill: false,
    created_at: new Date().toISOString(),
    paid_at: null
  };
  invoices.push(newInvoice);
  res.status(201).json({ success: true, invoice: newInvoice });
});

// POST mark invoice as paid
router.post('/:id/pay', (req, res) => {
  const invoice = invoices.find(inv => inv.id === parseInt(req.params.id));
  if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
  invoice.paid = true;
  invoice.paid_at = new Date().toISOString();
  res.json({ success: true, invoice });
});

// POST update card info
router.post('/:id/card', (req, res) => {
  const invoice = invoices.find(inv => inv.id === parseInt(req.params.id));
  if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
  const { card_last4 } = req.body;
  invoice.card_last4 = card_last4 || '0000';
  res.json({ success: true, invoice });
});

// POST enable auto-bill
router.post('/:id/auto-bill', (req, res) => {
  const invoice = invoices.find(inv => inv.id === parseInt(req.params.id));
  if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
  invoice.auto_bill = true;
  res.json({ success: true, invoice });
});

// POST toggle recurring
router.post('/:id/toggle-recurring', (req, res) => {
  const invoice = invoices.find(inv => inv.id === parseInt(req.params.id));
  if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
  invoice.recurring = !invoice.recurring;
  res.json({ success: true, invoice });
});

// DELETE invoice
router.delete('/:id', (req, res) => {
  const idx = invoices.findIndex(inv => inv.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, error: 'Invoice not found' });
  const deleted = invoices.splice(idx, 1)[0];
  res.json({ success: true, deleted });
});

// Example POST route for creating an invoice
router.post('/', (req, res) => {
  // In a real app, you'd add invoice creation logic here
  res.status(201).json({ message: 'Invoice created.' });
});

module.exports = router;
