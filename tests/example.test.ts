/**
 * Example test demonstrating MCP Test Kit usage
 * This would be in a user's project testing their MCP server
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMCPTestClient } from '../src/index';
import type { MCPTestClient } from '../src/client/MCPTestClient';
import '../src/matchers/index';

describe('MCP Test Kit - Basic Usage Example', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    // This would point to the user's compiled MCP server
    // For now, we'll skip this test since we don't have a server built
  });

  afterAll(async () => {
    if (client) {
      await client.disconnect();
    }
  });

  it.skip('should demonstrate basic tool testing', async () => {
    // Example of how users would test their MCP server
    client = await createMCPTestClient({
      command: 'node',
      args: ['examples/weather-server/dist/server.js'],
    });

    // List tools
    const tools = await client.listTools();
    expect(tools).toHaveLength(1);
    expect(tools[0]).toBeValidMCPTool();
    expect(tools[0].name).toBe('get-weather');

    // Call tool
    const result = await client.callTool('get-weather', {
      city: 'San Francisco',
    });

    expect(result).toMatchMCPToolResponse();
    expect(result.content[0].text).toContain('temperature');
  });

  it.skip('should demonstrate error handling', async () => {
    client = await createMCPTestClient({
      command: 'node',
      args: ['examples/weather-server/dist/server.js'],
    });

    // Test error handling
    await expect(
      client.callTool('get-weather', { city: '' })
    ).rejects.toMatchObject({
      code: -32602,
    });
  });
});

describe('MCP Test Kit - Matchers', () => {
  it('should validate MCP tool structure', () => {
    const validTool = {
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

  it('should validate MCP resource structure', () => {
    const validResource = {
      uri: 'file:///test.txt',
      name: 'test-resource',
      description: 'A test resource',
    };

    expect(validResource).toBeValidMCPResource();
  });

  it('should validate MCP tool response structure', () => {
    const validResponse = {
      content: [
        {
          type: 'text',
          text: 'Test response',
        },
      ],
    };

    expect(validResponse).toMatchMCPToolResponse();
  });

  it('should validate MCP errors', () => {
    const mcpError = {
      code: -32602,
      message: 'Invalid params',
    };

    expect(mcpError).toMatchMCPError({
      code: -32602,
      message: /invalid/i,
    });
  });
});
