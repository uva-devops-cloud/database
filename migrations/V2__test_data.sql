-- db/migrations/V2__seed_test_data.sql

INSERT INTO students
    (cognito_info, name, profile_photo, start_year, graduation_year, address)
VALUES
    ('abc123', 'Jan Vlug', 'jan.jpg', 2021, 2025, 'Pirate Ship'),
    ('xyz789', 'Merlijn Van Uden', 'bob.jpg', 2022, 2026, 'Utrecht');

INSERT INTO programs
    (program_name, director)
VALUES
    ('Computer Science', 'Dr. Jane Doe'),
    ('Business Administration', 'Dr. John Smith');

INSERT INTO courses
    (course_code, course_name, credits, semester)
VALUES
    ('CS101', 'Intro to CS', 3, 'Fall'),
    ('CS102', 'Data Structures', 4, 'Spring'),
    ('BUS101', 'Intro to Business', 3, 'Fall');

INSERT INTO program_courses
    (program_id, course_id)
-- Assume program_id 1 is CS, program_id 2 is Business
VALUES
    (1, 1),
    -- (CS, CS101)
    (1, 2),
    -- (CS, CS102)
    (2, 3); -- (Bus, BUS101)

-- etc...