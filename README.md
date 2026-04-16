Role-Based Blog Platform with Secret-Key Controlled API 
Access 
1. Project Overview 
The project is a backend-based blog platform built using Node.js, MongoDB, and WebSocket. The 
system supports different roles such as Admin, Writer, and User. 
The platform allows writers to create blogs, admins to approve and manage blogs, and users to 
interact with published blogs. 
A special requirement of the system is the use of a Secret Key with JWT Token to control access to 
blog APIs. Instead of multiple API routes, the blog operations such as create, list, update, and delete 
will be handled through a single endpoint, and the behavior will change depending on the role and 
secret key provided in the request. 
2. Objectives 
➢ The objectives of the system include: 
➢ Provide secure authentication using Access Token and Refresh Token 
➢ Implement role-based access control 
➢ Manage blog creation and approval workflow 
➢ Allow single API endpoint for blog operations 
➢ Control blog access using JWT Token + Secret Key 
➢ Enable user engagement through likes and comments 
➢ Provide real-time notifications using WebSocket 
3. User Roles 
❑ Admin 
Admin is responsible for managing the platform and approving blogs. 
Admin capabilities: 
➢ View all blogs (published and unpublished) 
➢ Create blogs 
➢ Update any blog 
➢ Delete any blog 
➢ Approve blog publishing 
➢ Manage blog categories 
➢ Receive notifications for new blog submissions 
➢ Admin must send Admin Token + Secret Key to access full blog data. 
❑ Writer 
Writers create and manage their own blogs. 
Writer capabilities: 
➢ Create blogs 
➢ Update their own blogs 
➢ Delete their own blogs 
➢ View their own blogs (published or unpublished) 
➢ Receive notification when blog is approved 
➢ Writers must send Writer Token + Secret Key to access their blog data. 
❑ User 
Users are readers who interact with blogs. 
User capabilities: 
➢ View published blogs 
➢ Like blogs 
➢ Comment on blogs 
➢ Users cannot create or modify blogs. 
4. Authentication Requirements 
The system must provide the following authentication features: 
➢ User registration 
➢ User login 
➢ Access token generation 
➢ Refresh token mechanism 
➢ Secure logout 
Access tokens will be used for API authorization, while refresh tokens will generate new access 
tokens when expired. 
5. Secret Key Based API Access 
The system will require a secret key along with the JWT token to access blog management APIs. 
The secret key will be passed through request headers.  
Example header structure: 
Authorization: Bearer <token> 
x-secret-key: <SECRET_KEY> 
The system must validate both the JWT token and the secret key before allowing access to blog 
operations. 
This mechanism is designed to control access to a single blog API endpoint. 
6. Blog Management Requirements 
Blog operations will be handled using a single endpoint that supports multiple actions depending on 
the request method and role. 
The same endpoint must handle: 
➢ Blog creation 
➢ Blog listing 
➢ Blog updating 
➢ Blog deletion 
The system will determine the allowed operation based on: 
➢ User role 
➢ Token validity 
➢ Secret key validation 
7. Blog Access Behaviour Based on Role 
The behaviour of the blog API will change depending on the role and secret key. 
Admin Access 
If the request contains: 
➢ Valid admin token 
➢ Valid secret key 
The admin can: 
➢ View all blogs 
➢ Create blogs 
➢ Update any blog 
➢ Delete any blog 
Admin will receive a list of all blogs, including: 
➢ Published blogs 
➢ Pending blogs 
➢ Draft blogs 
Writer Access 
If the request contains: 
➢ Valid writer token  
➢ Valid secret key 
The writer can: 
➢ Create blogs 
➢ Update their own blogs 
➢ Delete their own blogs 
➢ View only their own blogs 
Writers cannot access blogs created by other writers. 
Public Access 
If the request does not contain token and secret key: 
➢ Only published blogs will be returned. 
➢ Public users cannot create, update, or delete blogs. 
8. Blog Publishing Workflow 
The blog publishing process will follow this workflow: 
➢ Writer creates a blog 
➢ Blog status becomes pending 
➢ Admin reviews the blog 
➢ Admin publishes the blog 
Only admins can change the blog status to published. 
9. Category Management 
Categories help organize blogs. 
Category management is restricted to admins. 
Admin capabilities: 
➢ Add categories 
➢ Manage category list 
Writers and users can only view categories when creating or reading blogs. 
10. Blog Interaction Features 
The system will support user engagement features. 
Likes 
Users can like blogs. 
Requirements: 
➢ One like per user per blog 
➢ Users can remove their like 
Comments 
Users can comment on blogs. 
Requirements: 
➢ Comments must be associated with the blog and user 
➢ Comment history should be stored 
11. Real-Time Notifications 
The system will include WebSocket-based notifications. 
Notifications will be triggered for events such as: 
Blog Submission 
➢ When a writer submits a blog, the admin will receive a notification. 
Blog Approval 
➢ When an admin publishes a blog, the writer will receive a notification. 
Blog Interaction  
➢ When a blog receives a new comment or like, the author may receive a notification. 
12. Security Requirements 
The system must ensure: 
➢ Secure password hashing 
➢ Token-based authentication 
➢ Secret key validation for sensitive APIs 
➢ Input validation 
➢ Protection against unauthorized data access