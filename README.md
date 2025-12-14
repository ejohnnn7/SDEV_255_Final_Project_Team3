Stage 1

Purpose: This branch should contain all the work required to finish Stage 1 of the project - focuses on teacher functionality and basic course management.

What should be included on this branch:
1. Basic Web App Setup
    Initial HTML structure
    Basic CSS layout or template
    Nav links between pages

2. Course actions
    Teachers should be able to:
        Add new course
            course name
            description
            subject
            number of credits
        View all courses
            on an index page
            links to view course details
        Edit existing courses
            update course info
            edit form page
        Delete courses

3. Basic Page Routing
    /courses - list all courses
    /add-course - form to add a course
    /edit-course/<id> - edit form
    /delete-course/<id> - delete route

4. Early Website Styling and Structure
    Initial layout
    Buttons for add/view/edit/delete
    Navigation links

Stage 2:

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