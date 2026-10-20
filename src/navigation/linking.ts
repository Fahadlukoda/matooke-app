import type { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native';

import type { AuthStackParamList } from './AuthStack';
import type { EventsStackParamList } from './EventsStack';
import type { HomeStackParamList } from './HomeStack';
import type { MainTabParamList } from './MainTabs';
import type { ProfileStackParamList } from './ProfileStack';
import type { ResultsStackParamList } from './ResultsStack';
import type { RunStackParamList } from './RunStack';

export type RootNavigationParamList = AuthStackParamList & {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Events: NavigatorScreenParams<EventsStackParamList>;
  Run: NavigatorScreenParams<RunStackParamList>;
  Results: NavigatorScreenParams<ResultsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
} & Omit<MainTabParamList, 'Home' | 'Events' | 'Run' | 'Results' | 'Profile'>;

export const linking: LinkingOptions<RootNavigationParamList> = {
  prefixes: ['matooke://', 'https://teammatooke.co.ug'],
  config: {
    screens: {
      Welcome: 'welcome',
      SignIn: 'signin',
      SignUp: 'signup',
      Home: {
        screens: {
          HomeFeed: 'home',
          PostDetail: 'posts/:postId',
        },
      },
      Events: {
        screens: {
          EventsList: 'events',
          EventDetail: 'events/:eventId',
          MyRegistrations: 'registrations',
        },
      },
      Run: {
        screens: {
          RunReady: 'run',
          RunSummary: 'run/summary',
          RunDetail: 'run/:runId',
          RunHistory: 'runs',
        },
      },
      Results: {
        screens: {
          MyResults: 'results',
          Leaderboard: 'leaderboard',
          EventResults: 'results/event/:eventId',
        },
      },
      Profile: {
        screens: {
          ProfileHome: 'profile',
          EditProfile: 'profile/edit',
          PrivateDetails: 'profile/private-details',
          Settings: 'settings',
          MyReceipts: 'receipts',
        },
      },
    },
  },
};
