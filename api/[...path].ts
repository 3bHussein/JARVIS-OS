import {createCloudHandler} from '../apps/api/src/cloud-handler.ts';

export default {
  async fetch(request: Request) {
    const env = process.env;
    try {
      return await createCloudHandler({
        origin: env.JARVIS_CLOUD_ORIGIN ?? '',
        endpoint: env.UPSTASH_REDIS_REST_URL ?? '',
        token: env.UPSTASH_REDIS_REST_TOKEN ?? '',
        key: env.JARVIS_CLOUD_KEY ?? '',
        namespace: env.JARVIS_CLOUD_NAMESPACE ?? '',
        passwordHash: env.JARVIS_PASSWORD_HASH ?? '',
      })(request);
    } catch {
      return Response.json({error: 'cloud_setup_required'}, {status: 503, headers: {'Cache-Control': 'no-store'}});
    }
  },
};
