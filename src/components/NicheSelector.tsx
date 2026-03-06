import { useState } from 'react'

const PLATFORM_OPTIONS = ['Etsy', 'Amazon', 'Shopify', 'TikTok Shop', 'Redbubble', 'Not sure yet']
const STYLE_OPTIONS = ['Minimalist', 'Boho', 'Cottage Core', 'Modern', 'Vintage', 'Kawaii', 'Maximalist', 'Neutral']
const SKILL_OPTIONS = ['Illustration / Digital Art', 'Canva Design', 'Procreate', 'Sewing / Fabric', 'Paper Crafts', 'Photography', 'Calligraphy', 'No specific skill yet']

export default function NicheSelector() {
  const [platform, setPlatform] = useState('')
  const [style, setStyle] = useState('')
  const [skill, setSkill] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const canSubmit = platform && style && skill

  const analyze = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError('')
    setResult(null)

    const prompt = `You are an expert Etsy and print-on-demand business strategist with deep knowledge of trending niches.

A seller has these preferences:
- Platform: ${platform}
- Style aesthetic: ${style}
- Main skill: ${skill}
${keyword ? `- They're interested in: ${keyword}` : ''}

Analyze this combination and respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) in this exact format:
{
  "niche": "The specific niche name (2-5 words)",
  "tagline": "One punchy sentence describing the opportunity",
  "demand_score": 85,
  "competition_score": 62,
  "profit_score": 78,
  "demand_insight": "2 sentences about buyer demand for this niche",
  "competition_insight": "2 sentences about competition level and how to stand out",
  "profit_insight": "2 sentences about pricing power and profit potential",
  "product_ideas": ["Product idea 1", "Product idea 2", "Product idea 3", "Product idea 4"],
  "winning_angle": "The specific angle or differentiator that will make this seller win in this niche",
  "tip": "One contrarian or non-obvious tip for this niche"
}`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      const data = await response.json()
      const text = data.content?.map((b: any) => b.text || '').join('') || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setPlatform('')
    setStyle('')
    setSkill('')
    setKeyword('')
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.badge}>Nunu Creator Club</div>
        <h1 style={styles.title}>
          <span style={styles.titleItalic}>Niche</span> Selector
        </h1>
        <p style={styles.subtitle}>Find your perfect product niche in seconds</p>
      </div>

      {!result ? (
        <div style={styles.card}>
          <div style={styles.field}>
            <label style={styles.label}>Where do you want to sell?</label>
            <div style={styles.chipRow}>
              {PLATFORM_OPTIONS.map(p => (
                <button key={p} onClick={() => setPlatform(p)} style={{ ...styles.chip, ...(platform === p ? styles.chipActive : {}) }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Your design aesthetic</label>
            <div style={styles.chipRow}>
              {STYLE_OPTIONS.map(s => (
                <button key={s} onClick={() => setStyle(s)} style={{ ...styles.chip, ...(style === s ? styles.chipActive : {}) }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Your main skill or tool</label>
            <div style={styles.chipRow}>
              {SKILL_OPTIONS.map(s => (
                <button key={s} onClick={() => setSkill(s)} style={{ ...styles.chip, ...(skill === s ? styles.chipActive : {}) }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Any topic or interest? <span style={styles.optional}>(optional)</span></label>
            <input type="text" placeholder="e.g. weddings, pets, astrology..." value={keyword} onChange={e => setKeyword(e.target.value)} style={styles.input} />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button onClick={analyze} disabled={!canSubmit || loading} style={{ ...styles.btn, ...(!canSubmit || loading ? styles.btnDisabled : {}) }}>
            {loading ? 'Analyzing your niche...' : '✦ Find My Niche'}
          </button>
        </div>
      ) : (
        <div style={styles.resultWrapper}>
          <div style={styles.resultHero}>
            <div style={styles.resultBadge}>Your Niche</div>
            <h2 style={styles.nicheName}>{result.niche}</h2>
            <p style={styles.nicheTagline}>{result.tagline}</p>
            <div style={styles.scores}>
              {[
                { label: 'Demand', score: result.demand_score, color: '#5e8b63' },
                { label: 'Low Competition', score: result.competition_score, color: '#8aab8e' },
                { label: 'Profit Potential', score: result.profit_score, color: '#2d2d2d' },
              ].map(({ label, score, color }) => (
                <div key={label} style={styles.scoreItem}>
                  <div style={styles.scoreLabel}>{label}</div>
                  <div style={styles.scoreBarBg}><div style={{ ...styles.scoreBarFill, width: `${score}%`, background: color }} /></div>
                  <div style={{ ...styles.scoreNum, color }}>{score}/100</div>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.insightGrid}>
            {[
              { icon: '🔥', label: 'Demand', text: result.demand_insight },
              { icon: '⚔️', label: 'Competition', text: result.competition_insight },
              { icon: '💰', label: 'Profit', text: result.profit_insight },
            ].map(({ icon, label, text }) => (
              <div key={label} style={styles.insightCard}>
                <div style={styles.insightIcon}>{icon}</div>
                <div style={styles.insightLabel}>{label}</div>
                <p style={styles.insightText}>{text}</p>
              </div>
            ))}
          </div>
          <div style={styles.ideasCard}>
            <div style={styles.ideasTitle}>✦ Product Ideas to Start With</div>
            <div style={styles.ideasGrid}>
              {result.product_ideas?.map((idea: string, i: number) => (
                <div key={i} style={styles.ideaChip}>{idea}</div>
              ))}
            </div>
          </div>
          <div style={styles.angleCard}>
            <div style={styles.angleLabel}>Your Winning Angle</div>
            <p style={styles.angleText}>{result.winning_angle}</p>
          </div>
          <div style={styles.tipCard}>
            <div style={styles.tipLabel}>💡 Pro Tip</div>
            <p style={styles.tipText}>{result.tip}</p>
          </div>
          <button onClick={reset} style={styles.resetBtn}>← Try Another Niche</button>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' },
  header: { textAlign: 'center', marginBottom: 32 },
  badge: { display: 'inline-block', background: '#d4e4d6', color: '#5e8b63', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 999, marginBottom: 14 },
  title: { fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#2d2d2d', lineHeight: 1.1 },
  titleItalic: { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 400, color: '#5e8b63' },
  subtitle: { marginTop: 8, color: '#9a9590', fontSize: 15 },
  card: { background: '#fff', borderRadius: 16, padding: '32px 28px', border: '1px solid #ddd8d0', boxShadow: '0 2px 16px rgba(45,45,45,0.06)' },
  field: { marginBottom: 24 },
  label: { display: 'block', fontWeight: 600, fontSize: 14, color: '#2d2d2d', marginBottom: 10 },
  optional: { fontWeight: 400, color: '#9a9590', fontSize: 13 },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { padding: '7px 16px', borderRadius: 999, border: '1.5px solid #ddd8d0', background: '#f7f4ef', color: '#2d2d2d', fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  chipActive: { background: '#5e8b63', border: '1.5px solid #5e8b63', color: '#fff' },
  input: { width: '100%', padding: '11px 16px', border: '1.5px solid #ddd8d0', borderRadius: 10, fontSize: 14, background: '#f7f4ef', color: '#2d2d2d', outline: 'none' },
  btn: { width: '100%', padding: '14px', background: '#5e8b63', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  btnDisabled: { background: '#d4e4d6', color: '#9a9590', cursor: 'not-allowed' },
  error: { color: '#c0392b', fontSize: 13, marginBottom: 12 },
  resultWrapper: { display: 'flex', flexDirection: 'column', gap: 16 },
  resultHero: { background: '#fff', borderRadius: 16, padding: '32px 28px', border: '1px solid #ddd8d0', boxShadow: '0 2px 16px rgba(45,45,45,0.06)', textAlign: 'center' },
  resultBadge: { display: 'inline-block', background: '#d4e4d6', color: '#5e8b63', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 999, marginBottom: 12 },
  nicheName: { fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#2d2d2d', letterSpacing: '-0.02em', marginBottom: 8 },
  nicheTagline: { fontSize: 15, color: '#9a9590', marginBottom: 28, lineHeight: 1.5 },
  scores: { display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' },
  scoreItem: { display: 'grid', gridTemplateColumns: '130px 1fr 60px', alignItems: 'center', gap: 12 },
  scoreLabel: { fontSize: 13, fontWeight: 500, color: '#2d2d2d' },
  scoreBarBg: { height: 8, background: '#ede9e0', borderRadius: 999, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 999 },
  scoreNum: { fontSize: 12, fontWeight: 700, textAlign: 'right' },
  insightGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 },
  insightCard: { background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #ddd8d0' },
  insightIcon: { fontSize: 20, marginBottom: 6 },
  insightLabel: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5e8b63', marginBottom: 6 },
  insightText: { fontSize: 13, color: '#9a9590', lineHeight: 1.5 },
  ideasCard: { background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #ddd8d0' },
  ideasTitle: { fontSize: 13, fontWeight: 700, color: '#2d2d2d', marginBottom: 12 },
  ideasGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  ideaChip: { padding: '6px 14px', background: '#f7f4ef', border: '1px solid #ddd8d0', borderRadius: 999, fontSize: 13, color: '#2d2d2d', fontWeight: 500 },
  angleCard: { background: '#5e8b63', borderRadius: 12, padding: '20px 24px', color: '#fff' },
  angleLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7, marginBottom: 8 },
  angleText: { fontSize: 15, lineHeight: 1.6, fontWeight: 500 },
  tipCard: { background: '#f7f4ef', borderRadius: 12, padding: '20px 24px', border: '1px solid #ddd8d0' },
  tipLabel: { fontSize: 13, fontWeight: 700, color: '#2d2d2d', marginBottom: 6 },
  tipText: { fontSize: 14, color: '#9a9590', lineHeight: 1.6 },
  resetBtn: { background: 'none', border: '1.5px solid #ddd8d0', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 600, color: '#9a9590', cursor: 'pointer', alignSelf: 'flex-start' },
}
