Installation & Setup

    Prerequisites:
        Node.js
        npm
        MongoDB (connection is already configured in the project)

    Dependencies

        This project uses the following main dependencies:
            express
            express-session
            mongoose
            bcryptjs
            dotenv
            fs-extra
            path
        All dependencies are listing in package.json

    Installaion Steps

        1. Clone the repository

             - git clone https://github.com/ejohnnn7/SDEV_255_Final_Project_Team3.git

            - cd coursemanager

        2. Install dependencies

            - npm install

        3. Start the application

            - npm start

        4. Open your browser and navigate to:

            - http://localhost:3000
            
    Authentication & Test Logins

        Test Accounts
            The following accounts can be used to test the application:

            Student Login:
                Email:
                Password:

            Teacher Login:
                Email:
                Password:

    Creating New Accounts

        Users can also create their own accounts directly through the application via the "Sign up here" button on the Login page.

        All user data, courses, and schedules are stored in MongoDB.