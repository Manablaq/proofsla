## Summary

Describe the change and why it is needed.

## Scope

- [ ] Contract
- [ ] Frontend
- [ ] Documentation
- [ ] Tests
- [ ] Deployment configuration

## Verification

List the exact commands/results used to verify this change.

- [ ] `git diff --check`
- [ ] Contract gate (`./scripts/verify.sh`) when contract code changed
- [ ] `npm run lint` when frontend code changed
- [ ] `npm run build` when frontend code changed
- [ ] `npm run test:e2e` when frontend behavior changed

## Deployment impact

State whether this changes:

- the Bradbury contract address;
- the ABI;
- Vercel configuration;
- environment variables;
- the production URL.

## Evidence / screenshots

Attach screenshots for visible UI changes and link any live-chain evidence when
the change makes a live-chain claim.

## Safety checklist

- [ ] No secrets or wallet credentials are included.
- [ ] No contract deployment is implied by a frontend-only change.
- [ ] `ACCEPTED` is not described as `FINALIZED` without finality evidence.
- [ ] Evidence-source independence is not claimed without proof.
