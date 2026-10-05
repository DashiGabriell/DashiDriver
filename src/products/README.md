# Product entrypoints (Epic 14)

Soft package boundaries for Opção B. Route trees stay in `src/routes/`; this folder re-exports them so `AppRoutes` composes by product.

See [`planejamento/PRODUCT-BOUNDARIES.md`](../../planejamento/PRODUCT-BOUNDARIES.md).

| Entrypoint | Contents |
|------------|----------|
| `core/` | gestão + mobile |
| `satellite/` | marketplace + lojista |
| `platform/` | public, checkout, ajuda, dev |
