import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import UserManagementPage from './pages/admin/UserManagementPage';
import CourseManagementPage from './pages/admin/CourseManagementPage';
import EnrollmentPage from './pages/admin/EnrollmentPage';
import SiteSettingsPage from './pages/admin/SiteSettingsPage';

// Courses & Lessons
import CourseListPage from './pages/courses/CourseListPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import LessonPage from './pages/lessons/LessonPage';

// Assignments
import AssignmentListPage from './pages/assignments/AssignmentListPage';
import TakeAssignmentPage from './pages/assignments/TakeAssignmentPage';
import AssignmentResultPage from './pages/assignments/AssignmentResultPage';

// Manager
import UploadMaterialsPage from './pages/manager/UploadMaterialsPage';
import CreateAssignmentPage from './pages/manager/CreateAssignmentPage';
import ManagerStudentsPage from './pages/manager/ManagerStudentsPage';

// Analytics
import StudentAnalyticsPage from './pages/analytics/StudentAnalyticsPage';

// Parent
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildProgressPage from './pages/parent/ChildProgressPage';

export default function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Mrs. Nashwa Abdelhalim | SAT & EST Academy</title>
        <meta
          name="description"
          content="Official preparation platform for Grades 10, 11, and 12 American Diploma SAT and EST examinations with Mrs. Nashwa Abdelhalim."
        />
      </Helmet>

      <AuthProvider>
        {/* Custom Toast Container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#14100c',
              color: '#f5f0e8',
              border: '1px solid rgba(201, 169, 110, 0.35)',
              borderRadius: '16px',
              fontSize: '13px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            },
            success: {
              iconTheme: {
                primary: '#c9a96e',
                secondary: '#14100c',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4b4b',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Core Protected Routes for Authenticated Users */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CourseListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CourseDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/lessons/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LessonPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AssignmentListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assignments/:id/take"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TakeAssignmentPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assignments/:id/results"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AssignmentResultPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentAnalyticsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <UserManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'manager']}>
                  <Layout>
                    <CourseManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/enrollments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <EnrollmentPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/payments"
              element={<Navigate to="/admin/enrollments" replace />}
            />

            <Route
              path="/admin/site-settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <SiteSettingsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/manager/students"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <Layout>
                    <ManagerStudentsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager/upload"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'teacher']}>
                  <Layout>
                    <UploadMaterialsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager/assignments/create"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin', 'teacher']}>
                  <Layout>
                    <CreateAssignmentPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Parent Routes */}
            <Route
              path="/parent/dashboard"
              element={
                <ProtectedRoute allowedRoles={['parent', 'admin']}>
                  <Layout>
                    <ParentDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/parent/children/:id"
              element={
                <ProtectedRoute allowedRoles={['parent', 'admin']}>
                  <Layout>
                    <ChildProgressPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}
