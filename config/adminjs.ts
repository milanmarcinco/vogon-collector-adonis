import { AdminJSProviderConfig, LucidResource } from '@adminjs/adonis'

import componentLoader from '../app/admin/component_loader.js'
// import authProvider from '../app/admin/auth.js'

import Measurement from '#models/measurement'
import Parameter from '#models/parameter'
import Sensor from '#models/sensor'
import User from '#models/user'

const adminjsConfig: AdminJSProviderConfig = {
  adapter: {
    enabled: true,
  },
  adminjs: {
    rootPath: '/admin',
    loginPath: '/admin/login',
    logoutPath: '/admin/logout',
    componentLoader,
    resources: [
      new LucidResource(User, 'postgres'),
      new LucidResource(Sensor, 'postgres'),
      new LucidResource(Parameter, 'postgres'),
      new LucidResource(Measurement, 'postgres'),
    ],
    pages: {},
    locale: {
      availableLanguages: ['en'],
      language: 'en',
      translations: {
        en: {
          actions: {},
          messages: {},
          labels: {},
          buttons: {},
          properties: {},
          components: {},
          pages: {},
          ExampleResource: {
            actions: {},
            messages: {},
            labels: {},
            buttons: {},
            properties: {},
          },
        },
      },
    },
    branding: {
      companyName: 'AdminJS',
      theme: {},
    },
    settings: {
      defaultPerPage: 10,
    },
  },
  auth: {
    enabled: false,
    // provider: authProvider,
    // middlewares: [],
  },
  middlewares: [],
}

export default adminjsConfig
