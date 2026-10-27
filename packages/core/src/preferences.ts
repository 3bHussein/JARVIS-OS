import type {Locale} from './index.ts';
export interface Preferences {locale:Locale;zone:string;motion:'full'|'reduced'|'off';quiet:boolean;}
export const defaultPreferences:Preferences={locale:'en',zone:'Africa/Cairo',motion:'full',quiet:true};
export const preferencesKey='jarvis-device-preferences-v1';
export function preferences(value:unknown):Preferences {
  const p=value&&typeof value==='object'?value as Record<string,unknown>:{};
  let zone=defaultPreferences.zone;
  if(typeof p.zone==='string'&&p.zone.length<100){try{new Intl.DateTimeFormat('en',{timeZone:p.zone}).format();zone=p.zone;}catch{}}
  return {locale:p.locale==='ar'?'ar':'en',zone,motion:p.motion==='off'||p.motion==='reduced'?p.motion:'full',quiet:typeof p.quiet==='boolean'?p.quiet:true};
}
export function readPreferences(storage:Pick<Storage,'getItem'>):Preferences {
  try{return preferences(JSON.parse(storage.getItem(preferencesKey)||'null'));}catch{return {...defaultPreferences};}
}
/** Persist only non-sensitive validated preferences, never chat or tokens. */
export function savePreferences(storage:Pick<Storage,'setItem'>,value:unknown):boolean {
  try{storage.setItem(preferencesKey,JSON.stringify(preferences(value)));return true;}catch{return false;}
}
