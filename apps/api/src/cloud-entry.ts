import {GatewayProvider} from '../../../packages/ai/src/gateway.ts';
import {createCloudHandler} from './cloud-handler.ts';

export async function cloudFetch(request: Request) {
    const env = process.env;
    try {
      const endpoint = env.UPSTASH_REDIS_REST_URL;
      const token = env.UPSTASH_REDIS_REST_TOKEN;
      const explicitRedis = endpoint !== undefined || token !== undefined;
      let aiProvider;
      try{if(env.JARVIS_CLOUD_AI_ENABLED==='1'&&env.JARVIS_AI_MODEL&&(env.AI_GATEWAY_API_KEY||env.VERCEL_OIDC_TOKEN))aiProvider=new GatewayProvider(env.JARVIS_AI_MODEL,env.AI_GATEWAY_API_KEY||env.VERCEL_OIDC_TOKEN!);}catch{/* Bad optional AI configuration must not take the workspace offline. */}
      return await createCloudHandler({
        origin: env.JARVIS_CLOUD_ORIGIN ?? '',
        endpoint: (explicitRedis ? endpoint : env.KV_REST_API_URL) ?? '',
        token: (explicitRedis ? token : env.KV_REST_API_TOKEN) ?? '',
        key: env.JARVIS_CLOUD_KEY ?? '',
        namespace: env.JARVIS_CLOUD_NAMESPACE ?? '',
        passwordHash: env.JARVIS_PASSWORD_HASH ?? '',
        aiProvider,aiModel:aiProvider?env.JARVIS_AI_MODEL:undefined,
        recovery: {email:env.JARVIS_RECOVERY_EMAIL, from:env.JARVIS_EMAIL_FROM, apiKey:env.RESEND_API_KEY},
      })(request);
    } catch {
      return Response.json({error: 'cloud_setup_required'}, {status: 503, headers: {'Cache-Control': 'no-store'}});
    }
}

