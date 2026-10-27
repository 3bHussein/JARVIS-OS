import {join} from 'node:path';
import { makeServer } from './server.ts';
const port=Number(process.env.JARVIS_PORT||4310);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid port');
const server=makeServer({origin:process.env.JARVIS_ORIGIN||'http://127.0.0.1:5173',passwordHash:process.env.JARVIS_PASSWORD_HASH||'',vaultDirectory:join(process.cwd(),'.jarvis-data'),githubToken:process.env.GITHUB_TOKEN,audit:event=>console.log(JSON.stringify(event))});
server.requestTimeout=15000;server.headersTimeout=10000;server.maxHeadersCount=50;
server.listen(port,'127.0.0.1',()=>console.log(`JARVIS local API listening on 127.0.0.1:${port}. Not a production service.`));
