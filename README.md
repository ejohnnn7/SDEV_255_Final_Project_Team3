# SDEV_255_Final_Project_Team3
Final project repository for SDEV255 - Team 3

Purpose:
This branch contains the work required for Stage 2 of the project - student accounts, login/logout, course enrollment, and role-based features.

What should be included on this branch:

1. Login System
    Students and teachers should be able to:
        Log in
        Log out
        Manage sessions
        See different features based on roles

2. Authorization (Student vs Teacher Access)
    Teachers: can manage course listings (create, view, edit, delete)
    Students: cannot edit or delete courses, can see only enrollment related pages

3. Student Course Enrollment System
    Students should be able to
        Search for courses via name or course number
        Add a course
        Drop a course
        View their schedule

4. Search Functionality
    Implement search options on the course listing page
        By course name
        By course number

5. Student pages
    Add pages/routes:
        /search - search courses
        /schedule - student's enrolled courses
        /add-to-schedule/<id>
        /drop-from-schedule/<id>

6. Update UI/Nav
    Students should be able to see:
        Search courses
        My schedule
    Teacher should be able to see:
        Manage Courses
        Add a course