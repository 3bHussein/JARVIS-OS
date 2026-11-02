export function validLocalModel(v:unknown):boolean;
export function installedModels(transport?:typeof fetch):Promise<string[]>;
export function validateSpeechPaths(python:string,model:string):Record<string,string>;
export function readEngineConfig(root:string):string;
export function patchEngineConfig(original:string,patch:Record<string,string>):string;
export function saveEngineConfig(root:string,original:string,patch:Record<string,string>):void;
