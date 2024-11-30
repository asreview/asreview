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
import "@fontsource/roboto-serif/400.css";

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
              <Route path="/signin" element={<AuthPage signIn={true} />} />
              {window.allowAccountCreation && (
                <Route path="/signup" element={<AuthPage signUp={true} />} />
              )}
              {window.emailVerification && (
                <Route
                  path="/forgot_password"
                  element={<AuthPage forgotPassword={true} />}
                />
              )}
              {window.emailVerification && (
                <Route
                  path="/reset_password"
                  element={<AuthPage resetPassword={true} />}
                />
              )}
              {window.emailVerification && (
                <Route
                  path="/change_email"
                  element={<AuthPage changeEmail={true} />}
                />
              )}
              <Route path="/oauth_callback" element={<SignInOAuthCallback />} />
            </>
          )}
          <Route path="projects" element={<Navigate to="/reviews" />} />
          <Route path="" element={<Navigate to="/reviews" />} />
          <Route path="profile" element={<PageWithDrawer />}>
            <Route
              index
              element={
                <>
                  <PageHeader>Profile</PageHeader>
                  <ProfilePage mobileScreen={mobileScreen} />
                </>
              }
            />
          </Route>
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
            <>
              {" "}
              {/* Wrap contextprovider to pass mode */}
              <Route index element={<AnalyticsPage />} />
              <Route path="reviewer" element={<ReviewPage />} />
              <Route
                path="collection"
                element={<LabelHistory mode={"oracle"} />}
              />
              {window.authentication && window.allowTeams && (
                <Route path="team" element={<TeamPage />} />
              )}
              <Route path="settings" element={<DetailsPage />} />
            </>
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
            <Route index element={<AnalyticsPage />} />
            <Route
              path="collection"
              element={<LabelHistory mode={"simulate"} />}
            />
            {window.authentication && window.allowTeams && (
              <Route path="team" element={<TeamPage />} />
            )}
            <Route path="settings" element={<DetailsPage />} />
          </Route>
          <Route path="*" element={<RouteNotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
