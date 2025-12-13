/**
 * Core types for MCP Test Kit
 */

/**
 * Transport type for MCP communication
 */
export type TransportType = 'stdio' | 'sse' | 'http';

/**
 * Configuration for creating an MCP test client
 */
export interface MCPTestClientConfig {
  /**
   * Command to execute the MCP server
   * @example 'node'
   */
  command: string;

  /**
   * Arguments to pass to the command
   * @example ['dist/server.js']
   */
  args?: string[];

  /**
   * Environment variables for the server process
   */
  env?: Record<string, string>;

  /**
   * Timeout for operations in milliseconds
   * @default 5000
   */
  timeout?: number;

  /**
   * Transport type to use
   * @default 'stdio'
   */
  transport?: TransportType;

  /**
   * Server URL (required for SSE and HTTP transports)
   */
  serverUrl?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * MCP Tool definition
 */
export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: 'object';
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * MCP Resource definition
 */
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

/**
 * MCP Prompt definition
 */
export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

/**
 * MCP Tool call result
 */
export interface MCPToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

/**
 * MCP Resource content
 */
export interface MCPResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
}

/**
 * MCP Error
 */
export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * MCP Protocol version
 */
export type MCPProtocolVersion = '2024-11-05' | string;

/**
 * Server capabilities
 */
export interface MCPServerCapabilities {
  tools?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  prompts?: Record<string, unknown>;
  logging?: Record<string, unknown>;
}

/**
 * Initialize result
 */
export interface MCPInitializeResult {
  protocolVersion: MCPProtocolVersion;
  capabilities: MCPServerCapabilities;
  serverInfo: {
    name: string;
    version: string;
  };
}

/**
 * Mock tool handler function
 */
export type MockToolHandler = (args: Record<string, unknown>) => Promise<MCPToolResult> | MCPToolResult;

/**
 * Mock resource handler function
 */
export type MockResourceHandler = (uri: string) => Promise<MCPResourceContent> | MCPResourceContent;

/**
 * Snapshot options
 */
export interface SnapshotOptions {
  /**
   * Properties to exclude from snapshot
   */
  exclude?: string[];

  /**
   * Properties to include in snapshot
   */
  properties?: string[];

  /**
   * Custom serializer function
   */
  serializer?: (value: unknown) => string;
}

/**
 * Test client interface
 */
export interface IMCPTestClient {
  /**
   * Connect to the MCP server
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the MCP server
   */
  disconnect(): Promise<void>;

  /**
   * List available tools
   */
  listTools(): Promise<MCPTool[]>;

  /**
   * Call a tool
   */
  callTool(name: string, args?: Record<string, unknown>): Promise<MCPToolResult>;

  /**
   * List available resources
   */
  listResources(): Promise<MCPResource[]>;

  /**
   * Read a resource
   */
  readResource(uri: string): Promise<MCPResourceContent>;

  /**
   * List available prompts
   */
  listPrompts(): Promise<MCPPrompt[]>;

  /**
   * Get a prompt
   */
  getPrompt(name: string, args?: Record<string, unknown>): Promise<unknown>;
}
