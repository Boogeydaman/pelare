import { FigureSheet } from './dev/FigureSheet';
import { CustomExercisePage } from './modules/gym/custom';
import { WrappedPage } from './screens/Wrapped';
import { Splash } from './screens/Splash';
import { RehabHome } from './rehab/RehabHome';
import { RehabPlan } from './rehab/Plan';
import { RehabCourse, RehabLesson } from './rehab/Course';
import { RehabTests } from './rehab/Tests';
import { LeaveRehab } from './rehab/LeaveRehab';
import { inRehab } from './rehab/state';
import { useCtx } from './core/ctx';
import { Navigate, Outlet, RouterProvider, createHashRouter, type RouteObject } from 'react-router-dom';
import { CtxProvider } from './core/ctx';
import { useProfile } from './core/db';
import './core/theme';
import { MODULE_LIST } from './modules/registry';
import { ArticlePage, ArticlesPage } from './screens/Articles';
import { ModuleHome } from './screens/module/ModuleHome';
import { HistoryPage, LibraryDetail, LibraryPage, LogPage, ProgramPage, ProgressPage } from './screens/module/subpages';
import { Onboarding } from './screens/Onboarding';
import { DonePage, PlayerPage } from './screens/Player';
import { OtherLog, SessionDetail } from './screens/SessionDetail';
import { Settings } from './screens/Settings';
import { Today } from './screens/Today';
import { You } from './screens/You';
import { TabLayout } from './shared/layout/TabLayout';

/** Waits for the database, then shows onboarding or the app. */
/** I dag: the rehab mode's own home when you are in it, otherwise the normal coach. */
function TodayOrRehab() {
  const ctx = useCtx();
  return inRehab(ctx?.profile, ctx?.now) ? <RehabHome /> : <Today />;
}

function Root() {
  const profile = useProfile();
  if (profile === undefined) return null;
  if (profile === null) return <Onboarding />;
  return <CtxProvider><Outlet /><Splash /></CtxProvider>;
}

// Every module gets the same set of routes.
const moduleRoutes: RouteObject[] = MODULE_LIST.flatMap((m) => [
  { path: m.slug, element: <ModuleHome m={m} /> },
  { path: `${m.slug}/program`, element: <ProgramPage m={m} /> },
  { path: `${m.slug}/framsteg`, element: <ProgressPage m={m} /> },
  { path: `${m.slug}/bibliotek`, element: <LibraryPage m={m} /> },
  { path: `${m.slug}/bibliotek/:id`, element: <LibraryDetail m={m} /> },
  { path: `${m.slug}/historik`, element: <HistoryPage m={m} /> },
  { path: `${m.slug}/logga`, element: <LogPage m={m} /> },
]);

const router = createHashRouter([
  ...(import.meta.env.DEV ? [{ path: 'figurer', element: <FigureSheet /> }] : []),
  {
    element: <Root />,
    children: [
      {
        element: <TabLayout />,
        children: [
          { index: true, element: <Navigate to="/idag" replace /> },
          { path: 'idag', element: <TodayOrRehab /> },
          { path: 'rehab/plan', element: <RehabPlan /> },
          { path: 'rehab/las', element: <RehabCourse /> },
          { path: 'rehab/las/:id', element: <RehabLesson /> },
          { path: 'rehab/tester', element: <RehabTests /> },
          { path: 'du', element: <You /> },
          { path: 'historik', element: <HistoryPage /> },
          { path: 'logg/:id', element: <SessionDetail /> },
          { path: 'logga', element: <OtherLog /> },
          { path: 'las', element: <ArticlesPage /> },
          { path: 'las/:id', element: <ArticlePage /> },
          ...moduleRoutes,
          { path: 'gym/egen-ovning', element: <CustomExercisePage /> },
          { path: 'gym/egen-ovning/:id', element: <CustomExercisePage /> },
        ],
      },
      { path: 'pass', element: <PlayerPage /> },
      { path: 'veckan', element: <WrappedPage /> },
      { path: 'pass/klart', element: <DonePage /> },
      { path: 'installningar', element: <Settings /> },
      { path: 'lamna-rehab', element: <LeaveRehab /> },
      { path: '*', element: <Navigate to="/idag" replace /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
