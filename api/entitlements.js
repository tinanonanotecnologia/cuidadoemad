const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!supabaseUrl || !publicKey || !secretKey || !token) return res.status(401).json({ error: 'authentication_required' });

  const userResponse = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { apikey: publicKey, Authorization: `Bearer ${token}` }
  });
  if (!userResponse.ok) return res.status(401).json({ error: 'invalid_session' });
  const user = await userResponse.json();
  const email = String(user.email || '').trim().toLowerCase();
  if (!email) return res.status(403).json({ error: 'email_required' });

  const base = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/entitlements?select=product_key,status&product_key=eq.menosCigarro&status=eq.active`;
  const headers = { apikey: secretKey, Authorization: `Bearer ${secretKey}` };
  const [byEmail, byUser] = await Promise.all([
    fetch(`${base}&purchaser_email=eq.${encodeURIComponent(email)}`, { headers }),
    user.id ? fetch(`${base}&user_id=eq.${encodeURIComponent(user.id)}`, { headers }) : Promise.resolve(null)
  ]);
  const emailRows = byEmail && byEmail.ok ? await byEmail.json() : [];
  const userRows = byUser && byUser.ok ? await byUser.json() : [];
  const unlocked = [...emailRows, ...userRows].some(row => row.product_key === 'menosCigarro' && row.status === 'active');
  return res.status(200).json({ email, entitlements: { menosCigarro: unlocked } });
}

