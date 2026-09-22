-- Lecture seule : ou en sont les equipes et l attribution des liens.
SELECT t.name AS equipe,
       t."restrictToAssignedLinks" AS exclusif,
       (SELECT count(*) FROM users u WHERE u."teamId" = t.id) AS membres,
       (SELECT count(*) FROM links l WHERE l."teamId" = t.id) AS liens,
       (SELECT count(*) FROM links l WHERE l."teamId" = t.id AND l."assignedToUserId" IS NOT NULL) AS attribues
FROM teams t
ORDER BY membres DESC;

-- Qui verrait quoi si l acces exclusif etait allume.
SELECT t.name AS equipe,
       u."teamRole" AS role,
       coalesce(u.nickname, u.name, u.email) AS membre,
       (SELECT count(*) FROM links l WHERE l."assignedToUserId" = u.id) AS liens_attribues
FROM users u
JOIN teams t ON t.id = u."teamId"
ORDER BY t.name, liens_attribues DESC;
