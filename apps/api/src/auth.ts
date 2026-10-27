import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
export function hashPassword(password: string) {
  if(password.length<12||password.length>256) throw new Error('Use 12–256 characters');
  const salt=randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;
}
export function checkPassword(password: string, stored: string) {
  if(password.length>256||!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) return false;
  const [salt,expected]=stored.split(':');
  return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(expected,'hex'));
}
export class Sessions {
  private values=new Map<string,{expires:number;csrf:string}>();
  private key(token:string){return createHash('sha256').update(token).digest('hex');}
  create(now=Date.now()){
    this.prune(now);
    if(this.values.size>=20) throw new Error('Session limit');
    const token=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');
    this.values.set(this.key(token),{expires:now+3600000,csrf});return {token,csrf};
  }
  get(token:string,now=Date.now()){
    const value=this.values.get(this.key(token));
    if(!value||value.expires<=now){this.revoke(token);return null;}return value;
  }
  revoke(token:string){this.values.delete(this.key(token));}
  prune(now=Date.now()){for(const [key,v] of this.values)if(v.expires<=now)this.values.delete(key);}
}
