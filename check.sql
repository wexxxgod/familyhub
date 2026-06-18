SELECT u.id, u.email, u.name, u.role, u.family_id, f.id as fid, f.name, f.created_by FROM users u LEFT JOIN families f ON u.family_id = f.id WHERE u.email = 'nik.gudkov.2006@inbox.ru';
