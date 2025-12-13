/**
 * MCP Test Kit - Testing framework for Model Context Protocol servers
 * 
 * @packageDocumentation
 */

// Core client
export { MCPTestClient, createMCPTestClient } from './client/MCPTestClient.js';

// Types
export type {
  MCPTestClientConfig,
  TransportType,
  MCPTool,
  MCPResource,
  MCPPrompt,
  MCPToolResult,
  MCPResourceContent,
  MCPError,
  MCPProtocolVersion,
  MCPServerCapabilities,
  MCPInitializeResult,
  IMCPTestClient,
  MockToolHandler,
  MockResourceHandler,
  SnapshotOptions,
} from './types/index.js';

// Mocks (exported separately via /mocks subpath)
// Matchers (exported separately via /matchers subpath)
