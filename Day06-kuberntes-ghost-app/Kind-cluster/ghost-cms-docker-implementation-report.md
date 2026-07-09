Implementation Steps

Created a custom Dockerfile by extending the official Ghost image.
Added a custom config.production.json file and configured the container to run as the non-root node user, exposed port 2368, and added a HEALTHCHECK instruction.
Created a .env file to manage Ghost and MySQL environment variables.
Configured config.production.json to use the required production settings.
Configured SMTP settings in config.production.json to enable email functionality for member signup, invites, and password reset.
Created a MySQL service configuration for the Ghost database.
Built the custom Ghost Docker image and verified that the build completed successfully.
Tagged the image and pushed it to Docker Hub.
Created a docker-compose.yml file to deploy the custom Ghost image together with the MySQL database.
Pulled the custom Ghost image from Docker Hub using Docker Compose.
Started the Ghost and MySQL containers with Docker Compose and verified that both services were running successfully.
Confirmed that the Ghost application connected successfully to the MySQL database.
Verified that SMTP was working correctly by testing member signup email delivery.
Verified the container health status and accessed the Ghost CMS locally through http://localhost:2368.
