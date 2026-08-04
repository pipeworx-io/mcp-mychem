# mcp-mychem

MyChem.info MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `query` | Search MyChem.info for drugs / chemical compounds. Accepts a plain drug name ("aspirin"), an InChIKey, or a fielded query (e.g. "chembl.pref_name:aspirin", "drugbank.name:Acetylsalicylic acid"). Returns aggregated hits with cross-references to ChEMBL, DrugBank, PubChem, ChEBI, DrugCentral, etc. Use this to resolve a drug name into structured identifiers. |
| `chem` | Fetch the full aggregated annotation for a single chemical / drug by id. The id is typically an InChIKey (e.g. "BSYNRYMUTXBXSQ-UHFFFAOYSA-N"), but a DrugBank id, ChEMBL id, or other source id also works. Returns merged annotations from ChEMBL, DrugBank, PubChem, ChEBI, DrugCentral, etc., including mechanism, indication, and pharmacology cross-references. |
| `metadata` | Returns MyChem.info build metadata: total indexed compound count, available annotation sources (ChEMBL, DrugBank, PubChem, ChEBI, DrugCentral, FDA NDC), and their current release versions. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "mychem": {
      "url": "https://gateway.pipeworx.io/mychem/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Mychem data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
