import { createClient } from "@supabase/supabase-js";

const requiredEnv = [
  "OLD_SUPABASE_URL",
  "OLD_SERVICE_ROLE_KEY",
  "NEW_SUPABASE_URL",
  "NEW_SERVICE_ROLE_KEY",
];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`Missing ${name}`);
  }
}

const oldClient = createClient(process.env.OLD_SUPABASE_URL, process.env.OLD_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const newClient = createClient(process.env.NEW_SUPABASE_URL, process.env.NEW_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function fail(label, error) {
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

async function listAllObjects(bucketId, prefix = "") {
  const results = [];
  let offset = 0;

  while (true) {
    const { data, error } = await oldClient.storage.from(bucketId).list(prefix, {
      limit: 1000,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    fail(`list ${bucketId}/${prefix}`, error);

    if (!data?.length) break;

    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        results.push(...(await listAllObjects(bucketId, path)));
      } else {
        results.push({ path, metadata: item.metadata ?? {} });
      }
    }

    if (data.length < 1000) break;
    offset += data.length;
  }

  return results;
}

async function ensureBucket(bucket) {
  const options = {
    public: bucket.public ?? false,
    fileSizeLimit: bucket.file_size_limit ?? undefined,
    allowedMimeTypes: bucket.allowed_mime_types ?? undefined,
  };

  const created = await newClient.storage.createBucket(bucket.name, options);
  if (!created.error) return "created";

  const message = created.error.message.toLowerCase();
  if (!message.includes("already exists") && !message.includes("duplicate")) {
    fail(`create bucket ${bucket.name}`, created.error);
  }

  const updated = await newClient.storage.updateBucket(bucket.name, options);
  fail(`update bucket ${bucket.name}`, updated.error);
  return "updated";
}

const { data: buckets, error: bucketsError } = await oldClient.storage.listBuckets();
fail("list buckets", bucketsError);

let copied = 0;
let failed = 0;

for (const bucket of buckets ?? []) {
  const action = await ensureBucket(bucket);
  const objects = await listAllObjects(bucket.name);
  console.log(`${bucket.name}: bucket ${action}, ${objects.length} object(s)`);

  for (const object of objects) {
    const downloaded = await oldClient.storage.from(bucket.name).download(object.path);
    if (downloaded.error) {
      failed += 1;
      console.error(`${bucket.name}/${object.path}: download failed: ${downloaded.error.message}`);
      continue;
    }

    const uploaded = await newClient.storage.from(bucket.name).upload(object.path, downloaded.data, {
      upsert: true,
      contentType: object.metadata.mimetype ?? undefined,
      cacheControl: object.metadata.cacheControl ?? object.metadata.cache_control ?? undefined,
    });

    if (uploaded.error) {
      failed += 1;
      console.error(`${bucket.name}/${object.path}: upload failed: ${uploaded.error.message}`);
      continue;
    }

    copied += 1;
  }
}

console.log(`Storage migration done. Copied ${copied} object(s), failed ${failed}.`);

if (failed > 0) {
  process.exitCode = 1;
}
