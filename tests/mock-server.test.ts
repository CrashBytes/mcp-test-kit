/**
 * Comprehensive tests for MockMCPServer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockMCPServer,
  createMockMCPServer,
  mockTool,
  mockResource,
  type MockTool,
  type MockResource,
} from '../src/mocks/index';
import type { MCPToolResult, MCPResourceContent } from '../src/types/index';

describe('mockTool utility', () => {
  it('should create a mock tool with minimal config', () => {
    const tool = mockTool('test-tool', async (args) => ({
      content: [{ type: 'text', text: 'result' }],
    }));

    expect(tool.name).toBe('test-tool');
    expect(tool.inputSchema).toEqual({ type: 'object', properties: {} });
  });

  it('should create a mock tool with description', () => {
    const tool = mockTool('test-tool', async () => ({ content: [] }), {
      description: 'A test tool',
    });

    expect(tool.description).toBe('A test tool');
  });

  it('should create a mock tool with custom inputSchema', () => {
    const schema = {
      type: 'object' as const,
      properties: { param: { type: 'string' } },
    };

    const tool = mockTool('test-tool', async () => ({ content: [] }), {
      inputSchema: schema,
    });

    expect(tool.inputSchema).toEqual(schema);
  });
});

describe('mockResource utility', () => {
  it('should create a mock resource with minimal config', () => {
    const resource = mockResource('file:///test.txt', 'test', async () => ({
      uri: 'file:///test.txt',
      text: 'content',
    }));

    expect(resource.uri).toBe('file:///test.txt');
    expect(resource.name).toBe('test');
  });

  it('should create a mock resource with description', () => {
    const resource = mockResource('file:///test.txt', 'test', async () => ({ uri: '', text: '' }), {
      description: 'A test resource',
    });

    expect(resource.description).toBe('A test resource');
  });

  it('should create a mock resource with mimeType', () => {
    const resource = mockResource('file:///test.txt', 'test', async () => ({ uri: '', text: '' }), {
      mimeType: 'text/plain',
    });

    expect(resource.mimeType).toBe('text/plain');
  });
});

describe('MockMCPServer - construction', () => {
  it('should create server with default config', () => {
    const server = new MockMCPServer();
    const info = server.getServerInfo();

    expect(info.name).toBe('mock-server');
    expect(info.version).toBe('1.0.0');
  });

  it('should create server with custom serverInfo', () => {
    const server = new MockMCPServer({
      serverInfo: { name: 'custom', version: '2.0.0' },
    });
    const info = server.getServerInfo();

    expect(info.name).toBe('custom');
    expect(info.version).toBe('2.0.0');
  });

  it('should create server with initial tools', () => {
    const tool = mockTool('test-tool', async () => ({ content: [] }));
    const server = new MockMCPServer({ tools: [tool] });
    const tools = server.getTools();

    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('test-tool');
  });

  it('should create server with initial resources', () => {
    const resource = mockResource('file:///test', 'test', async () => ({ uri: '', text: '' }));
    const server = new MockMCPServer({ resources: [resource] });
    const resources = server.getResources();

    expect(resources).toHaveLength(1);
    expect(resources[0].uri).toBe('file:///test');
  });
});

describe('MockMCPServer - tools management', () => {
  let server: MockMCPServer;

  beforeEach(() => {
    server = new MockMCPServer();
  });

  it('should add tool dynamically', () => {
    const tool = mockTool('new-tool', async () => ({ content: [] }));
    server.addTool(tool);

    const tools = server.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('new-tool');
  });
});
