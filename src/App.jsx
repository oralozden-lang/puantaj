import { useState, useEffect } from 'react'
import { supabase, usernameToEmail } from './supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [branches, setBranches] = useState([])
  const [newBranch, setNewBranch] = useState('')
  const [branchError, setBranchError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data))
    } else {
      setProfile(null)
    }
  }, [session])

  useEffect(() => {
    if (session) loadBranches()
  }, [session])

  const loadBranches = async () => {
    const { data, error } = await supabase.from('branches').select('*').order('name')
    if (!error) setBranches(data)
  }

  const addBranch = async (e) => {
    e.preventDefault()
    setBranchError('')
    const name = newBranch.trim().toLocaleUpperCase('tr')
    if (!name) return
    const { error } = await supabase.from('branches').insert({ name })
    if (error) setBranchError(error.message)
    else { setNewBranch(''); loadBranches() }
  }

  const deleteBranch = async (id) => {
    const { error } = await supabase.from('branches').delete().eq('id', id)
    if (error) setBranchError(error.message)
    else loadBranches()
  }

  const login = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    })
    if (error) setError('Kullanıcı adı veya şifre hatalı')
  }

  if (loading) return <div style={{ padding: 20 }}>Yükleniyor…</div>

  if (!session) {
    return (
      <div style={{ maxWidth: 320, margin: '80px auto', padding: 20, fontFamily: 'system-ui' }}>
        <h2>Puantaj Girişi</h2>
        <form onSubmit={login}>
          <input placeholder="Kullanıcı adı" value={username} onChange={e => setUsername(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10, boxSizing: 'border-box' }} />
          <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 10, marginBottom: 10, boxSizing: 'border-box' }} />
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: 10 }}>Giriş Yap</button>
        </form>
      </div>
    )
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <strong>{profile?.full_name || session.user.email}</strong>
          <div style={{ fontSize: 12, color: '#666' }}>Rol: {profile?.role || '—'}</div>
        </div>
        <button onClick={() => supabase.auth.signOut()}>Çıkış Yap</button>
      </div>

      <h3>Şubeler</h3>
      {branches.length === 0 && <p style={{ color: '#888' }}>Henüz şube yok.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {branches.map(b => (
          <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            {b.name}
            {isAdmin && <button onClick={() => deleteBranch(b.id)} style={{ color: 'red' }}>Sil</button>}
          </li>
        ))}
      </ul>

      {isAdmin && (
        <form onSubmit={addBranch} style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <input placeholder="Yeni şube adı" value={newBranch} onChange={e => setNewBranch(e.target.value)}
            style={{ flex: 1, padding: 8 }} />
          <button type="submit">Ekle</button>
        </form>
      )}
      {branchError && <div style={{ color: 'red', marginTop: 8 }}>{branchError}</div>}
    </div>
  )
}
