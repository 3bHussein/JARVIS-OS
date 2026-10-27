export const appUrl:string;
export function requireNode(version?:string):void;
export function configuration(root:string):Record<string,string>;
export function assertFreePort(port:number):Promise<void>;
export function npmInstallCommand(platform?:string):{command:string;args:string[]};
