// lib/processor.test.js
import { scoreLead, classify } from './processor'

describe('scoreLead', () => {
  it('returns 0 for a completely empty lead', () => {
    // No data at all → no points. Establishes the floor.
    expect(scoreLead({})).toBe(0)
  })

  it('awards points per the scoring rules for a fully-loaded lead', () => {
    // Build a lead that hits the main point sources, then check the total
    // against the table by hand:
    //   email 30 + founder 20 + website 10 + phone 10
    //   + rating 4.9 (>=4.8) = 15
    //   + 60 reviews (>=50)  = 10
    //   + categorised        = 5
    //   = 100
    const lead = {
      emails: 'a@b.com',
      founder_name: 'Jane Doe',
      website: 'example.com',
      phone: '0400000000',
      totalScore: '4.9',
      reviewsCount: '60',
      _category: 'Investment BA',
    }
    expect(scoreLead(lead)).toBe(100)
  })

  it('scores email and founder name independently', () => {
    // Just an email → 30. Proves the email branch fires on its own,
    // not only as part of a full lead.
    expect(scoreLead({ emails: 'a@b.com' })).toBe(30)
    // Just a founder name → 20.
    expect(scoreLead({ founder_name: 'Jane Doe' })).toBe(20)
  })

  it('does not award the category bonus for EXCLUDED or Uncategorised', () => {
    // The +5 only applies to real categories. These two sentinel values
    // must NOT earn it — a branch worth locking down.
    expect(scoreLead({ _category: 'EXCLUDED' })).toBe(0)
    expect(scoreLead({ _category: 'Uncategorised' })).toBe(0)
  })
})

describe('classify', () => {
  it('excludes a mortgage broker with no buyers-agent signal', () => {
    // "mortgage broker" is a hard-exclude keyword, and nothing here counts
    // as a buyers-agent signal → must be EXCLUDED.
    const row = { title: 'Smith Mortgage Brokers', categoryName: 'Mortgage broker' }
    expect(classify(row, 'mortgage broker sydney')).toBe('EXCLUDED')
  })

  it('keeps a genuine buyers agent that also mentions an excluded term', () => {
    // This is the key bit of cleverness: the title has a "good" signal
    // (buyers agent), so even though "mortgage" appears, the good signal
    // overrides the exclusion and it is NOT excluded.
    const row = { title: 'ABC Buyers Agency', categoryName: 'Buyer agent service' }
    expect(classify(row, 'buyers agent sydney')).not.toBe('EXCLUDED')
  })

  it('does not let the source term rescue a finance company from exclusion', () => {
    // The exclusion text deliberately ignores sourceName. So even if the
    // SEARCH was "buyers agent", a pure mortgage business stays EXCLUDED —
    // the source can't smuggle in a fake "good" signal.
    const row = { title: 'QuickLoans Finance', categoryName: 'Loan agency' }
    expect(classify(row, 'buyers agent melbourne')).toBe('EXCLUDED')
  })

  it('classifies an SMSF-focused buyers agent into the SMSF category', () => {
    // Has a good signal (not excluded) and an SMSF keyword → SMSF category.
    const row = { title: 'SMSF Property Buyers Agent', categoryName: '' }
    expect(classify(row, 'smsf buyers agent')).toBe('SMSF')
  })

  it('falls back to a source hint when nothing else matches', () => {
    // No category keywords in the row itself, but the source search hints
    // "investment" → Investment BA via the fallback path.
    const row = { title: 'Generic Buyers Agency', categoryName: '' }
    expect(classify(row, 'investment buyers agent')).toBe('Investment BA')
  })
})