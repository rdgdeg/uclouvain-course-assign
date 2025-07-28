-- Création d'affectations de cours de démo
-- Récupération des IDs des cours et enseignants pour créer les affectations

WITH course_data AS (
  SELECT id, code FROM courses WHERE code IN (
    'WMEDE1150', 'WMEDE1151', 'WMEDE1152', 'WMEDE1153', 'WMEDE1155', 
    'WMDS1103', 'WMEDE1156', 'WMDS1154', 'WMDS1229', 'WMDS1114',
    'WMEDE1159', 'WMDS1113', 'WMDS1158', 'WFARM1282T', 'WSBIM1334M'
  )
),
teacher_data AS (
  SELECT id, email FROM teachers WHERE email IN (
    'pascale.wauters@uclouvain.be', 'mohamed.ayadim@uclouvain.be', 'benjamin.elias@uclouvain.be',
    'jean-francois.gohy@uclouvain.be', 'charles.desmet@uclouvain.be', 'christophe.pierreux@uclouvain.be',
    'guido.bommer@uclouvain.be', 'marie.boucquey@uclouvain.be', 'catherine.behets@uclouvain.be',
    'benoit.lengele@uclouvain.be', 'stefan.constantinescu@uclouvain.be', 'donatienne.tyteca@uclouvain.be',
    'philippe.gailly@uclouvain.be', 'miikka.vikkula@uclouvain.be', 'laurent.gatto@uclouvain.be',
    'catherine.legrand@uclouvain.be', 'olivier.servais@uclouvain.be', 'jean.macq@uclouvain.be',
    'nicolas.tajeddine@uclouvain.be', 'dominique.vanpee@uclouvain.be'
  )
)

INSERT INTO course_assignments (course_id, teacher_id, is_coordinator, vol1_hours, vol2_hours, validated_by_coord) 
SELECT 
  c.id,
  t.id,
  CASE WHEN row_number() OVER (PARTITION BY c.id ORDER BY random()) = 1 THEN true ELSE false END as is_coordinator,
  CASE c.code
    WHEN 'WMEDE1150' THEN 49  -- Physique
    WHEN 'WMEDE1151' THEN 56  -- Chimie
    WHEN 'WMEDE1152' THEN 49  -- Biologie
    WHEN 'WMEDE1153' THEN 42  -- Histologie générale
    WHEN 'WMEDE1155' THEN 59  -- Biochimie
    WHEN 'WMDS1103' THEN 46   -- Anatomie
    WHEN 'WMEDE1156' THEN 20  -- Biologie cellulaire
    WHEN 'WMDS1154' THEN 52   -- Physiologie
    WHEN 'WMDS1229' THEN 20   -- Génétique
    WHEN 'WMDS1114' THEN 28   -- Statistiques
    WHEN 'WMEDE1159' THEN 28  -- Anthropologie
    WHEN 'WMDS1113' THEN 26   -- Epidémiologie
    WHEN 'WMDS1158' THEN 20   -- Recherche
    WHEN 'WFARM1282T' THEN 20 -- Microbiologie
    WHEN 'WSBIM1334M' THEN 35 -- Immunologie
    ELSE 30
  END as vol1_hours,
  CASE c.code
    WHEN 'WMEDE1150' THEN 24  -- Physique
    WHEN 'WMEDE1151' THEN 18  -- Chimie
    WHEN 'WMEDE1152' THEN 15  -- Biologie
    WHEN 'WMEDE1153' THEN 25  -- Histologie générale
    WHEN 'WMEDE1155' THEN 20  -- Biochimie
    WHEN 'WMDS1103' THEN 0    -- Anatomie
    WHEN 'WMEDE1156' THEN 10  -- Biologie cellulaire
    WHEN 'WMDS1154' THEN 10   -- Physiologie
    WHEN 'WMDS1229' THEN 0    -- Génétique
    WHEN 'WMDS1114' THEN 20   -- Statistiques
    WHEN 'WMEDE1159' THEN 5   -- Anthropologie
    WHEN 'WMDS1113' THEN 10   -- Epidémiologie
    WHEN 'WMDS1158' THEN 8    -- Recherche
    WHEN 'WFARM1282T' THEN 0  -- Microbiologie
    WHEN 'WSBIM1334M' THEN 0  -- Immunologie
    ELSE 10
  END as vol2_hours,
  true as validated_by_coord
FROM (
  SELECT 
    c.id, 
    c.code,
    t.id as teacher_id,
    row_number() OVER (PARTITION BY c.id ORDER BY random()) as rn
  FROM course_data c
  CROSS JOIN teacher_data t
  WHERE (c.code = 'WMEDE1150' AND t.email = 'pascale.wauters@uclouvain.be')
     OR (c.code = 'WMEDE1151' AND t.email IN ('mohamed.ayadim@uclouvain.be', 'benjamin.elias@uclouvain.be', 'jean-francois.gohy@uclouvain.be'))
     OR (c.code = 'WMEDE1152' AND t.email = 'charles.desmet@uclouvain.be')
     OR (c.code = 'WMEDE1153' AND t.email = 'christophe.pierreux@uclouvain.be')
     OR (c.code = 'WMEDE1155' AND t.email IN ('guido.bommer@uclouvain.be', 'marie.boucquey@uclouvain.be'))
     OR (c.code = 'WMDS1103' AND t.email IN ('catherine.behets@uclouvain.be', 'benoit.lengele@uclouvain.be'))
     OR (c.code = 'WMEDE1156' AND t.email IN ('stefan.constantinescu@uclouvain.be', 'christophe.pierreux@uclouvain.be', 'donatienne.tyteca@uclouvain.be'))
     OR (c.code = 'WMDS1154' AND t.email = 'philippe.gailly@uclouvain.be')
     OR (c.code = 'WMDS1229' AND t.email = 'miikka.vikkula@uclouvain.be')
     OR (c.code = 'WMDS1114' AND t.email IN ('laurent.gatto@uclouvain.be', 'catherine.legrand@uclouvain.be'))
     OR (c.code = 'WMEDE1159' AND t.email = 'olivier.servais@uclouvain.be')
     OR (c.code = 'WMDS1113' AND t.email = 'jean.macq@uclouvain.be')
     OR (c.code = 'WMDS1158' AND t.email IN ('nicolas.tajeddine@uclouvain.be', 'dominique.vanpee@uclouvain.be'))
     OR (c.code = 'WFARM1282T' AND t.email = 'mohamed.ayadim@uclouvain.be')
     OR (c.code = 'WSBIM1334M' AND t.email = 'stefan.constantinescu@uclouvain.be')
) course_teacher_mapping
JOIN course_data c ON c.id = course_teacher_mapping.id
JOIN teacher_data t ON t.id = course_teacher_mapping.teacher_id;