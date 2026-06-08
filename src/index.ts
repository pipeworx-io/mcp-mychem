interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * MyChem.info MCP.
 * Aggregated drug / chemical-compound annotation from the BioThings API:
 * ChEMBL, DrugBank, PubChem, ChEBI, DrugCentral, FDA NDC, and more, merged per compound.
 * Use to resolve a drug name (or InChIKey) to structured cross-reference identifiers
 * and to pull mechanism-of-action, indication, and pharmacology annotations.
 * Docs: https://docs.mychem.info/en/latest/
 */


const BASE = 'https://mychem.info/v1';
const UA = 'pipeworx-mcp-mychem/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'query',
    description:
      'Search MyChem.info for drugs / chemical compounds. Accepts a plain drug name ("aspirin"), an InChIKey, or a fielded query (e.g. "chembl.pref_name:aspirin", "drugbank.name:Acetylsalicylic acid"). Returns aggregated hits with cross-references to ChEMBL, DrugBank, PubChem, ChEBI, DrugCentral, etc. Use this to resolve a drug name into structured identifiers.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Drug name ("aspirin"), an InChIKey, or a fielded query like "chembl.pref_name:aspirin".',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated return fields (default: all). e.g. "chembl.pref_name,drugbank.name,pubchem".',
        },
        size: { type: 'number', description: 'Max hits to return, 1-1000 (default 10).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'chem',
    description:
      'Fetch the full aggregated annotation for a single chemical / drug by id. The id is typically an InChIKey (e.g. "BSYNRYMUTXBXSQ-UHFFFAOYSA-N"), but a DrugBank id, ChEMBL id, or other source id also works. Returns merged annotations from ChEMBL, DrugBank, PubChem, ChEBI, DrugCentral, etc., including mechanism, indication, and pharmacology cross-references.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'An InChIKey like "BSYNRYMUTXBXSQ-UHFFFAOYSA-N", or a DrugBank / ChEMBL id.',
        },
        fields: {
          type: 'string',
          description: 'Comma-separated return fields (default: all).',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'metadata',
    description: 'Dataset statistics and source/release metadata for MyChem.info.',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'query': {
        const p = new URLSearchParams({
          q: reqStr(args, 'query', '"aspirin"'),
          size: String(Math.min(1000, Math.max(1, (args.size as number) ?? 10))),
        });
        if (args.fields) p.set('fields', String(args.fields));
        const data = (await mGet(`/query?${p}`)) as { total?: number; hits?: unknown[] };
        return { total: data.total, hits: data.hits ?? [] };
      }
      case 'chem': {
        const id = reqStr(args, 'id', '"BSYNRYMUTXBXSQ-UHFFFAOYSA-N"');
        const p = new URLSearchParams();
        if (args.fields) p.set('fields', String(args.fields));
        const qs = p.toString() ? `?${p}` : '';
        const res = await fetch(`${BASE}/chem/${encodeURIComponent(id)}${qs}`, {
          headers: { Accept: 'application/json', 'User-Agent': UA },
        });
        if (res.status === 404) return { error: 'chemical not found', id };
        if (!res.ok) return { error: `MyChem: ${res.status}` };
        return res.json();
      }
      case 'metadata':
        return mGet('/metadata');
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function mGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`MyChem: ${res.status}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim())
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
