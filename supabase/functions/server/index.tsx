import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const BASE_PATH = '/make-server-d67cb24d';

// Logger & CORS
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// --- Helpers ---

const getSupabase = () => createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const getUser = async (c: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  // Fetch role from KV
  try {
    const profile = await kv.get(`user:${user.id}`);
    return { ...user, role: profile?.role || 'user' };
  } catch (e) {
    return { ...user, role: 'user' };
  }
};

const requireRole = (allowedRoles: string[]) => async (c: any, next: any) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  if (!allowedRoles.includes(user.role)) return c.json({ error: 'Forbidden' }, 403);
  c.set('user', user);
  await next();
};

// --- Routes ---

app.get(`${BASE_PATH}/health`, (c) => c.json({ status: "ok" }));

// 1. Auth & Profiles

// Get current user profile
app.get(`${BASE_PATH}/me`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  return c.json(user);
});

// Create User (Admin/Superadmin Only)
app.post(`${BASE_PATH}/users`, requireRole(['admin', 'superadmin']), async (c) => {
  const body = await c.req.json();
  const { email, password, name, role } = body;

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (error) return c.json({ error: error.message }, 400);

  // Create Profile in KV
  if (data.user) {
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: role || 'user',
      created_at: new Date().toISOString()
    });
  }

  return c.json(data);
});

// List Users (Admin/Superadmin Only)
app.get(`${BASE_PATH}/users`, requireRole(['admin', 'superadmin']), async (c) => {
  const profiles = await kv.getByPrefix('user:');
  return c.json(profiles);
});

// 2. Leads

// List Leads (All authenticated users)
app.get(`${BASE_PATH}/leads`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  const leads = await kv.getByPrefix('lead:');
  // Sort by created_at desc
  leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return c.json(leads);
});

// Create Lead (User/Admin/Superadmin)
app.post(`${BASE_PATH}/leads`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const id = crypto.randomUUID();
  
  const lead = {
    id,
    ...body, // data, status, assigned_to
    created_by: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await kv.set(`lead:${id}`, lead);
  return c.json(lead);
});

// Update Lead (User/Admin/Superadmin)
app.put(`${BASE_PATH}/leads/:id`, async (c) => {
  const user = await getUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const body = await c.req.json();
  
  const existing = await kv.get(`lead:${id}`);
  if (!existing) return c.json({ error: 'Lead not found' }, 404);

  const updated = {
    ...existing,
    ...body,
    updated_at: new Date().toISOString()
  };

  await kv.set(`lead:${id}`, updated);
  return c.json(updated);
});

// Delete Lead (Admin/Superadmin Only)
app.delete(`${BASE_PATH}/leads/:id`, requireRole(['admin', 'superadmin']), async (c) => {
  const id = c.req.param('id');
  await kv.del(`lead:${id}`);
  return c.json({ success: true });
});

// 3. Fields Configuration (Admin/Superadmin Only)

app.get(`${BASE_PATH}/fields`, async (c) => {
  // Allow all auth users to read fields to render forms
  const user = await getUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const fields = await kv.get('config:fields');
  return c.json(fields || []);
});

app.post(`${BASE_PATH}/fields`, requireRole(['admin', 'superadmin']), async (c) => {
  const body = await c.req.json();
  await kv.set('config:fields', body); // Expects array of field definitions
  return c.json(body);
});

// Setup Initial Superadmin (One-time use or auto-check)
app.post(`${BASE_PATH}/setup`, async (c) => {
  const users = await kv.getByPrefix('user:');
  if (users.length > 0) return c.json({ error: 'Setup already complete' }, 400);

  const body = await c.req.json();
  const { email, password, name } = body;

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (error) return c.json({ error: error.message }, 400);

  if (data.user) {
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'superadmin',
      created_at: new Date().toISOString()
    });
  }
  return c.json(data);
});


Deno.serve(app.fetch);
