
# **CO₂Champion**

**Empowering companies to track and achieve their CO₂ reduction goals.**

---

## **Table of Contents**
1. [Introduction](#introduction)
2. [Features](#features)
3. [Setup and Installation](#setup-and-installation)
4. [User Roles](#user-roles)
5. [Application Functionality](#application-functionality)
6. [Data Validity and Security](#data-validity-and-security)
7. [Contributors](#contributors)
8. [Course and Lecturers](#course-and-lecturers)

---

## **Introduction**
**CO₂Champion** is a web-based application designed to empower companies in tracking, setting, and managing their carbon emission reduction goals. The platform promotes sustainability through data visualization, progress tracking, and competitive benchmarking.

The application aligns with the theme of **“Hope – who will turn the tide?”**, providing transparency and accountability in corporate carbon management to inspire sustainable practices.

**Database**

The database is included and comes pre-filled with test data for easier development and testing. The test data consists of:

- Sample company accounts
- Example CO₂ reduction goals
- Mock reports for visualization and benchmarking

**Credentials**
- Users: user1-user20
- PW: Password123!

Django Admin
- User: admin
- PW: admin
---

## **Features**
### **Core Functionalities**
- **Goal Management**  
  Set and update CO₂ reduction goals with:
  - Baseline emissions (≥50 tons/year)
  - Target emissions (≥20% reduction from baseline)
  - Deadline (6 months to 125 years in the future)

- **CO₂ Reporting**  
  Submit, edit, and delete progress reports with:
  - Titles (max 200 characters)
  - Descriptions (max 800 characters)
  - Reduced emissions (positive values ≤ baseline)
  - Submission dates (between goal start and deadline)

- **Data Visualization**  
  Interactive dashboards showing:
  - Progress timelines
  - Reduction percentages
  - Historical trends
  - Company rankings

- **Competitive Benchmarking**  
  Leaderboard displaying:
  - Top 10 companies
  - User's company rank (if outside top 10)
  - Global comparison metrics

- **Data Export**  
  Download CO₂ reports and goal data in CSV format.

### **Security & Compliance**
- 🔐 JWT authentication for all user actions
- 🛡️ GDPR-compliant data handling:
  - Self-service data access/modification
  - Right to be forgotten implementation
  - Encrypted sensitive data storage
- ⚙️ Validation rules enforced at API and UI layers

---

## **Setup and Installation**
### **Requirements**
- **Backend**: Python 3.12.6, Django 5.1.2
- **Frontend**: 
    - Angular: 18.2.13
    - Node.js: 22.11.0
    - npm: 9.8.0
    - TypeScript: 5.5.4
    - RxJS: 7.8.1
- **Database**: SQLite 3.45.3

### **Steps**
1. **Clone the repository**:
   ```bash
   git clone https://github.com/eisballi/co2champion.git
   cd .\co2champion\
   ```

2. **Set up the virtual environment**:
   ```bash
   python -m venv env
   source env/bin/activate  # Linux/Mac
   .\env\Scripts\activate   # Windows
   ```

3. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations**:
   ```bash
   cd .\backend_co2champion\ 
   python manage.py migrate
   ```

5. **Start the backend server**:
   ```bash
   python manage.py runserver
   ```

6. **Navigate to the frontend**:
   ```bash
   cd .\frontend_co2champion\
   npm install
   ng serve
   ```

7. **Access the app**:
   - Backend: [http://localhost:8000](http://localhost:8000)
   - Frontend: [http://localhost:4200](http://localhost:4200)
   - Django Admin: [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)

---

## **User Roles**
### **Admin**
In Django Admin:
- Manages platform data integrity.
- Can view all company data and reports.

### **Registered Companies**
- Submit and track CO₂ goals and progress reports.
- Access their historical data and download CSV files.

### **Public Users**
- View leaderboard and company progress.

---

## **Contributors**
- **Erjon Helshani**
- **Simon Zeidler**
- **Sorush Shahidy**

---

## **Course and Lecturers**
### **FH Joanneuem**
- Bachelor Studiengang "Wirtschaftsinformatik" IMA, WINF
- IMA22 im WS 2024/25
### **Course Details**
- **Course Name**: Web Application Development 2
- **Semester**: WS 2024/2025
- **Credits**: 5 ECTS

### **Lecturers**
#### **Karl Kreiner**
#### **Stefan Krasser**

---

For questions or feedback, please contact us via the repository’s [GitHub Issues](https://github.com/eisballi/co2champion/issues).
