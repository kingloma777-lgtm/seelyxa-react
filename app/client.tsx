import { bootClient } from '@salla.sa/twilight-theme-engine/boot';
import { quietEngineDevLogs } from './lib/quietEngineDevLogs';
import appCssUrl from './styles/app.css?url';

// Before hydration, so the first client render is already quiet. No-op outside dev.
quietEngineDevLogs();

bootClient({ stylesheet: appCssUrl, load: () => import('./hydrate') });
