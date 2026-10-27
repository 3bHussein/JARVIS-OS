export interface Transcript { text: string; final: boolean; confidence?: number; language?: string; }
export interface STTAdapter { id: string; location: 'local'|'cloud'; transcribe(audio: Blob, signal: AbortSignal): AsyncIterable<Transcript>; }
export interface TTSAdapter { id: string; speak(text: string, language: string, signal: AbortSignal): Promise<void>; }
export const voicePolicy = { pushToTalk: true, wakeWord: false, storeAudio: false, sendHealthToCloud: false } as const;
export function needsTranscriptReview(transcript: Transcript) {
  return !transcript.final || !transcript.text.trim() || transcript.confidence===undefined || transcript.confidence<0.85;
}
// Voice text is always reviewed before submission. Confidence is not a guarantee.
export function normalizedWordErrorRate(reference: string, hypothesis: string) {
  const words=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}]/gu,' ').trim().split(/\s+/).filter(Boolean);
  const a=words(reference),b=words(hypothesis);
  if(!a.length) throw new Error('Reference cannot be empty');
  let row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1));row=next;}
  return row[b.length]/a.length;
}
