/**
 * App Router Configuration
 * Main authenticated app uses Jira-like layout with sidebar navigation.
 */

import React, { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthContextProvider } from "./context/AuthContext";

// Lazy load pages
const HomePage = lazy(() => import("./pages/Marketing/HomePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const Login = lazy(() => import("./auth/Login"));
const Signup = lazy(() => import("./auth/Signup"));
const OTPVerify = lazy(() => import("./auth/OTPVerify"));
const AccountSetup = lazy(() => import("./auth/AccountSetup"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const ResetPasswordOTPVerify = lazy(() => import("./auth/ResetPasswordOTPVerify"));
const ResetPassword = lazy(() => import("./auth/ResetPassword"));
const About = lazy(() => import("./pages/Marketing/About"));
const Contact = lazy(() => import("./pages/Marketing/Contact"));
const Blog = lazy(() => import("./pages/Marketing/Blog"));
const Careers = lazy(() => import("./pages/Marketing/Careers"));
const PricingPage = lazy(() => import("./pages/Marketing/PricingPage"));
const Solutions = lazy(() => import("./pages/Marketing/Solutions"));
const Help = lazy(() => import("./pages/Marketing/Help"));
const BlogDetail = lazy(() => import("./pages/Marketing/BlogDetail"));
const SolutionDetail = lazy(() => import("./pages/Marketing/SolutionDetail"));
const ApplyNow = lazy(() => import("./pages/Marketing/ApplyNow"));
const HelpGuides = lazy(() => import("./pages/Marketing/HelpGuides"));
const Changelog = lazy(() => import("./pages/Marketing/Changelog"));
const SupportTicket = lazy(() => import("./pages/Marketing/SupportTicket"));
const GuideDetail = lazy(() => import("./pages/Marketing/GuideDetail"));
const Articles = lazy(() => import("./pages/Marketing/Articles"));
const Features = lazy(() => import("./pages/Marketing/Features"));
const RequestDemo = lazy(() => import("./pages/Marketing/RequestDemo"));

// Legacy App pages (protected) - can be removed when fully migrated
const AppLayout = lazy(() => import("./app/layouts/AppLayout"));
const ProjectsPage = lazy(() => import("./pages/App/ProjectsPage"));
const BoardPage = lazy(() => import("./pages/App/BoardPage"));
const NotificationsPage = lazy(() => import("./pages/App/NotificationsPage"));

// Phase 1 & 2 MVP pages (protected) - Jira-like layout
const AppShell = lazy(() => import("./components/layout/AppShell"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));

// New protected pages
const MyTasks = lazy(() => import("./pages/MyTasks"));
const GlobalActivity = lazy(() => import("./pages/GlobalActivity"));
const Invitations = lazy(() => import("./pages/Invitations"));
const Profile = lazy(() => import("./pages/Profile"));

// Project nested route components
const ProjectLayout = lazy(() => import("./pages/project/ProjectLayout"));
const ProjectOverview = lazy(() => import("./pages/project/ProjectOverview"));
const ProjectTasks = lazy(() => import("./pages/project/ProjectTasks"));
const ProjectMembers = lazy(() => import("./pages/project/ProjectMembers"));
const ProjectActivity = lazy(() => import("./pages/project/ProjectActivity"));
const ProjectSettings = lazy(() => import("./pages/project/ProjectSettings"));
const TaskDetail = lazy(() => import("./pages/project/TaskDetail"));


// Wrapper to add Suspense to each page individually
const withSuspense = (Component, fallback) => {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};

// Wrapper for protected layout routes (with Outlet)
const withProtectedLayout = (Component, fallback) => {
  return (
    <Suspense fallback={fallback}>
      <ProtectedRoute>
        <Component />
      </ProtectedRoute>
    </Suspense>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(HomePage, <Loading/>),
  },
  {
    path: "/login",
    element: withSuspense(Login, <Loading/>),
  },
  {
    path: "/signup",
    element: withSuspense(Signup, <Loading/>),
  },
  {
    path: "/verify-email",
    element: withSuspense(OTPVerify, <Loading/>),
  },
  {
    path: "/setup-password",
    element: withSuspense(AccountSetup, <Loading/>),
  },
  {
    path: "/setup-account",
    element: withSuspense(AccountSetup, <Loading/>),
  },
  {
    path: "/forgot-password",
    element: withSuspense(ForgotPassword, <Loading/>),
  },
  {
    path: "/reset-password-otp",
    element: withSuspense(ResetPasswordOTPVerify, <Loading/>),
  },
  {
    path: "/reset-password",
    element: withSuspense(ResetPassword, <Loading/>),
  },
  {
    path: "/about",
    element: withSuspense(About, <Loading/>),
  },
  {
    path: "/contact",
    element: withSuspense(Contact, <Loading/>),
  },
  {
    path: "/blog",
    element: withSuspense(Blog, <Loading/>),
  },
  {
    path: "/careers",
    element: withSuspense(Careers, <Loading/>),
  },
  {
    path: "/pricing",
    element: withSuspense(PricingPage, <Loading/>),
  },
  {
    path: "/features",
    element: withSuspense(Features, <Loading/>),
  },
  {
    path: "/solutions",
    element: withSuspense(Solutions, <Loading/>),
  },
  {
    path: "/help",
    element: withSuspense(Help, <Loading/>),
  },
  {
    path: "/help/guides",
    element: withSuspense(HelpGuides, <Loading/>),
  },
  {
    path: "/help/guides/:slug",
    element: withSuspense(GuideDetail, <Loading/>),
  },
  {
    path: "/help/changelog",
    element: withSuspense(Changelog, <Loading/>),
  },
  {
    path: "/help/ticket",
    element: withSuspense(SupportTicket, <Loading/>),
  },
  {
    path: "/blog/:id",
    element: withSuspense(BlogDetail, <Loading/>),
  },
  {
    path: "/solutions/:slug",
    element: withSuspense(SolutionDetail, <Loading/>),
  },
  {
    path: "/apply",
    element: withSuspense(ApplyNow, <Loading/>),
  },
  {
    path: "/articles",
    element: withSuspense(Articles, <Loading/>),
  },
  {
    path: "/request-demo",
    element: withSuspense(RequestDemo, <Loading/>),
  },
  // ==========================================
  // Protected Routes with Jira-like AppShell
  // ==========================================
  {
    path: "/",
    element: withProtectedLayout(AppShell, <Loading/>),
    children: [
      // Dashboard
      {
        path: "dashboard",
        element: withSuspense(Dashboard, <Loading/>),
      },
      // Projects list
      {
        path: "projects",
        element: withSuspense(Projects, <Loading/>),
      },
      // Project nested routes
      {
        path: "projects/:projectId",
        element: withSuspense(ProjectLayout, <Loading/>),
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: "overview",
            element: withSuspense(ProjectOverview, <Loading/>),
          },
          {
            path: "tasks",
            element: withSuspense(ProjectTasks, <Loading/>),
            children: [
              {
                path: ":taskId",
                element: withSuspense(TaskDetail, <Loading/>),
              },
            ],
          },
          {
            path: "members",
            element: withSuspense(ProjectMembers, <Loading/>),
          },
          {
            path: "activity",
            element: withSuspense(ProjectActivity, <Loading/>),
          },
          {
            path: "settings",
            element: withSuspense(ProjectSettings, <Loading/>),
          },
        ],
      },
      // New protected routes
      {
        path: "my-tasks",
        element: withSuspense(MyTasks, <Loading/>),
      },
      {
        path: "activity",
        element: withSuspense(GlobalActivity, <Loading/>),
      },
      {
        path: "invitations",
        element: withSuspense(Invitations, <Loading/>),
      },
      {
        path: "profile",
        element: withSuspense(Profile, <Loading/>),
      },
    ],
  },
  // Legacy App Routes (Protected) - can be removed when Phase 1 is stable
  {
    path: "/app",
    element: withProtectedLayout(AppLayout, <Loading/>),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "projects",
        element: withSuspense(ProjectsPage, <Loading/>),
      },
      {
        path: "projects/:projectId/board",
        element: withSuspense(BoardPage, <Loading/>),
      },
      {
        path: "notifications",
        element: withSuspense(NotificationsPage, <Loading/>),
      },
    ],
  },
  {
    path: "*",
    element: withSuspense(NotFoundPage, <div>Page not found...</div>),
  },
]);

function App() {
  return (
    <AuthContextProvider>
    <ThemeProvider>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </ThemeProvider>
    </AuthContextProvider>
  );
}

export default App;
