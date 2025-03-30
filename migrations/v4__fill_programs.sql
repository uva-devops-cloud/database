-- Add Thesis courses for each program
INSERT INTO courses
    (course_code, course_name, credits, semester)
VALUES
    ('CS499', 'Computer Science Thesis', 15, 'Spring'),
    ('BUS499', 'Business Administration Thesis', 15, 'Spring');

-- Add necessary courses to meet credit requirements
INSERT INTO courses
    (course_code, course_name, credits, semester)
VALUES
    -- Computer Science additional courses
    ('CS201', 'Algorithms', 5, 'Fall'),
    ('CS202', 'Database Systems', 5, 'Spring'),
    ('CS301', 'Software Engineering', 8, 'Fall'),
    ('CS302', 'Web Development', 6, 'Spring'),
    ('CS401', 'Artificial Intelligence', 8, 'Fall'),
    ('CS402', 'Computer Networks', 6, 'Spring'),
    ('CS403', 'Computer Graphics', 6, 'Fall'),
    ('CS404', 'Mobile Development', 6, 'Spring'),

    -- Business Administration additional courses
    ('BUS201', 'Accounting', 6, 'Fall'),
    ('BUS202', 'Marketing', 6, 'Spring'),
    ('BUS301', 'Finance', 8, 'Fall'),
    ('BUS302', 'Operations Management', 8, 'Spring'),
    ('BUS401', 'Business Strategy', 8, 'Fall'),
    ('BUS402', 'Entrepreneurship', 8, 'Spring'),
    ('BUS403', 'Business Law', 8, 'Fall');

-- Associate new courses with programs
INSERT INTO program_courses
    (program_id, course_id)
VALUES
    -- Computer Science (1) - adding newly created courses
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS499')),
    -- Thesis
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS201')),
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS202')),
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS301')),
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS302')),
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS401')),
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS402')),
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS403')),
    (1, (SELECT course_id
        FROM courses
        WHERE course_code = 'CS404')),

    -- Business Administration (2) - adding newly created courses
    (2, (SELECT course_id
        FROM courses
        WHERE course_code = 'BUS499')),
    -- Thesis
    (2, (SELECT course_id
        FROM courses
        WHERE course_code = 'BUS201')),
    (2, (SELECT course_id
        FROM courses
        WHERE course_code = 'BUS202')),
    (2, (SELECT course_id
        FROM courses
        WHERE course_code = 'BUS301')),
    (2, (SELECT course_id
        FROM courses
        WHERE course_code = 'BUS302')),
    (2, (SELECT course_id
        FROM courses
        WHERE course_code = 'BUS401')),
    (2, (SELECT course_id
        FROM courses
        WHERE course_code = 'BUS402')),
    (2, (SELECT course_id
        FROM courses
        WHERE course_code = 'BUS403'));
