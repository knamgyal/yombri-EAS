select e.extname, n.nspname as schema
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
where e.extname = 'pgtap';
