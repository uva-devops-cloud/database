-- db/migrations/V2__seed_test_data.sql

-- Students data (already exists)
INSERT INTO students
    (cognito_info, name, profile_photo, start_year, graduation_year, address)
VALUES
    ('abc123', 'Jan Vlug', 'jan.jpg', 2021, 2025, 'Pirate Ship'),
    ('xyz789', 'Merlijn Van Uden', 'bob.jpg', 2022, 2026, 'Utrecht');

-- Programs data (already exists)
INSERT INTO programs
    (program_name, director)
VALUES
    ('Computer Science', 'Dr. Jane Doe'),
    ('Business Administration', 'Dr. John Smith');

-- Courses data (already exists)
INSERT INTO courses
    (course_code, course_name, credits, semester)
VALUES
    ('CS101', 'Intro to CS', 3, 'Fall'),
    ('CS102', 'Data Structures', 4, 'Spring'),
    ('BUS101', 'Intro to Business', 3, 'Fall');

-- Program to courses relationships (already exists)
INSERT INTO program_courses
    (program_id, course_id)
-- Assume program_id 1 is CS, program_id 2 is Business
VALUES
    (1, 1),
    -- (CS, CS101)
    (1, 2),
    -- (CS, CS102)
    (2, 3);
-- (Bus, BUS101)

-- Enrollments (Student ↔ Program)
INSERT INTO enrollments
    (student_id, program_id, gpa, enrollment_status, start_date)
VALUES
    -- Jan is enrolled in Computer Science
    (1, 1, 3.85, 'ACTIVE', '2021-09-01'),
    -- Merlijn is enrolled in Business Administration
    (2, 2, 3.92, 'ACTIVE', '2022-09-01'),
    -- Merlijn is also enrolled in Computer Science (double major)
    (2, 1, 3.78, 'ACTIVE', '2022-09-01');

-- Student ↔ Course Enrollment
INSERT INTO student_course_enrollment
    (student_id, course_id, program_id, grade, status, semester)
VALUES
    -- Jan's courses
    (1, 1, 1, 'A-', 'COMPLETED', 'Fall 2021'),
    -- CS101 in CS program
    (1, 2, 1, 'B+', 'IN_PROGRESS', 'Spring 2022'),
    -- CS102 in CS program

    -- Merlijn's courses
    (2, 1, 1, 'A', 'COMPLETED', 'Fall 2022'),
    -- CS101 in CS program
    (2, 2, 1, 'A-', 'IN_PROGRESS', 'Spring 2023'),
    -- CS102 in CS program
    (2, 3, 2, 'A+', 'COMPLETED', 'Fall 2022');
-- BUS101 in Business program

-- Usage Info (LLM credits)
INSERT INTO usage_info
    (student_id, credits_available, credits_used)
VALUES
    (1, 1000, 250),
    -- Jan has used 250 credits out of 1000
    (2, 1500, 750);  -- Merlijn has used 750 credits out of 1500
