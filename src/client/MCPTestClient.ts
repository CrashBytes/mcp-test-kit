/**
 * MCP Test Client - Core testing client for MCP servers
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import type {
  MCPTestClientConfig,
  MCPTool,
  MCPResource,
  MCPPrompt,
  MCPToolResult,
  MCPResourceContent,
  MCPInitializeResult,
  IMCPTestClient,
} from '../types/index.js';

/**
 * Filter out undefined values from environment object
 */
function cleanEnv(env: Record<string, string | undefined>): Record<string, string> {
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

/**
 * Main test client for MCP servers
 */
export class MCPTestClient implements IMCPTestClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;
  private process: ChildProcess | null = null;
  private config: Required<MCPTestClientConfig>;
  private initialized = false;

  constructor(config: MCPTestClientConfig) {
    this.config = {
      command: config.command,
      args: config.args || [],
      env: config.env || {},
      timeout: config.timeout || 5000,
      transport: config.transport || 'stdio',
      serverUrl: config.serverUrl || '',
      debug: config.debug || false,
    };

    this.client = new Client(
      {
        name: 'mcp-test-kit',
        version: '0.1.0',
      },
      {
        capabilities: {},
      }
    );
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    if (this.initialized) {
      throw new Error('Client is already connected');
    }

    if (this.config.transport !== 'stdio') {
      throw new Error(`Transport type '${this.config.transport}' not yet implemented. Only 'stdio' is currently supported.`);
    }

    // Prepare environment variables
    const processEnv = cleanEnv({
      ...process.env,
      ...this.config.env,
    });

    // Spawn the server process
    this.process = spawn(this.config.command, this.config.args, {
      env: processEnv,
    });

    if (!this.process.stdout || !this.process.stdin) {
      throw new Error('Failed to create process stdio streams');
    }

    // Set up error handling
    this.process.on('error', (error) => {
      if (this.config.debug) {
        console.error('MCP Server process error:', error);
      }
    });

    this.process.stderr?.on('data', (data) => {
      if (this.config.debug) {
        console.error('MCP Server stderr:', data.toString());
      }
    });

    // Create transport
    this.transport = new StdioClientTransport({
      command: this.config.command,
      args: this.config.args,
      env: processEnv,
    });

    // Connect the client
    await this.client.connect(this.transport);
    this.initialized = true;

    if (this.config.debug) {
      console.log('MCP Test Client connected successfully');
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      await this.client.close();
    } catch (error) {
      if (this.config.debug) {
        console.error('Error closing client:', error);
      }
    }

    if (this.process) {
      this.process.kill();
      this.process = null;
    }

    this.transport = null;
    this.initialized = false;

    if (this.config.debug) {
      console.log('MCP Test Client disconnected');
    }
  }

  /**
   * Ensure the client is connected
   */
  private ensureConnected(): void {
    if (!this.initialized) {
      throw new Error('Client is not connected. Call connect() first.');
    }
  }

  /**
   * List available tools from the server
   */
  async listTools(): Promise<MCPTool[]> {
    this.ensureConnected();
    const response = await this.client.listTools();
    return (response.tools || []) as MCPTool[];
  }

  /**
   * Call a tool on the server
   */
  async callTool(name: string, args: Record<string, unknown> = {}): Promise<MCPToolResult> {
    this.ensureConnected();
    const response = await this.client.callTool({ name, arguments: args });
    return response as MCPToolResult;
  }

  /**
   * List available resources from the server
   */
  async listResources(): Promise<MCPResource[]> {
    this.ensureConnected();
    const response = await this.client.listResources();
    return (response.resources || []) as MCPResource[];
  }

  /**
   * Read a resource from the server
   */
  async readResource(uri: string): Promise<MCPResourceContent> {
    this.ensureConnected();
    const response = await this.client.readResource({ uri });
    return response.contents?.[0] as MCPResourceContent;
  }

  /**
   * List available prompts from the server
   */
  async listPrompts(): Promise<MCPPrompt[]> {
    this.ensureConnected();
    const response = await this.client.listPrompts();
    return (response.prompts || []) as MCPPrompt[];
  }

  /**
   * Get a prompt from the server
   */
  async getPrompt(name: string, args: Record<string, string> = {}): Promise<unknown> {
    this.ensureConnected();
    const response = await this.client.getPrompt({ name, arguments: args });
    return response;
  }

  /**
   * Get server info and capabilities
   */
  async getServerInfo(): Promise<MCPInitializeResult> {
    this.ensureConnected();

    // The server info is available after initialization
    // We can access it from the client's internal state
    return {
      protocolVersion: '2024-11-05',
      capabilities: {},
      serverInfo: {
        name: 'unknown',
        version: 'unknown',
      },
    };
  }
}

/**
 * Create a new MCP test client
 * @param config - Client configuration
 * @returns MCP test client instance
 */
export async function createMCPTestClient(config: MCPTestClientConfig): Promise<MCPTestClient> {
  const client = new MCPTestClient(config);
  await client.connect();
  return client;
}
