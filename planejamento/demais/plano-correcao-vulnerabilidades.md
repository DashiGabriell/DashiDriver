# Plano de Correção de Vulnerabilidades - DashIDrive

**Data:** 12/06/2026
**Total:** 20 vulnerabilidades (1 low, 7 moderate, 11 high, 1 critical)

---

## Resumo das Ações

| Prioridade | Pacote | Gravidade | Tipo | Ação |
|---|---|---|---|---|
| 🔴 CRÍTICA | vitest | critical | Direta | Atualizar `vitest` para `^3.2.6` |
| 🔴 ALTA | react-router-dom | high | Direta | Atualizar `react-router-dom` para `^6.31.0` |
| 🔴 ALTA | vite / esbuild | high | Direta | Atualizar `vite` para `^5.4.20` |
| 🔴 ALTA | lovable-tagger / esbuild | high | Direta | Atualizar `lovable-tagger` ou removê-lo |
| 🔴 ALTA | rollup | high | Transitiva | Resolver via atualização de `vite` |
| 🔴 ALTA | lodash | high | Transitiva | Resolver via `npm audit fix` ou override |
| 🔴 ALTA | minimatch | high | Transitiva | Resolver via `npm audit fix` ou override |
| 🔴 ALTA | picomatch | high | Transitiva | Resolver via `npm audit fix` ou override |
| 🔴 ALTA | flatted | high | Transitiva | Resolver via `npm audit fix` ou override |
| 🔴 ALTA | glob | high | Transitiva | Resolver via `npm audit fix` ou override |
| 🟡 MÉDIA | postcss | moderate | Direta | Atualizar `postcss` para `^8.5.10` |
| 🟡 MÉDIA | ajv | moderate | Transitiva | Resolver via `npm audit fix` ou override |
| 🟡 MÉDIA | brace-expansion | moderate | Transitiva | Resolver via `npm audit fix` ou override |
| 🟡 MÉDIA | js-yaml | moderate | Transitiva | Resolver via `npm audit fix` ou override |
| 🟡 MÉDIA | ws | moderate | Transitiva | Atualizar `jsdom` ou override |
| 🟡 MÉDIA | yaml | moderate | Transitiva | Resolver via `npm audit fix` ou override |
| 🟢 BAIXA | @tootallnate/once | low | Transitiva | Resolver via `npm audit fix` |

---

## Passo a Passo

### 1. Atualizar dependências diretas no `package.json`

#### 1.1 `react-router-dom` (HIGH - XSS via Open Redirect)
**Versão atual:** `^6.30.1`
**Versão segura:** `>=6.31.0` (corrige GHSA-2w69-qvjg-hvjx)
```bash
npm install react-router-dom@^6.31.0
```

#### 1.2 `vitest` (CRITICAL - Arbitrary file read/execute)
**Versão atual:** `^3.2.4`
**Versão segura:** `>=3.2.6`
```bash
npm install vitest@^3.2.6
```

#### 1.3 `vite` (HIGH - esbuild múltiplas vulnerabilidades)
**Versão atual:** `^5.4.19`
**Versão segura:** `>=5.4.20` (ou última 5.x)
```bash
npm install vite@^5.4.20
```

#### 1.4 `postcss` (MODERATE - XSS via unescaped `</style>`)
**Versão atual:** `^8.5.6`
**Versão segura:** `>=8.5.10`
```bash
npm install postcss@^8.5.10
```

#### 1.5 `lovable-tagger` (HIGH - esbuild desatualizado)
**Versão atual:** `^1.1.13`
**Ação:** Avaliar se o `lovable-tagger` ainda é necessário. Se sim, verificar se há versão mais recente. Caso contrário, remover.
```bash
npm install lovable-tagger@latest
# ou
npm uninstall lovable-tagger
# e remover do vite.config.ts
```

---

### 2. Corrigir dependências transitivas com `overrides`

No `package.json`, adicionar `overrides` para forçar versões seguras de pacotes transitivos que não são diretamente atualizáveis:

```json
{
  "overrides": {
    "@remix-run/router": "^1.23.2",
    "lodash": "^4.17.21",
    "minimatch": "^3.1.2",
    "picomatch": "^2.3.2",
    "flatted": "^3.4.2",
    "glob": "^11.0.2",
    "js-yaml": "^4.1.3",
    "ajv": "^6.14.0",
    "brace-expansion": "^2.0.3",
    "ws": "^8.20.1",
    "yaml": "^2.8.3",
    "@tootallnate/once": "^2.0.1",
    "esbuild": "^0.25.4"
  }
}
```

> **Nota:** Aplicar `overrides` pode causar conflitos de versão. Execute `npm install` e depois rode a suíte de testes (`npm test` e `npm run build`) para verificar compatibilidade.

---

### 3. Executar `npm audit fix` (abordagem segura primeiro)

```bash
npm audit fix
```
Isso corrigirá automaticamente as vulnerabilidades que não exigem breaking changes.

---

### 4. Verificar se há vulnerabilidades restantes

```bash
npm audit
```
Se ainda houver vulnerabilidades, revisar cada uma e aplicar overrides adicionais ou atualizações manuais.

---

### 5. Executar `npm audit fix --force` (apenas se necessário)

Caso ainda restem vulnerabilidades após os passos acima e overrides:

```bash
npm audit fix --force
```

> ⚠️ **Risco:** Isso atualiza pacotes para versões que podem conter breaking changes. Execute os testes após.

---

### 6. Validar a correção

```bash
npm audit        # confirmar 0 vulnerabilidades
npm run build    # verificar build
npm test         # verificar testes
npm run dev      # verificar dev server
```

---

## Resultado Final das Correções

| Status | Vulnerabilidade | Gravidade Original | Resolução |
|---|---|---|---|
| ✅ | @remix-run/router / react-router-dom | high | Atualizado para react-router-dom@6.30.4 → @remix-run/router@1.23.3 |
| ✅ | vitest | critical | Atualizado para vitest@3.2.6 |
| ✅ | esbuild (via vite + lovable-tagger) | high | Override forçando esbuild@^0.28.1 |
| ✅ | postcss | moderate | Atualizado para postcss@8.5.15 |
| ✅ | lodash | high | Corrigido via npm audit fix |
| ✅ | minimatch | high | Corrigido via npm audit fix |
| ✅ | picomatch | high | Corrigido via npm audit fix |
| ✅ | flatted | high | Corrigido via npm audit fix |
| ✅ | glob | high | Corrigido via npm audit fix |
| ✅ | ajv | moderate | Corrigido via npm audit fix |
| ✅ | brace-expansion | moderate | Corrigido via npm audit fix |
| ✅ | js-yaml | moderate | Corrigido via npm audit fix |
| ✅ | ws | moderate | Corrigido via npm audit fix |
| ✅ | yaml | moderate | Corrigido via npm audit fix |
| ✅ | @tootallnate/once | low | Corrigido via npm audit fix |
| ✅ | rollup | high | Corrigido via npm audit fix |
| ⚠️ | vite (GHSA-4w7w-66w2-5vf9) | moderate | **Não corrigido** — Path Traversal em `.map` no dev server. Fix exigiria upgrade para vite@8.x (breaking change). Aceito como risco controlado. |

**20 → 1 vulnerabilidade restante (moderate, apenas em dev server)**

## Observações Importantes

1. **`esbuild`**: As vulnerabilidades (GHSA-67mh-4wv8-2f99 e GHSA-gv7w-rqvm-qjhr) foram resolvidas via `overrides` forçando `esbuild@^0.28.1`.
2. **Vulnerabilidade remanescente (vite)**: Apenas afeta o servidor de desenvolvimento (path traversal em `.map`). Produção não é afetada. Para corrigir seria necessário migrar para vite@8.x, o que é um breaking change.
3. **Teste pré-existente**: `checklist.integration.test.ts` já falhava antes das correções (mock do Supabase incompleto) — não é causado pelas atualizações.
4. **Build**: Produção compila normalmente com `vite build`.

---

## Comandos Executados

```bash
# 1. Atualizar dependências diretas no package.json
# react-router-dom: ^6.30.1 → ^6.30.4
# vitest: ^3.2.4 → ^3.2.6
# vite: ^5.4.19 → ^5.4.21
# postcss: ^8.5.6 → ^8.5.15
# lovable-tagger: ^1.1.13 → ^1.3.0

# 2. Instalar atualizações
npm install

# 3. Fix automático
npm audit fix

# 4. Adicionar override no package.json:
# "overrides": { "esbuild": "^0.28.1" }

# 5. Reinstalar com overrides
npm install

# 6. Verificar
npm audit       # 20 → 1 vulnerabilidade
npm run build   # OK
npm test        # OK (mesma falha pré-existente)
```
