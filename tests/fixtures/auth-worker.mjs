import {createPublicWorker} from '../../workers/public.mjs';
import {googleFixture} from './google-oauth.mjs';
export default createPublicWorker({googleFetch:googleFixture()});
