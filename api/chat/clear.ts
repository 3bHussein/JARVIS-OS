import {cloudFetch} from '../../apps/api/src/cloud-entry.ts';

export default {
  async fetch(request: Request) {
    return cloudFetch(request);
  },
};
