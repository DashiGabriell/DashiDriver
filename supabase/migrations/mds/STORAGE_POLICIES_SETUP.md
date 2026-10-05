# 🔐 FIX: Erro 400 Storage Upload - Vehicle Photos

## 🚨 SOLUÇÃO: Configurar Bucket + Políticas

O erro `400 Bad Request` ocorre porque **faltam políticas de acesso** no bucket `vehicle-photos`.

### ✅ Método 1: SQL Completo (RECOMENDADO - 1 minuto)

**Execute este SQL no SQL Editor:**
🔗 https://supabase.com/dashboard/project/igchaidmowxpyjapjybe/sql

```sql
-- 1. Configurar bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-photos', 
  'vehicle-photos', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Habilitar RLS (se ainda não estiver)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas usando role administrativa
SET ROLE postgres;

-- SELECT - Leitura pública
CREATE POLICY IF NOT EXISTS "vehicle_photos_public_read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'vehicle-photos');

-- INSERT - Upload autenticado
CREATE POLICY IF NOT EXISTS "vehicle_photos_authenticated_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vehicle-photos');

-- UPDATE - Atualização autenticada
CREATE POLICY IF NOT EXISTS "vehicle_photos_authenticated_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vehicle-photos')
WITH CHECK (bucket_id = 'vehicle-photos');

-- DELETE - Deleção autenticada
CREATE POLICY IF NOT EXISTS "vehicle_photos_authenticated_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vehicle-photos');

RESET ROLE;

-- Verificar políticas criadas
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE 'vehicle_photos%';
```

**Resultado esperado:** 4 linhas mostrando as políticas criadas ✅

---

### ✅ Método 2: Via Dashboard UI (Alternativa - 3 minutos)

**1. Acesse:** https://supabase.com/dashboard/project/igchaidmowxpyjapjybe/storage/policies

**2. Crie 4 políticas** clicando em "New Policy" para cada uma:

| # | Operation | Policy Name | Definition | Role |
|---|-----------|-------------|------------|------|
| 1 | `SELECT` | `Public read` | `bucket_id = 'vehicle-photos'` | `public` |
| 2 | `INSERT` | `Auth upload` | `bucket_id = 'vehicle-photos'` | `authenticated` |
| 3 | `UPDATE` | `Auth update` | `bucket_id = 'vehicle-photos'` | `authenticated` |
| 4 | `DELETE` | `Auth delete` | `bucket_id = 'vehicle-photos'` | `authenticated` |

**3. Verifique:** Deve aparecer 4 políticas no bucket `vehicle-photos`

---

## 🧪 Testar Upload

1. **Recarregue** o CarControl (F5)
2. **Faça upload** de uma foto em um veículo
3. ✅ **Upload funcionará sem erro 400!**

---

## 🔍 Como Saber se Funcionou?

Execute no SQL Editor:
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```
**Resultado esperado:** 4 linhas mostrando as políticas

---

## 🐛 Troubleshooting

### ❌ Ainda dando erro 400?
- [ ] Verifique se está logado (autenticado)
- [ ] Confirme que as 4 políticas foram criadas
- [ ] Limpe o cache: Ctrl+Shift+Delete
- [ ] Verifique no console se a foto aparece com URL pública

### ❌ Erro "must be owner of table objects"
- Use o **Método 2 (Dashboard UI)** ao invés do SQL
- Ou execute o SQL como service_role

### ✅ Teste Manual
1. Vá em: https://supabase.com/dashboard/project/igchaidmowxpyjapjybe/storage/buckets/vehicle-photos
2. Tente fazer upload manual de uma imagem
3. Se funcionar, as políticas estão OK!

---

**🎯 Problema:** Erro 400 Bad Request no upload  
**✅ Solução:** Executar SQL do Método 1 ou criar políticas via Método 2  
**⏱️ Tempo:** 1-3 minutos  

**Criado em:** 2026-05-04  
**Projeto:** CarControl (igchaidmowxpyjapjybe)
