/** A one-shot session gate: later source refreshes, tab changes and voice events cannot repeat a greeting. */
export class WelcomeGate {
 private epoch=-1;
 decide(input:{epoch:number;authenticated:boolean;quiet:boolean;ready:boolean;overview:boolean;visible:boolean;hasVoice:boolean;interacting:boolean}):'wait'|'skip'|'speak'{
  if(!input.authenticated||this.epoch===input.epoch)return 'skip';
  if(input.quiet){this.epoch=input.epoch;return 'skip';}
  if(input.interacting){this.epoch=input.epoch;return 'skip';}
  if(!input.ready||!input.overview||!input.visible||!input.hasVoice)return 'wait';
  this.epoch=input.epoch;return 'speak';
 }
 consume(epoch:number){this.epoch=epoch;}
}
