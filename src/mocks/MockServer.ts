/**
 * Mock MCP Server for testing
 */

import type { MockToolHandler, MockResourceHandler, MCPTool, MCPResource } from '../types/index.js';

/**
 * Mock tool definition
 */
export interface MockTool {
  name: string;
  description?: string;
  inputSchema?: MCPTool['inputSchema'];
  handler: MockToolHandler;
}

/**
 * Mock resource definition
 */
export interface MockResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  handler: MockResourceHandler;
}

/**
 * Mock server configuration
 */
export interface MockServerConfig {
  tools?: MockTool[];
  resources?: MockResource[];
  serverInfo?: {
    name: string;
    version: string;
  };
}

/**
 * Create a mock tool
 */
export function mockTool(
  name: string,
  handler: MockToolHandler,
  options?: {
    description?: string;
    inputSchema?: MCPTool['inputSchema'];
  }
): MockTool {
  return {
    name,
    description: options?.description,
    inputSchema: options?.inputSchema || {
      type: 'object',
      properties: {},
    },
    handler,
  };
}

/**
 * Create a mock resource
 */
export function mockResource(
  uri: string,
  name: string,
  handler: MockResourceHandler,
  options?: {
    description?: string;
    mimeType?: string;
  }
): MockResource {
  return {
    uri,
    name,
    description: options?.description,
    mimeType: options?.mimeType,
    handler,
  };
}

/**
 * Mock MCP Server class
 */
export class MockMCPServer {
  private tools: Map<string, MockTool> = new Map();
  private resources: Map<string, MockResource> = new Map();
  private serverInfo: { name: string; version: string };

  constructor(config: MockServerConfig = {}) {
    this.serverInfo = config.serverInfo || {
      name: 'mock-server',
      version: '1.0.0',
    };

    // Register tools
    if (config.tools) {
      for (const tool of config.tools) {
        this.tools.set(tool.name, tool);
      }
    }

    // Register resources
    if (config.resources) {
      for (const resource of config.resources) {
        this.resources.set(resource.uri, resource);
      }
    }
  }

  /**
   * Add a tool to the mock server
   */
  addTool(tool: MockTool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Add a resource to the mock server
   */
  addResource(resource: MockResource): void {
    this.resources.set(resource.uri, resource);
  }

  /**
   * Get all tools
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema!,
    }));
  }

  /**
   * Get all resources
   */
  getResources(): MCPResource[] {
    return Array.from(this.resources.values()).map((resource) => ({
      uri: resource.uri,
      name: resource.name,
      description: resource.description,
      mimeType: resource.mimeType,
    }));
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: Record<string, unknown>) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }
    return await tool.handler(args);
  }

  /**
   * Read a resource
   */
  async readResource(uri: string) {
    const resource = this.resources.get(uri);
    if (!resource) {
      throw new Error(`Resource '${uri}' not found`);
    }
    return await resource.handler(uri);
  }

  /**
   * Get server info
   */
  getServerInfo() {
    return this.serverInfo;
  }
}

/**
 * Create a mock MCP server
 */
export function createMockMCPServer(config: MockServerConfig = {}): MockMCPServer {
  return new MockMCPServer(config);
}
