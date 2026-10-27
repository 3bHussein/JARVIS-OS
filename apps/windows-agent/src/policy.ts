export const allowedAgentTools = ['app.launch'] as const;
const apps: Record<string,string> = {progressxx:'https://3bhussein.github.io/ProgressXX-Web/',lexora:'https://3bhussein.github.io/Lexora-Academy/'};
// Policy prototype only. No shell, arbitrary URL, executable path or OS invocation.
export function planLaunch(appId: string, approved: boolean) {
  if(!approved||!Object.hasOwn(apps,appId)) throw new Error('Launch denied');
  return {tool:'app.launch',url:apps[appId],executed:false} as const;
}
