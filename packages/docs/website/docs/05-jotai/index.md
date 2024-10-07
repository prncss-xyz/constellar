---
---

# Jotai integration

All Jotai integrations accepting atoms transparently work with sync and async atoms as well.

## Getting started

```bash
pnpm i @constellar/core @constellar/jotai
```

```typescript
import { prop } from '@constellar/core'
import { focusAtom } from '@constellar/jotai'

const wholeAtom = atom({ a: 2 })
const partAtom = focusAtom(wholeAtom, prop('a'))
```
