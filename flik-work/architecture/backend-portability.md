# Flik backend portability boundary

The React Native UI must not contain direct Supabase queries. Feature services are the application boundary.

Recommended future structure:

- `services/` — application-facing repositories/services
- `lib/supabase.ts` — current Supabase infrastructure adapter
- `types/` — domain/data contracts
- `supabase/migrations/` — database source of truth

If Flik moves away from Supabase, replace the infrastructure adapter and service implementations while keeping screens/components and domain validation stable.

Never put the Supabase service-role key in the mobile app. Only the publishable/anon key belongs in Expo public environment variables.
