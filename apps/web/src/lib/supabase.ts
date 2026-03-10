import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

// Only create Supabase client if we don't have JWT auth
const createSupabaseClient = () => {
  // Check if we're using JWT auth
  if (typeof window !== 'undefined') {
    const hasJWT = localStorage.getItem('auth_token');
    if (hasJWT) {
      console.log('🔄 JWT auth detected, skipping Supabase initialization');
      // Return a mock client that won't make network requests
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: () => Promise.resolve({ error: null })
        },
        from: () => ({
          select: () => ({
            or: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null })
            })
          })
        })
      } as any;
    }
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export const supabase = createSupabaseClient();
