import crypto from 'node:crypto';

export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function findValue(value, keys, depth = 0) {
  if (!value || depth > 5 || typeof value !== 'object') return '';
  for (const [key, item] of Object.entries(value)) {
    if (keys.includes(key.toLowerCase()) && (typeof item === 'string' || typeof item === 'number')) return String(item);
  }
  for (const item of Object.values(value)) {
    const found = findValue(item, keys, depth + 1);
    if (found) return found;
  }
  return '';
}

function signatureMatches(raw, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha1', secret).update(raw).digest('hex');
  const a = Buffer.from(String(signature));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  const secret = process.env.KIWIFY_WEBHOOK_SECRET || '';
  if (!secret) return res.status(503).json({ error: 'kiwify_webhook_secret_missing' });
  const raw = await readRawBody(req);
  const signature = req.query?.signature || req.headers['x-kiwify-signature'] || req.headers['x-webhook-signature'];
  if (!signatureMatches(raw, signature, secret)) return res.status(401).json({ error: 'invalid_signature' });

  let payload;
  try { payload = JSON.parse(raw); } catch { return res.status(400).json({ error: 'invalid_json' }); }
  const expectedProduct = String(process.env.KIWIFY_PRODUCT_ID || '').trim();
  const newProductId = String(process.env.KIWIFY_PRODUCT_ID_MINHAS_QUALIDADES || process.env.KIWIFY_MINHAS_QUALIDADES_PRODUCT_ID || '').trim();
  const productId = findValue(payload, ['product_id', 'productid', 'id_product', 'product']);
  const productName = findValue(payload, ['product_name', 'product_title', 'title', 'name']);
  const productReference = findValue(payload, ['checkout_url', 'product_url', 'offer_url']);
  const productText = `${productName} ${productReference}`.toLowerCase();
  let productKey = '';
  if (newProductId && productId === newProductId) productKey = 'minhasQualidades';
  else if (/minhas\s+qualidades|baralho[^\n]*qualidades/.test(productText) || /08tzolz/i.test(productReference)) productKey = 'minhasQualidades';
  else if (!expectedProduct || !productId || productId === expectedProduct) productKey = 'menosCigarro';
  if (!productKey) return res.status(200).json({ ignored: true, reason: 'different_product' });

  const eventText = [
    findValue(payload, ['event', 'event_type', 'type']),
    findValue(payload, ['status', 'order_status', 'payment_status', 'payment_state'])
  ].filter(Boolean).join(' ').toLowerCase();
  const email = findValue(payload, ['email', 'customer_email', 'buyer_email', 'purchaser_email']).trim().toLowerCase();
  if (!email) return res.status(422).json({ error: 'buyer_email_missing' });
  const orderId = findValue(payload, ['order_id', 'orderid', 'transaction_id', 'transactionid', 'subscription_id']) || crypto.createHash('sha256').update(raw).digest('hex');
  const revoked = /(refund|refunded|reembols|chargeback|cancel|canceled|cancelled|cancelad|charge_back)/.test(eventText);
  const approved = !revoked && /(purchase.?approved|payment.?approved|approved|paid|completed|aprovad|pagamento.?aprovado)/.test(eventText);
  if (!approved && !revoked) return res.status(200).json({ ignored: true, reason: 'unsupported_event' });

  const supabaseUrl = process.env.SUPABASE_URL || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !secretKey) return res.status(503).json({ error: 'supabase_server_config_missing' });
  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/entitlements?on_conflict=kiwify_order_id`, {
    method: 'POST',
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify([{
      purchaser_email: email,
      product_key: productKey,
      kiwify_product_id: productId || expectedProduct || null,
      kiwify_order_id: orderId,
      status: approved ? 'active' : 'refunded',
      updated_at: new Date().toISOString()
    }])
  });
  if (!response.ok) return res.status(502).json({ error: 'entitlement_write_failed' });
  return res.status(200).json({ received: true, status: approved ? 'active' : 'refunded' });
}