## Summary

- What changed?
- Why did it change?

## Documentation

- [ ] I updated the docs affected by this change
- [ ] No doc update was needed for this PR
- [ ] If env metadata changed, I updated `env-sync.config.json` and regenerated `.env.example`
- [ ] If auth or architecture changed, I updated `AGENTS.md`
- [ ] If schema, migrations, or RLS changed, I updated `supabase/README.md`
- [ ] If setup, commands, CI checks, or deploy flow changed, I updated `README.md`
- [ ] If backend-only behavior or setup changed, I updated `backend/README.md`

## Verification

- [ ] `npm run env:check`
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run build --prefix backend`

## Notes

- Follow-ups, risks, or intentional gaps:
