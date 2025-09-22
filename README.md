# HRIS - Human Resource Information System

A comprehensive Human Resource Information System built with Laravel and React, designed to streamline HR operations and employee management.

## 🌟 Features

### 👥 User Management

- **Employee Profiles**: Complete employee information management with profile pictures
- **Role-Based Access Control**: Multi-level permissions with roles and permissions management
- **Platform & Company Management**: Multi-tenant architecture supporting multiple platforms and companies
- **Department & Position Management**: Organizational structure management
- **Manager Hierarchy**: Employee-manager relationships and reporting structure

### 🏢 Organizational Management

- **Company Management**: Multi-company support with domain-based access
- **Platform Management**: Multiple platform ecosystem with role-based access
- **Department Structure**: Hierarchical department organization
- **Position Management**: Job position definitions and management
- **Menu Builder**: Dynamic menu management for different platforms

### 📅 Leave Management

- **Leave Types**: Configurable leave types (vacation, sick leave, personal, etc.)
- **Leave Settings Templates**: Reusable leave policy templates
- **User Leave Settings**: Individual leave configurations per employee
- **Leave Requests**: Complete leave request workflow with approval process
- **Leave Accrual System**: Automated leave balance calculations
- **Balance Tracking**: Real-time leave balance monitoring
- **Approval Workflow**: Manager-based approval system
- **Leave History**: Complete audit trail of leave requests

### ⏰ Time & Attendance

- **Attendance Tracking**: Daily attendance recording for groups and events
- **Overtime Requests**: Overtime request and approval system
- **Time Tracking**: Start/end time recording for overtime
- **Approval Workflow**: Manager approval for overtime requests
- **Attendance Reports**: Comprehensive attendance reporting

### 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Web and API session handling
- **Role-Based Security**: Granular permission system
- **Multi-Factor Authentication Ready**: Extensible authentication system
- **Password Management**: Secure password policies and reset functionality

### 📊 Dashboard & Reporting

- **Admin Dashboard**: Comprehensive administrative overview
- **User Dashboard**: Personalized employee dashboard
- **Analytics**: HR metrics and reporting
- **Real-time Data**: Live updates and notifications

### 🎨 User Interface

- **Modern Design**: Clean, responsive interface built with React
- **Mobile Responsive**: Optimized for all device sizes
- **Dark/Light Mode**: Theme switching capability
- **Component Library**: Built with shadcn/ui components
- **Intuitive Navigation**: User-friendly navigation structure

## 🛠️ Technology Stack

### Backend

- **PHP 8.3**: Modern PHP with latest features
- **Laravel 12**: Latest Laravel framework
- **MySQL**: Primary database
- **JWT Authentication**: php-open-source-saver/jwt-auth
- **Spatie Packages**:
    - Laravel Permission (roles & permissions)
    - Laravel Media Library (file management)
    - Laravel Query Builder (advanced filtering)

### Frontend

- **React 19**: Latest React with modern hooks
- **TypeScript**: Type-safe development
- **Inertia.js**: Modern monolithic architecture
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful icon library

### Development Tools

- **Vite**: Lightning-fast build tool
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Pest**: Modern PHP testing framework
- **Docker**: Containerized development environment

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd hris
composer install && npm install

# Configure and migrate
cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# Start development
composer dev  # Starts all services with hot reload
```

## 🎯 Key Features Overview

### Leave Management System

- **Flexible Accrual Types**: Support for various accrual methods (monthly, yearly, custom)
- **Carry-over Support**: End-of-year leave carry-over functionality
- **Automated Processing**: Background jobs for leave accrual calculations
- **Balance Validation**: Real-time balance checking during request submission

### Multi-Tenant Architecture

- **Platform Isolation**: Complete data separation between platforms
- **Company-Specific Roles**: Role assignments per company within platforms
- **Dynamic Menu System**: Platform-specific navigation and features

### Advanced Permissions

- **Granular Control**: Fine-grained permission system
- **Role Inheritance**: Hierarchical role structure
- **Platform-Company Scoping**: Permissions scoped to specific platform-company combinations

## 🛠️ HRIS-Specific Commands

### Leave Management

- `php artisan leave:process-accruals` - Process leave accruals
- `php artisan leave:year-end-carryover` - Process year-end carry-over
- `php artisan leave:accrual-summary` - Show leave accrual summary
