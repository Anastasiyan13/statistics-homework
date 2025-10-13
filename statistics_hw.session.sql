WITH s AS (
  SELECT
    CASE width_bucket(study_hours, 0, 12, 4)
      WHEN 1 THEN '0–2'
      WHEN 2 THEN '3–5'
      WHEN 3 THEN '6–8'
      WHEN 4 THEN '9–12'
    END AS study_bin,
    CASE
      WHEN exam_grade BETWEEN 18 AND 22 THEN '18–22'
      WHEN exam_grade BETWEEN 23 AND 26 THEN '23–26'
      WHEN exam_grade BETWEEN 27 AND 30 THEN '27–30'
    END AS grade_bin
  FROM students_study
)
SELECT
  study_bin,
  SUM(CASE WHEN grade_bin='18–22' THEN 1 ELSE 0 END) AS "18–22",
  SUM(CASE WHEN grade_bin='23–26' THEN 1 ELSE 0 END) AS "23–26",
  SUM(CASE WHEN grade_bin='27–30' THEN 1 ELSE 0 END) AS "27–30",
  COUNT(*) AS total
FROM s
GROUP BY study_bin
ORDER BY study_bin;
