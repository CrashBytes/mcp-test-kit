/**
 * Custom Vitest matchers for MCP testing
 */

import { expect } from 'vitest';
import type { MCPTool, MCPResource, MCPToolResult, MCPError } from '../types/index.js';

/**
 * Check if a tool is a valid MCP tool
 */
function toBeValidMCPTool(received: unknown): { pass: boolean; message: () => string } {
  const tool = received as Partial<MCPTool>;

  if (!tool || typeof tool !== 'object') {
    return {
      pass: false,
      message: () => `Expected a valid MCP tool object, but received ${typeof received}`,
    };
  }

  if (typeof tool.name !== 'string' || tool.name.trim() === '') {
    return {
      pass: false,
      message: () => `Expected tool to have a non-empty name, but received: ${tool.name}`,
    };
  }

  if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
    return {
      pass: false,
      message: () => `Expected tool to have an inputSchema object, but received: ${typeof tool.inputSchema}`,
    };
  }

  if (tool.inputSchema.type !== 'object') {
    return {
      pass: false,
      message: () => `Expected inputSchema.type to be 'object', but received: ${tool.inputSchema?.type || 'undefined'}`,
    };
  }

  return {
    pass: true,
    message: () => `Expected ${tool.name} not to be a valid MCP tool`,
  };
}

/**
 * Check if a resource is a valid MCP resource
 */
function toBeValidMCPResource(received: unknown): { pass: boolean; message: () => string } {
  const resource = received as Partial<MCPResource>;

  if (!resource || typeof resource !== 'object') {
    return {
      pass: false,
      message: () => `Expected a valid MCP resource object, but received ${typeof received}`,
    };
  }

  if (typeof resource.uri !== 'string' || resource.uri.trim() === '') {
    return {
      pass: false,
      message: () => `Expected resource to have a non-empty uri, but received: ${resource.uri}`,
    };
  }

  if (typeof resource.name !== 'string' || resource.name.trim() === '') {
    return {
      pass: false,
      message: () => `Expected resource to have a non-empty name, but received: ${resource.name}`,
    };
  }

  return {
    pass: true,
    message: () => `Expected ${resource.name} not to be a valid MCP resource`,
  };
}

/**
 * Check if a response matches the expected MCP tool response structure
 */
function toMatchMCPToolResponse(
  received: unknown,
  expected?: Partial<MCPToolResult>
): { pass: boolean; message: () => string } {
  const result = received as Partial<MCPToolResult>;

  if (!result || typeof result !== 'object') {
    return {
      pass: false,
      message: () => `Expected a valid MCP tool result object, but received ${typeof received}`,
    };
  }

  if (!Array.isArray(result.content)) {
    return {
      pass: false,
      message: () => `Expected result.content to be an array, but received: ${typeof result.content}`,
    };
  }

  if (result.content.length === 0) {
    return {
      pass: false,
      message: () => 'Expected result.content to have at least one item, but received an empty array',
    };
  }

  // Check content items
  for (const item of result.content) {
    if (!item.type || !['text', 'image', 'resource'].includes(item.type)) {
      return {
        pass: false,
        message: () => `Expected content item to have a valid type (text, image, or resource), but received: ${item.type}`,
      };
    }
  }

  // If expected values are provided, check them
  if (expected) {
    if (expected.isError !== undefined && result.isError !== expected.isError) {
      return {
        pass: false,
        message: () => `Expected isError to be ${expected.isError}, but received: ${result.isError}`,
      };
    }

    if (expected.content && result.content) {
      const expectedLength = expected.content.length;
      const actualLength = result.content.length;
      if (expectedLength !== actualLength) {
        return {
          pass: false,
          message: () => `Expected ${expectedLength} content items, but received: ${actualLength}`,
        };
      }
    }
  }

  return {
    pass: true,
    message: () => 'Expected result not to match MCP tool response structure',
  };
}

/**
 * Check if an error matches the expected MCP error
 */
function toMatchMCPError(
  received: unknown,
  expected: Partial<MCPError> & { message?: string | RegExp }
): { pass: boolean; message: () => string } {
  const error = received as Partial<MCPError>;

  if (!error || typeof error !== 'object') {
    return {
      pass: false,
      message: () => `Expected a valid MCP error object, but received ${typeof received}`,
    };
  }

  if (expected.code !== undefined && error.code !== expected.code) {
    return {
      pass: false,
      message: () => `Expected error code ${expected.code}, but received: ${error.code}`,
    };
  }

  if (expected.message !== undefined) {
    if (typeof expected.message === 'string') {
      if (error.message !== expected.message) {
        return {
          pass: false,
          message: () => `Expected error message "${expected.message}", but received: "${error.message}"`,
        };
      }
    } else {
      // Must be RegExp
      const pattern = expected.message as RegExp;
      if (!pattern.test(error.message || '')) {
        return {
          pass: false,
          message: () => `Expected error message to match ${pattern}, but received: "${error.message}"`,
        };
      }
    }
  }

  return {
    pass: true,
    message: () => 'Expected error not to match MCP error',
  };
}

/**
 * Check if the protocol version matches
 */
function toHaveMCPProtocolVersion(
  received: unknown,
  expectedVersion: string
): { pass: boolean; message: () => string } {
  const obj = received as { protocolVersion?: string };

  if (!obj || typeof obj !== 'object') {
    return {
      pass: false,
      message: () => `Expected an object with protocolVersion, but received ${typeof received}`,
    };
  }

  if (obj.protocolVersion !== expectedVersion) {
    return {
      pass: false,
      message: () => `Expected protocol version ${expectedVersion}, but received: ${obj.protocolVersion}`,
    };
  }

  return {
    pass: true,
    message: () => `Expected protocol version not to be ${expectedVersion}`,
  };
}

/**
 * Register all custom matchers with Vitest
 */
export function registerVitestMatchers(): void {
  expect.extend({
    toBeValidMCPTool,
    toBeValidMCPResource,
    toMatchMCPToolResponse,
    toMatchMCPError,
    toHaveMCPProtocolVersion,
  });
}

// Auto-register matchers when imported
registerVitestMatchers();

// Type declarations for TypeScript
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidMCPTool(): T;
    toBeValidMCPResource(): T;
    toMatchMCPToolResponse(expected?: Partial<MCPToolResult>): T;
    toMatchMCPError(expected: Partial<MCPError> & { message?: string | RegExp }): T;
    toHaveMCPProtocolVersion(version: string): T;
  }

  interface AsymmetricMatchersContaining {
    toBeValidMCPTool(): any;
    toBeValidMCPResource(): any;
    toMatchMCPToolResponse(expected?: Partial<MCPToolResult>): any;
    toMatchMCPError(expected: Partial<MCPError> & { message?: string | RegExp }): any;
    toHaveMCPProtocolVersion(version: string): any;
  }
}
