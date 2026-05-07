# Tedport Web — AI Architecture Contract (v2 Ultimate)

This document defines STRICT, NON-NEGOTIABLE rules.
AI MUST follow these rules. These are NOT suggestions.

---

## 🔴 RULE PRIORITY (CRITICAL)

When rules conflict, follow this order:

1. Architecture rules override everything
2. Service layer isolation is MANDATORY
3. Separation of concerns is REQUIRED
4. Code quality limits are STRICT
5. Naming conventions are ENFORCED

> If any rule is violated: AI MUST refactor, not continue.

---

## 🧱 CORE ARCHITECTURE

### Required Data Flow
```
Page → Hook → Service → Supabase
```

**NEVER ALLOWED:**
- Component → Supabase ❌
- Hook → JSX ❌
- Service → React ❌

---

## 📁 FOLDER STRUCTURE (STRICT)

```
/src
  /components   → UI only
  /hooks        → state + logic
  /services     → Supabase / API
  /pages        → route-level composition
  /constants    → static values
```

AI MUST place new code in correct folders.

---

## 🧩 COMPONENT RULES

- Max **150 lines** per file
- One responsibility per component
- NO data fetching inside components
- NO business logic inside JSX
- NO inline styles (except dynamic edge cases)
- NO IIFE inside JSX

> If violated: Split into sub-components or move logic to hook

---

## 🪝 HOOK RULES

- Naming MUST start with `use`
- Handles: state, async logic, derived values, handlers
- MUST RETURN: `{ data, loading, error, handlers }`

**FORBIDDEN:**
- JSX
- DOM manipulation

---

## 🔌 SERVICE RULES (CRITICAL)

ALL Supabase logic MUST be inside `/services`

**REQUIRED:**
- One function = one responsibility
- Async functions only
- No React imports

**ERROR HANDLING:**
```js
if (error) throw new Error(error.message);
```

**NEVER:**
- `supabase` query inside component ❌

---

## 🧠 STATE MANAGEMENT RULES

- Max **8 useState** per component
- Group related state
- No derived state in `useState`
- Use `useMemo` when needed

**BOOLEAN NAMING:**
- `isLoading`
- `hasError`
- `canSubmit`

---

## 🧾 FORM RULES

- Complex forms → custom hook
- Single source of truth: `const EMPTY_FORM = {}`
- Validation ≠ submit logic

---

## ⚠️ ERROR HANDLING STANDARD

**ALWAYS use:**
```js
try {
  ...
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

**NEVER:** empty catch ❌

---

## 🧱 UX STATE REQUIREMENTS

EVERY async UI MUST handle:
- loading state
- error state
- empty state

**NEVER:** silent null rendering ❌

---

## 🔐 SUPABASE SAFETY RULES

- Never expose keys
- Never trust client filters
- Prefer RLS-safe queries
- Validate inputs before query

---

## 🔁 REFACTORING BEHAVIOR (MANDATORY)

When editing existing code, AI MUST:

- Split component if >150 lines
- Move Supabase calls to service
- Extract duplicate logic
- Convert complex logic → hook
- Reduce useState count if needed

> DO NOT patch bad code — FIX the architecture.

---

## 🧩 REUSABILITY RULES

- Repeated UI → component
- Repeated logic → hook
- Repeated query → service

---

## 🪪 NAMING CONVENTIONS (STRICT)

| Type       | Rule               |
|------------|--------------------|
| Hooks      | `useSomething`     |
| Services   | `somethingService` |
| Components | `PascalCase`       |
| Constants  | `SCREAMING_SNAKE_CASE` |
| Handlers   | `handleSomething`  |

Violations MUST be corrected.

---

## 🧹 CODE QUALITY RULES

- Max function length: **30 lines**
- Max nesting: **3 levels**
- No magic numbers
- No dead code
- Prefer early return
- Prefer async/await

---

## ❌ ANTI-PATTERNS (FORBIDDEN)

- `supabase` in component ❌
- More than 8 `useState` ❌
- Inline confirm dialogs ❌
- Array index as key ❌
- `console.log` in production ❌
- Mixed language comments ❌

---

## ✅ CONFIRMATION PATTERN

ONLY use shared component:
```jsx
<ConfirmModal ... />
```

---

## 🧪 EXAMPLE FLOW (REFERENCE)

**Page:**
```jsx
const { data, loading } = useIhaleler()
```

**Hook:**
```js
const data = await tenderService.fetchPublicTenders()
```

**Service:**
```js
const { data, error } = await supabase.from(...)
if (error) throw new Error(error.message)
```

---

## 🧠 AI EXECUTION RULE

Before writing code, AI MUST check:

1. Is this violating architecture?
2. Should this be a hook?
3. Should this be a service?
4. Is component too large?

> If YES → Refactor FIRST, then proceed.

---

## 🏁 FINAL PRINCIPLE

- Clean architecture > fast output
- Separation of concerns > convenience
- Consistency > cleverness
