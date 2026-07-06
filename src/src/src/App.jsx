import { useState, useEffect } from 'react'
import { supabase, usernameToEmail } from './supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

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

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h2>Bağlantı Başarılı ✅</h2>
      <p>Giriş yapan: {profile?.full_name || session.user.email}</p>
      <p>Rol: {profile?.role || '—'}</p>
      <button onClick={() => supabase.auth.signOut()}>Çıkış Yap</button>
    </div>
  )
}
