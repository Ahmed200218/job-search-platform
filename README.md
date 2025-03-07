### **README.md for Job Search Platform (Node.js, GraphQL, Socket.IO)**  

```md
# Job Search Platform (Node.js, GraphQL, Socket.IO)

A back-end **job search and hiring platform** built using **Node.js, Express, GraphQL, MongoDB, Mongoose, Cloudinary, and Socket.IO**.  
This project allows **users, HRs, and admins** to manage job postings, applications, real-time chat, authentication, and admin approvals.

---

## **Features**
### ** User Authentication & Profile Management**
- **Signup & Login** (Email/Password & Google OAuth)
- **Two-Factor Authentication (2FA)**
- **Profile Management** (Update profile, upload profile/cover images)
- **Password Reset & OTP Verification**
- **Soft Delete Account**

### **Company Management**
- **Company Registration** (With legal attachments)
- **Company Approval by Admin**
- **HR Management** (HRs can post and manage jobs)
- **Soft Delete & Ban Company**
- **Search & Filter Companies**

### **Job Management**
- **Create, Update, and Delete Jobs**
- **Filter Jobs** (By title, location, seniority level, skills)
- **Soft Delete (Mark Job as Closed)**
- **Apply to Jobs (Upload CV)**
- **HRs Accept/Reject Applicants with Email Notifications**

### **Admin Dashboard**
- **GraphQL Query to Fetch All Users & Companies**
- **Ban/Unban Users & Companies**
- **Approve Companies**
- **Monitor Job Postings & Applications**

### **Real-time Chat (Socket.IO)**
- **HRs or Company Owners Start Conversations**
- **Users Can Reply Once Contacted**
- **Real-time Messaging Support**
- **Chat History Retrieval**

---

## **Tech Stack**
- **Backend:** Node.js, Express, GraphQL, Socket.IO
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, Google OAuth, OTP Verification
- **File Uploads:** Cloudinary (User Profile Pics, Company Logos, Job Applications)
- **Security:** Helmet, Rate-Limiting, CORS, Password Hashing (bcrypt)
- **Real-time Features:** WebSockets (Socket.IO)

---

## **Installation & Setup**
### **Clone the Repository**
```sh
git clone https://github.com/your-repo/job-search-platform.git
cd job-search-platform
```

### **Install Dependencies**
```sh
npm install
```

### **Start the Server**
```sh
npm run start:dev
```
Server will run on `http://localhost:3000`

---

## API Documentation 
### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/confirm-otp` | Confirm OTP for email verification |
| `POST` | `/auth/signin` | Login with email/password |
| `POST` | `/auth/signup/google` | Register with Google OAuth |
| `POST` | `/auth/signin/google` | Login with Google OAuth |
| `POST` | `/auth/send-otp` | Send OTP for password reset |
| `POST` | `/auth/reset-password` | Reset password using OTP |
| `POST` | `/auth/refresh-token` | Refresh access token |
| `POST` | `/auth/cron/delete-expired-otps` | CRON job to delete expired OTPs |

### **User Management**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT`  | `/user/update` | Update user details (name, mobile, DOB, etc.) |
| `PUT`  | `/user/update-password` | Update user password |
| `GET`  | `/user/profile` | Get logged-in user's profile |
| `GET`  | `/user/:userId` | View another user's profile |
| `PUT`  | `/user/upload-profile-pic` | Upload profile picture |
| `PUT`  | `/user/upload-cover-pic` | Upload cover picture |
| `DELETE` | `/user/delete-profile-pic` | Delete profile picture |
| `DELETE` | `/user/delete-cover-pic` | Delete cover picture |
| `DELETE` | `/user/soft-delete` | Soft delete user account |

### **Company Management**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/company/add` | Register a new company |
| `PUT`  | `/company/update/:companyId` | Update company details |
| `DELETE` | `/company/soft-delete/:companyId` | Soft delete a company |
| `GET` | `/company/search?name=Tech` | Search companies by name |
| `GET` | `/company/:companyId` | Get a specific company with related jobs |
| `PUT`  | `/company/upload-logo/:companyId` | Upload company logo |
| `PUT`  | `/company/upload-cover/:companyId` | Upload company cover image |
| `DELETE` | `/company/delete-logo/:companyId` | Delete company logo |
| `DELETE` | `/company/delete-cover/:companyId` | Delete company cover image |

### **Job Management**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/job/add` | Create a new job |
| `PUT`  | `/job/update/:jobId` | Update job details |
| `DELETE` | `/job/delete/:jobId` | Soft delete (close) a job |
| `GET` | `/job` | Get all jobs with pagination |
| `GET` | `/job/:companyId` | Get jobs for a specific company |
| `GET` | `/job/filter` | Search & filter jobs |
| `GET` | `/job/:jobId/applications` | Get all applications for a job |
| `POST` | `/job/:jobId/apply` | Apply for a job (Upload CV) |
| `PUT`  | `/job/:jobId/application/:applicationId` | Accept/Reject job application |

### **Admin Dashboard**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/graphql` | Get all users & companies (GraphQL) |
| `PUT`  | `/admin/ban-user/:userId` | Ban or Unban a user |
| `PUT`  | `/admin/ban-company/:companyId` | Ban or Unban a company |
| `PUT`  | `/admin/approve-company/:companyId` | Approve a company |

### **Real-time Chat (Socket.IO)**
| Event | Description |
|--------|-------------|
| `register` | Register user after login |
| `sendMessage` | Send a message |
| `receiveMessage` | Receive new messages |
| `chat/history/:userId` | Get chat history with a specific user |

---

## **How to Test in Postman**
postman collection with all the required requests (exept for the live chat) is exported in the project folder
---

## **Contributors**
- **Ahmed hassan abd-elmaged** (Backend & GraphQL APIs)

---