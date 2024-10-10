import { useMediaQuery, CssBaseline } from "@mui/material";
import { AuthPage, ProjectDrawerItems } from "Components";
import {
  ProfilePage,
  ProjectsOverview,
} from "HomeComponents/DashboardComponents";
import { AnalyticsPage } from "ProjectComponents/AnalyticsComponents";
import { DetailsPage } from "ProjectComponents/DetailsComponents";
import { LabelHistory } from "ProjectComponents/HistoryComponents";
import { TeamPage } from "ProjectComponents/TeamComponents";
import { Navigate, Route, Routes } from "react-router-dom";
import RouteNotFound from "RouteNotFound";
import { PageHeader } from "StyledComponents/StyledPageHeader";

import { ReviewPage } from "ProjectComponents/ReviewComponents";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./App.css";

import {
  LandingDrawerItems,
  PageWithDrawer,
  SignInOAuthCallback,
} from "Components";

// Ensure that on localhost we use 'localhost' instead of '127.0.0.1'
const currentDomain = window.location.href;
if (currentDomain.includes("127.0.0.1")) {
  let newDomain = currentDomain.replace("127.0.0.1", "localhost");
  window.location.replace(newDomain);
}

const App = () => {
  const mobileScreen = useMediaQuery((theme) => theme.breakpoints.down("md"), {
    noSsr: true,
  });

  return (
    <>
      <CssBaseline />

      <div aria-label="nav and main content">
        <Routes>
          {/* Authentication routes */}
          {window.authentication && (
            <>
              <Route path="/signin" element={<AuthPage />} />
              <Route path="/oauth_callback" element={<SignInOAuthCallback />} />
              <Route
                path="/reset_password"
                element={<AuthPage reset_password={true} />}
              />
            </>
          )}
          <Route path="projects" element={<Navigate to="/reviews" />} />
          <Route path="" element={<Navigate to="/reviews" />} />
          <Route
            path="profile"
            element={<ProfilePage mobileScreen={mobileScreen} />}
          />
          <Route
            path="reviews"
            element={<PageWithDrawer navComponent={LandingDrawerItems} />}
          >
            <Route
              index
              element={
                <ProjectsOverview mobileScreen={mobileScreen} mode={"oracle"} />
              }
            />
          </Route>
          <Route
            path="simulations"
            element={<PageWithDrawer navComponent={LandingDrawerItems} />}
          >
            <Route
              index
              element={
                <ProjectsOverview
                  mobileScreen={mobileScreen}
                  mode={"simulate"}
                />
              }
            />
          </Route>
          <Route
            path="reviews/:project_id/"
            element={
              <PageWithDrawer
                navComponent={ProjectDrawerItems}
                navComponentProps={{ subset: "reviews" }}
              />
            }
          >
            <Route
              index
              element={
                <>
                  <PageHeader>Dashboard</PageHeader>
                  <AnalyticsPage />
                </>
              }
            />

            <Route path="review" element={<ReviewPage />} />

            <Route
              path="collection"
              element={
                <>
                  <PageHeader>Collection</PageHeader>
                  <LabelHistory />
                </>
              }
            />

            {window.authentication && window.allowTeams && (
              <Route
                path="team"
                element={
                  <>
                    <PageHeader>Team</PageHeader>
                    <TeamPage />
                  </>
                }
              />
            )}
            <Route
              path="settings"
              element={
                <>
                  <PageHeader>Settings</PageHeader>
                  <DetailsPage />
                </>
              }
            />
          </Route>
          <Route
            path="simulations/:project_id"
            element={
              <PageWithDrawer
                navComponent={ProjectDrawerItems}
                navComponentProps={{ subset: "simulations" }}
              />
            }
          >
            <Route
              index
              element={
                <>
                  <PageHeader>Dashboard</PageHeader>
                  <AnalyticsPage />
                </>
              }
            />

            <Route
              path="collection"
              element={
                <>
                  <PageHeader>Collection</PageHeader>
                  <LabelHistory />
                </>
              }
            />

            {window.authentication && window.allowTeams && (
              <Route
                path="team"
                element={
                  <>
                    <PageHeader>Team</PageHeader>
                    <TeamPage />
                  </>
                }
              />
            )}
            <Route
              path="settings"
              element={
                <>
                  <PageHeader>Settings</PageHeader>
                  <DetailsPage />
                </>
              }
            />
          </Route>
          <Route path="*" element={<RouteNotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
