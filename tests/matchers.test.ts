/**
 * Comprehensive tests for custom MCP matchers
 */

import { describe, it, expect } from 'vitest';
import '../src/matchers/index';
import type { MCPTool, MCPResource, MCPToolResult, MCPError } from '../src/types/index';

describe('toBeValidMCPTool', () => {
  it('should pass for valid MCP tool', () => {
    const validTool: MCPTool = {
      name: 'test-tool',
      description: 'A test tool',
      inputSchema: {
        type: 'object',
        properties: {
          param: { type: 'string' },
        },
      },
    };

    expect(validTool).toBeValidMCPTool();
  });

  it('should fail for non-object values', () => {
    expect(() => expect(null).toBeValidMCPTool()).toThrow();
    expect(() => expect(undefined).toBeValidMCPTool()).toThrow();
    expect(() => expect('string').toBeValidMCPTool()).toThrow();
    expect(() => expect(123).toBeValidMCPTool()).toThrow();
  });

  it('should fail for tool without name', () => {
    const invalidTool = {
      inputSchema: { type: 'object' },
    };
    expect(() => expect(invalidTool).toBeValidMCPTool()).toThrow();
  });

  it('should fail for tool with empty name', () => {
    const invalidTool = {
      name: '',
      inputSchema: { type: 'object' },
    };
    expect(() => expect(invalidTool).toBeValidMCPTool()).toThrow();
  });

  it('should fail for tool with whitespace-only name', () => {
    const invalidTool = {
      name: '   ',
      inputSchema: { type: 'object' },
    };
    expect(() => expect(invalidTool).toBeValidMCPTool()).toThrow();
  });

  it('should fail for tool without inputSchema', () => {
    const invalidTool = {
      name: 'test',
    };
    expect(() => expect(invalidTool).toBeValidMCPTool()).toThrow();
  });

  it('should fail for tool with non-object inputSchema', () => {
    const invalidTool = {
      name: 'test',
      inputSchema: 'not an object',
    };
    expect(() => expect(invalidTool).toBeValidMCPTool()).toThrow();
  });

  it('should fail for tool with inputSchema type !== object', () => {
    const invalidTool = {
      name: 'test',
      inputSchema: { type: 'string' },
    };
    expect(() => expect(invalidTool).toBeValidMCPTool()).toThrow();
  });
});

describe('toBeValidMCPResource', () => {
  it('should pass for valid MCP resource', () => {
    const validResource: MCPResource = {
      uri: 'file:///test.txt',
      name: 'test-resource',
      description: 'A test resource',
    };

    expect(validResource).toBeValidMCPResource();
  });

  it('should fail for non-object values', () => {
    expect(() => expect(null).toBeValidMCPResource()).toThrow();
    expect(() => expect(undefined).toBeValidMCPResource()).toThrow();
    expect(() => expect('string').toBeValidMCPResource()).toThrow();
  });

  it('should fail for resource without uri', () => {
    const invalidResource = {
      name: 'test',
    };
    expect(() => expect(invalidResource).toBeValidMCPResource()).toThrow();
  });

  it('should fail for resource with empty uri', () => {
    const invalidResource = {
      uri: '',
      name: 'test',
    };
    expect(() => expect(invalidResource).toBeValidMCPResource()).toThrow();
  });

  it('should fail for resource without name', () => {
    const invalidResource = {
      uri: 'file:///test',
    };
    expect(() => expect(invalidResource).toBeValidMCPResource()).toThrow();
  });

  it('should fail for resource with empty name', () => {
    const invalidResource = {
      uri: 'file:///test',
      name: '',
    };
    expect(() => expect(invalidResource).toBeValidMCPResource()).toThrow();
  });
});

describe('toMatchMCPToolResponse', () => {
  it('should pass for valid tool response with text content', () => {
    const validResponse: MCPToolResult = {
      content: [{ type: 'text', text: 'Test response' }],
    };
    expect(validResponse).toMatchMCPToolResponse();
  });

  it('should pass for valid tool response with image content', () => {
    const validResponse: MCPToolResult = {
      content: [{ type: 'image', data: 'base64data', mimeType: 'image/png' }],
    };
    expect(validResponse).toMatchMCPToolResponse();
  });

  it('should pass for valid tool response with resource content', () => {
    const validResponse: MCPToolResult = {
      content: [{ type: 'resource', text: 'resource data' }],
    };
    expect(validResponse).toMatchMCPToolResponse();
  });

  it('should pass for error response', () => {
    const errorResponse: MCPToolResult = {
      content: [{ type: 'text', text: 'Error occurred' }],
      isError: true,
    };
    expect(errorResponse).toMatchMCPToolResponse();
  });

  it('should fail for non-object values', () => {
    expect(() => expect(null).toMatchMCPToolResponse()).toThrow();
    expect(() => expect('string').toMatchMCPToolResponse()).toThrow();
  });

  it('should fail for response without content array', () => {
    const invalidResponse = {};
    expect(() => expect(invalidResponse).toMatchMCPToolResponse()).toThrow();
  });

  it('should fail for response with empty content array', () => {
    const invalidResponse = { content: [] };
    expect(() => expect(invalidResponse).toMatchMCPToolResponse()).toThrow();
  });

  it('should fail for response with invalid content type', () => {
    const invalidResponse = {
      content: [{ type: 'invalid', text: 'test' }],
    };
    expect(() => expect(invalidResponse).toMatchMCPToolResponse()).toThrow();
  });

  it('should validate against expected values - isError', () => {
    const response: MCPToolResult = {
      content: [{ type: 'text', text: 'test' }],
      isError: false,
    };
    expect(response).toMatchMCPToolResponse({ isError: false });
  });

  it('should fail when isError doesnt match expected', () => {
    const response: MCPToolResult = {
      content: [{ type: 'text', text: 'test' }],
      isError: true,
    };
    expect(() => expect(response).toMatchMCPToolResponse({ isError: false })).toThrow();
  });

  it('should validate content length when expected provided', () => {
    const response: MCPToolResult = {
      content: [{ type: 'text', text: 'test' }],
    };
    expect(response).toMatchMCPToolResponse({ content: [{ type: 'text', text: 'test' }] });
  });

  it('should fail when content length doesnt match expected', () => {
    const response: MCPToolResult = {
      content: [{ type: 'text', text: 'test' }],
    };
    const expected = { content: [{ type: 'text' }, { type: 'text' }] };
    expect(() => expect(response).toMatchMCPToolResponse(expected)).toThrow();
  });
});

describe('toMatchMCPError', () => {
  it('should pass for error with matching code', () => {
    const error: MCPError = {
      code: -32602,
      message: 'Invalid params',
    };
    expect(error).toMatchMCPError({ code: -32602 });
  });

  it('should pass for error with matching message string', () => {
    const error: MCPError = {
      code: -32602,
      message: 'Invalid params',
    };
    expect(error).toMatchMCPError({ code: -32602, message: 'Invalid params' });
  });

  it('should pass for error with matching message regex', () => {
    const error: MCPError = {
      code: -32602,
      message: 'Invalid params provided',
    };
    expect(error).toMatchMCPError({ code: -32602, message: /invalid/i });
  });

  it('should fail for non-object values', () => {
    expect(() => expect(null).toMatchMCPError({ code: -32602 })).toThrow();
    expect(() => expect('string').toMatchMCPError({ code: -32602 })).toThrow();
  });

  it('should fail when error code doesnt match', () => {
    const error: MCPError = {
      code: -32601,
      message: 'Method not found',
    };
    expect(() => expect(error).toMatchMCPError({ code: -32602 })).toThrow();
  });

  it('should fail when message string doesnt match', () => {
    const error: MCPError = {
      code: -32602,
      message: 'Different message',
    };
    expect(() => expect(error).toMatchMCPError({ code: -32602, message: 'Invalid params' })).toThrow();
  });

  it('should fail when message regex doesnt match', () => {
    const error: MCPError = {
      code: -32602,
      message: 'Something else',
    };
    expect(() => expect(error).toMatchMCPError({ code: -32602, message: /invalid/i })).toThrow();
  });
});

describe('toHaveMCPProtocolVersion', () => {
  it('should pass for object with matching protocol version', () => {
    const obj = {
      protocolVersion: '2024-11-05',
    };
    expect(obj).toHaveMCPProtocolVersion('2024-11-05');
  });

  it('should fail for non-object values', () => {
    expect(() => expect(null).toHaveMCPProtocolVersion('2024-11-05')).toThrow();
    expect(() => expect('string').toHaveMCPProtocolVersion('2024-11-05')).toThrow();
  });

  it('should fail when protocol version doesnt match', () => {
    const obj = {
      protocolVersion: '2024-10-01',
    };
    expect(() => expect(obj).toHaveMCPProtocolVersion('2024-11-05')).toThrow();
  });
});
